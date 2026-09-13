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
import { Select } from "../ui/select";
import { FieldMessage } from "../ui/field-message";
import { activitySchema, type ActivityFormValues } from "./activitySchema";
import { ACTIVITY_LIMITS, ACTIVITY_TEMPLATES, getActivityTemplate } from "./activityTemplates";
import { ActivitySynthesisPreview } from "./ActivitySynthesisPreview";
import { CharacterCounter } from "./CharacterCounter";
import { PhotoUploader } from "./PhotoUploader";

export function ActivityForm({ closed = false }: { closed?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
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
      templateKey: "acao_evento",
      title: "",
      date: "",
      location: "",
      summary: "",
      result: "",
      beneficiaries: "",
      evidence: "",
      nextStep: "",
      internalNotes: "",
      area: "",
      managerId: "",
      mainPhoto: undefined,
      additionalPhotos: [],
    },
  });
  const values = useWatch({ control: form.control });

  useEffect(() => {
    if (!cycle) return;
    const today = new Date().toISOString().slice(0, 10);
    const initialDate = today < cycle.startsAt || today > cycle.endsAt ? cycle.endsAt : today;
    form.setValue("date", initialDate);
  }, [cycle, form]);

  useEffect(() => {
    if (!user) return;
    form.setValue("area", user.area ?? "");
    form.setValue("managerId", user.id);
  }, [form, user]);

  if (closed || (!cycles.isLoading && (!cycle || cycle.status === "encerrada"))) {
    return (
      <div className="rounded-app border border-warning bg-white p-6 text-text shadow-subtle">
        Os relatos desta semana foram encerrados. Entre em contato com a gerência caso seja necessária a reabertura do período.
      </div>
    );
  }

  if (user && !user.area) {
    return <div className="rounded-app border border-danger bg-white p-6 text-danger">Seu usuário precisa estar vinculado a uma área antes de registrar relatos.</div>;
  }

  const error = (field: keyof ActivityFormValues) => form.formState.errors[field]?.message?.toString();
  const templateKey = values.templateKey;
  const template = getActivityTemplate(templateKey);
  const { title, date, location, summary, result, beneficiaries, evidence, nextStep, internalNotes } = values;

  return (
    <form
      className="space-y-5 rounded-app border border-border bg-white p-5 shadow-subtle"
      onSubmit={form.handleSubmit((values) => {
        if (!cycle || !user?.area) return;
        createMutation.mutate({
          ...values,
          area: user.area as Area,
          managerId: user.id,
          photos: [values.mainPhoto, ...values.additionalPhotos],
          cycleId: cycle.id,
        });
      })}
    >
      {cycle ? (
        <div className="rounded-app border border-border bg-page p-3 text-sm text-muted">
          Período aceito: {new Date(`${cycle.startsAt}T00:00:00`).toLocaleDateString("pt-BR")} a {new Date(`${cycle.endsAt}T00:00:00`).toLocaleDateString("pt-BR")}. A primeira imagem será a foto principal.
        </div>
      ) : null}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-text">1. Escolha o modelo do relato</h2>
          <p className="text-sm text-muted">O modelo muda as perguntas, mas mantém a síntese final consistente.</p>
        </div>
        <label htmlFor="activity-template" className="block text-sm font-medium">
          Tipo de relato
          <Select id="activity-template" className="mt-1" {...form.register("templateKey")}>
            {ACTIVITY_TEMPLATES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </Select>
          <span className="mt-1 block text-xs text-muted">{template.description}</span>
        </label>
      </section>
      <section className="space-y-4 border-t border-border pt-5">
        <div>
          <h2 className="text-base font-semibold text-text">2. Identificação</h2>
          <p className="text-sm text-muted">Dados objetivos que acompanham o card.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
        <label htmlFor="activity-title" className="text-sm font-medium">
          Título da atividade
          <Input id="activity-title" className="mt-1" placeholder="Ex.: Oficina aprimora precificação de 24 negócios" aria-invalid={Boolean(error("title"))} aria-describedby={error("title") ? "activity-title-error" : undefined} {...form.register("title")} />
          <CharacterCounter value={title} limit={ACTIVITY_LIMITS.title} />
          <FieldMessage id="activity-title-error">{error("title")}</FieldMessage>
        </label>
        <label htmlFor="activity-date" className="text-sm font-medium">
          Data
          <Input id="activity-date" className="mt-1" type="date" min={cycle?.startsAt} max={cycle?.endsAt} aria-invalid={Boolean(error("date"))} aria-describedby={error("date") ? "activity-date-error" : undefined} {...form.register("date")} />
          <FieldMessage id="activity-date-error">{error("date")}</FieldMessage>
        </label>
        <label htmlFor="activity-location" className="text-sm font-medium">
          Local
          <Input id="activity-location" className="mt-1" aria-invalid={Boolean(error("location"))} aria-describedby={error("location") ? "activity-location-error" : undefined} {...form.register("location")} />
          <FieldMessage id="activity-location-error">{error("location")}</FieldMessage>
        </label>
        <label htmlFor="activity-beneficiaries" className="text-sm font-medium">
          Público beneficiado
          <Input id="activity-beneficiaries" className="mt-1" aria-invalid={Boolean(error("beneficiaries"))} aria-describedby={error("beneficiaries") ? "activity-beneficiaries-error" : undefined} {...form.register("beneficiaries")} />
          <CharacterCounter value={beneficiaries} limit={ACTIVITY_LIMITS.beneficiaries} />
          <FieldMessage id="activity-beneficiaries-error">{error("beneficiaries")}</FieldMessage>
        </label>
        <label className="text-sm font-medium">
          Área
          <Input className="mt-1" value={user?.area ?? ""} disabled />
        </label>
        <label className="text-sm font-medium">
          Gestor responsável
          <Input className="mt-1" value={user?.name ?? ""} disabled />
        </label>
        </div>
      </section>
      <section className="space-y-4 border-t border-border pt-5">
        <div>
          <h2 className="text-base font-semibold text-text">3. Conteúdo da síntese</h2>
          <p className="text-sm text-muted">Escreva apenas o essencial. Os detalhes podem ser registrados na seção seguinte.</p>
        </div>
        <label htmlFor="activity-summary" className="block text-sm font-medium">
          {template.summaryLabel}
          <span className="mt-0.5 block text-xs font-normal text-muted">{template.summaryHelp}</span>
          <Textarea id="activity-summary" className="mt-1" placeholder={template.summaryPlaceholder} aria-invalid={Boolean(error("summary"))} aria-describedby={error("summary") ? "activity-summary-error" : undefined} {...form.register("summary")} />
          <CharacterCounter value={summary} limit={ACTIVITY_LIMITS.summary} />
          <FieldMessage id="activity-summary-error">{error("summary")}</FieldMessage>
        </label>
        <label htmlFor="activity-result" className="block text-sm font-medium">
          {template.resultLabel}
          <Textarea id="activity-result" className="mt-1" placeholder={template.resultPlaceholder} aria-invalid={Boolean(error("result"))} aria-describedby={error("result") ? "activity-result-error" : undefined} {...form.register("result")} />
          <CharacterCounter value={result} limit={ACTIVITY_LIMITS.result} />
          <FieldMessage id="activity-result-error">{error("result")}</FieldMessage>
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor="activity-evidence" className="block text-sm font-medium">
            {template.evidenceLabel} <span className="font-normal text-muted">(opcional)</span>
            <Input id="activity-evidence" className="mt-1" placeholder={template.evidencePlaceholder} aria-invalid={Boolean(error("evidence"))} {...form.register("evidence")} />
            <CharacterCounter value={evidence} limit={ACTIVITY_LIMITS.evidence} />
            <FieldMessage id="activity-evidence-error">{error("evidence")}</FieldMessage>
          </label>
          <label htmlFor="activity-next-step" className="block text-sm font-medium">
            {template.nextStepLabel} <span className="font-normal text-muted">(opcional)</span>
            <Input id="activity-next-step" className="mt-1" placeholder={template.nextStepPlaceholder} aria-invalid={Boolean(error("nextStep"))} {...form.register("nextStep")} />
            <CharacterCounter value={nextStep} limit={ACTIVITY_LIMITS.nextStep} />
            <FieldMessage id="activity-next-step-error">{error("nextStep")}</FieldMessage>
          </label>
        </div>
        <ActivitySynthesisPreview templateKey={templateKey} title={title} date={date} location={location} summary={summary} result={result} beneficiaries={beneficiaries} evidence={evidence} nextStep={nextStep} />
      </section>
      <section className="space-y-4 border-t border-border pt-5">
        <div>
          <h2 className="text-base font-semibold text-text">4. Informações complementares</h2>
          <p className="text-sm text-muted">Este conteúdo ajuda a gerente na conferência, mas não será publicado automaticamente.</p>
        </div>
        <label htmlFor="activity-internal-notes" className="block text-sm font-medium">
          Notas para consulta <span className="font-normal text-muted">(opcional)</span>
          <Textarea id="activity-internal-notes" className="mt-1 min-h-36" placeholder="Registre contexto, links, nomes ou detalhes que não precisam aparecer na síntese." aria-invalid={Boolean(error("internalNotes"))} {...form.register("internalNotes")} />
          <CharacterCounter value={internalNotes} limit={ACTIVITY_LIMITS.internalNotes} />
          <FieldMessage id="activity-internal-notes-error">{error("internalNotes")}</FieldMessage>
        </label>
      </section>
      <PhotoUploader
        label="Foto principal"
        files={mainFiles}
        onAdd={(files) => {
          setMainFiles(files.slice(0, 1));
          form.setValue("mainPhoto", files[0], { shouldValidate: true });
        }}
        onRemove={() => {
          setMainFiles([]);
          form.resetField("mainPhoto");
        }}
        error={error("mainPhoto")}
      />
      <PhotoUploader
        label="Fotos adicionais"
        multiple
        files={additionalFiles}
        onAdd={(files) => {
          const next = [...additionalFiles, ...files];
          setAdditionalFiles(next);
          form.setValue("additionalPhotos", next, { shouldValidate: true });
        }}
        onRemove={(index) => {
          const next = additionalFiles.filter((_, itemIndex) => itemIndex !== index);
          setAdditionalFiles(next);
          form.setValue("additionalPhotos", next, { shouldValidate: true });
        }}
        error={error("additionalPhotos")}
      />
      {createMutation.isError ? <p role="alert" className="rounded-app border border-danger p-3 text-sm text-danger">{createMutation.error.message}</p> : null}
      <Button type="submit" loading={createMutation.isPending} disabled={cycles.isLoading || !cycle}>
        <Save size={16} aria-hidden />
        Salvar atividade
      </Button>
    </form>
  );
}
