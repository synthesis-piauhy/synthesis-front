"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";
import type { Area } from "@/types";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { FieldMessage } from "../ui/field-message";
import { activitySchema, type ActivityFormValues } from "./activitySchema";
import { ACTIVITY_LIMITS, getActivityTemplate, type ActivityTemplateKey } from "./activityTemplates";
import { generateActivityText, guidedAnswersComplete, type GuidedAnswers } from "./guidedActivity";
import { GuidedQuestions } from "./GuidedQuestions";
import { ActivitySynthesisPreview } from "./ActivitySynthesisPreview";
import { CharacterCounter } from "./CharacterCounter";
import { PhotoUploader } from "./PhotoUploader";

export function ActivityForm({ templateKey, closed = false }: { templateKey: ActivityTemplateKey; closed?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<GuidedAnswers>({});
  const [edited, setEdited] = useState<Set<string>>(new Set());
  const [guideError, setGuideError] = useState("");
  const [mainFiles, setMainFiles] = useState<File[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const cycle = currentCycle(cycles.data);
  const createMutation = useMutation({
    mutationFn: api.createActivityReport,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["activityReports"] });
      router.push(`/relatos/${created.id}`);
    },
  });
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      templateKey, title: "", date: "", location: "", summary: "", result: "", beneficiaries: "",
      evidence: "", nextStep: "", internalNotes: "", area: "", managerId: "",
      mainPhoto: undefined, additionalPhotos: [],
    },
  });
  const values = useWatch({ control: form.control });
  const template = getActivityTemplate(templateKey);
  const error = (field: keyof ActivityFormValues) => form.formState.errors[field]?.message?.toString();

  useEffect(() => {
    if (!cycle) return;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    form.setValue("date", today < cycle.startsAt || today > cycle.endsAt ? cycle.endsAt : today);
  }, [cycle, form]);
  useEffect(() => {
    if (!user) return;
    form.setValue("area", user.area ?? "");
    form.setValue("managerId", user.id);
  }, [form, user]);

  function applyGenerated(next: GuidedAnswers, force = false) {
    if (!guidedAnswersComplete(templateKey, next)) return;
    const generated = generateActivityText(templateKey, next);
    for (const field of ["title", "summary", "result", "beneficiaries"] as const) {
      if (force || !edited.has(field)) form.setValue(field, generated[field], { shouldValidate: true });
    }
    if (force) setEdited(new Set());
    setGuideError("");
  }
  function updateAnswers(next: GuidedAnswers) {
    setAnswers(next);
    applyGenerated(next);
  }
  function markEdited(field: string) {
    setEdited((previous) => new Set(previous).add(field));
  }

  if (closed || (!cycles.isLoading && (!cycle || cycle.status === "encerrada"))) {
    return <div className="rounded-app border border-warning bg-white p-6 text-text shadow-subtle">Os relatos desta semana foram encerrados. Entre em contato com a gerência caso seja necessária a reabertura do período.</div>;
  }
  if (user && !user.area) {
    return <div className="rounded-app border border-danger bg-white p-6 text-danger">Seu usuário precisa estar vinculado a uma área antes de registrar relatos.</div>;
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((data) => {
      if (!guidedAnswersComplete(templateKey, answers)) {
        setGuideError("Responda às perguntas obrigatórias para continuar.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!cycle || !user?.area) return;
      createMutation.mutate({ ...data, templateKey, guidedAnswers: answers, area: user.area as Area,
        managerId: user.id, photos: [data.mainPhoto, ...data.additionalPhotos], cycleId: cycle.id });
    }, () => {
      if (!guidedAnswersComplete(templateKey, answers)) setGuideError("Responda às perguntas obrigatórias para continuar.");
    })}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-app border border-border bg-white p-4 shadow-subtle">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-secondary">Categoria escolhida</p><p className="font-semibold text-text">{template.label}</p><p className="text-xs text-muted">{template.description}</p></div>
      </div>
      <GuidedQuestions templateKey={templateKey} answers={answers} onChange={updateAnswers} onGenerate={() => applyGenerated(answers, true)} error={guideError} />
      <section className="space-y-4 rounded-app border border-border bg-white p-5 shadow-subtle">
        <div><h2 className="text-base font-semibold text-text">Quando e onde?</h2><p className="text-sm text-muted">A data deve estar no período de coleta.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor="activity-date" className="text-sm font-medium">Data
            <Input id="activity-date" className="mt-1" type="date" min={cycle?.startsAt} max={cycle?.endsAt} aria-invalid={Boolean(error("date"))} {...form.register("date")} />
            <FieldMessage id="activity-date-error">{error("date")}</FieldMessage>
          </label>
          <label htmlFor="activity-location" className="text-sm font-medium">Local
            <Input id="activity-location" className="mt-1" placeholder="Ex.: Unidade Centro" aria-invalid={Boolean(error("location"))} {...form.register("location")} />
            <FieldMessage id="activity-location-error">{error("location")}</FieldMessage>
          </label>
        </div>
      </section>
      <section className="space-y-4 rounded-app border border-border bg-white p-5 shadow-subtle">
        <div><h2 className="text-base font-semibold text-text">Revise o texto gerado</h2><p className="text-sm text-muted">Pode ajustar qualquer frase antes de salvar. As alterações serão usadas no relatório.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor="activity-title" className="text-sm font-medium">Título
            <Input id="activity-title" className="mt-1" aria-invalid={Boolean(error("title"))} {...form.register("title", { onChange: () => markEdited("title") })} />
            <CharacterCounter value={values.title} limit={ACTIVITY_LIMITS.title} /><FieldMessage id="activity-title-error">{error("title")}</FieldMessage>
          </label>
          <label htmlFor="activity-beneficiaries" className="text-sm font-medium">Público beneficiado
            <Input id="activity-beneficiaries" className="mt-1" aria-invalid={Boolean(error("beneficiaries"))} {...form.register("beneficiaries", { onChange: () => markEdited("beneficiaries") })} />
            <CharacterCounter value={values.beneficiaries} limit={ACTIVITY_LIMITS.beneficiaries} /><FieldMessage id="activity-beneficiaries-error">{error("beneficiaries")}</FieldMessage>
          </label>
        </div>
        <label htmlFor="activity-summary" className="block text-sm font-medium">{template.summaryLabel}
          <Textarea id="activity-summary" className="mt-1 min-h-20" aria-invalid={Boolean(error("summary"))} {...form.register("summary", { onChange: () => markEdited("summary") })} />
          <CharacterCounter value={values.summary} limit={ACTIVITY_LIMITS.summary} /><FieldMessage id="activity-summary-error">{error("summary")}</FieldMessage>
        </label>
        <label htmlFor="activity-result" className="block text-sm font-medium">{template.resultLabel}
          <Textarea id="activity-result" className="mt-1 min-h-20" aria-invalid={Boolean(error("result"))} {...form.register("result", { onChange: () => markEdited("result") })} />
          <CharacterCounter value={values.result} limit={ACTIVITY_LIMITS.result} /><FieldMessage id="activity-result-error">{error("result")}</FieldMessage>
        </label>
        <ActivitySynthesisPreview templateKey={templateKey} title={values.title} date={values.date} location={values.location} summary={values.summary} result={values.result} beneficiaries={values.beneficiaries} evidence={values.evidence} nextStep={values.nextStep} />
      </section>
      <section className="space-y-4 rounded-app border border-border bg-white p-5 shadow-subtle">
        <h2 className="text-base font-semibold text-text">Foto principal <span className="text-danger">*</span></h2>
        <PhotoUploader label="Selecione a foto do relato" files={mainFiles} onAdd={(files) => { setMainFiles(files.slice(0, 1)); form.setValue("mainPhoto", files[0], { shouldValidate: true }); }} onRemove={() => { setMainFiles([]); form.resetField("mainPhoto"); }} error={error("mainPhoto")} />
      </section>
      <details className="rounded-app border border-border bg-white p-5 shadow-subtle">
        <summary className="cursor-pointer text-sm font-semibold text-secondary">Adicionar evidência, próximo passo ou informações de apoio (opcional)</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">{template.evidenceLabel}<Input className="mt-1" placeholder={template.evidencePlaceholder} {...form.register("evidence")} /><CharacterCounter value={values.evidence} limit={ACTIVITY_LIMITS.evidence} /><FieldMessage id="activity-evidence-error">{error("evidence")}</FieldMessage></label>
          <label className="text-sm font-medium">{template.nextStepLabel}<Input className="mt-1" placeholder={template.nextStepPlaceholder} {...form.register("nextStep")} /><CharacterCounter value={values.nextStep} limit={ACTIVITY_LIMITS.nextStep} /><FieldMessage id="activity-nextStep-error">{error("nextStep")}</FieldMessage></label>
          <label className="text-sm font-medium md:col-span-2">Notas para consulta<Textarea className="mt-1" placeholder="Informações que não precisam aparecer na síntese" {...form.register("internalNotes")} /><CharacterCounter value={values.internalNotes} limit={ACTIVITY_LIMITS.internalNotes} /><FieldMessage id="activity-internalNotes-error">{error("internalNotes")}</FieldMessage></label>
          <div className="md:col-span-2"><PhotoUploader label="Fotos adicionais" multiple files={additionalFiles} onAdd={(files) => { const next = [...additionalFiles, ...files]; setAdditionalFiles(next); form.setValue("additionalPhotos", next, { shouldValidate: true }); }} onRemove={(index) => { const next = additionalFiles.filter((_, i) => i !== index); setAdditionalFiles(next); form.setValue("additionalPhotos", next, { shouldValidate: true }); }} error={error("additionalPhotos")} /></div>
        </div>
      </details>
      {createMutation.isError ? <p role="alert" className="rounded-app border border-danger bg-white p-3 text-sm text-danger">{createMutation.error.message}</p> : null}
      <Button type="submit" loading={createMutation.isPending} disabled={cycles.isLoading || !cycle}><Save size={16} aria-hidden />Salvar atividade</Button>
    </form>
  );
}
