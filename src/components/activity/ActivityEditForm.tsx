"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { ActivityReport, WeeklyCycle } from "@/types";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { FieldMessage } from "../ui/field-message";
import { activityEditSchema, type ActivityEditValues } from "./activitySchema";
import { ACTIVITY_LIMITS, getActivityTemplate, type ActivityTemplateKey } from "./activityTemplates";
import { generateActivityText, guidedAnswersComplete, type GuidedAnswers } from "./guidedActivity";
import { GuidedQuestions } from "./GuidedQuestions";
import { ActivitySynthesisPreview } from "./ActivitySynthesisPreview";
import { CharacterCounter } from "./CharacterCounter";

export function ActivityEditForm({
  report,
  cycle,
  onCancel,
  onSaved,
}: {
  report: ActivityReport;
  cycle: WeeklyCycle;
  onCancel: () => void;
  onSaved: (report: ActivityReport) => void;
}) {
  const queryClient = useQueryClient();
  const templateKey = report.templateKey as ActivityTemplateKey;
  const guided = ["acao_evento", "entrega_marco", "atendimento_articulacao"].includes(templateKey);
  const [answers, setAnswers] = useState<GuidedAnswers>(report.guidedAnswers ?? {});
  const [edited, setEdited] = useState<Set<string>>(() => new Set(["title", "summary", "result", "beneficiaries"]));
  const mutation = useMutation({
    mutationFn: (values: ActivityEditValues) => api.updateOwnActivityReport(report.id, { ...values, guidedAnswers: answers }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(["activityReport", report.id], updated);
      await queryClient.invalidateQueries({ queryKey: ["activityReports"] });
      onSaved(updated);
    },
  });
  const form = useForm<ActivityEditValues>({
    resolver: zodResolver(activityEditSchema),
    defaultValues: {
      title: report.title,
      date: report.date,
      location: report.location,
      summary: report.summary,
      result: report.result,
      beneficiaries: report.beneficiaries,
      evidence: report.evidence,
      nextStep: report.nextStep,
      internalNotes: report.internalNotes,
    },
  });
  const error = (field: keyof ActivityEditValues) => form.formState.errors[field]?.message?.toString();
  const template = getActivityTemplate(report.templateKey);
  const values = useWatch({ control: form.control });

  function applyGenerated(next: GuidedAnswers, force = false) {
    if (!guided || !guidedAnswersComplete(templateKey, next)) return;
    const generated = generateActivityText(templateKey, next);
    for (const field of ["title", "summary", "result", "beneficiaries"] as const) {
      if (force || !edited.has(field)) form.setValue(field, generated[field], { shouldValidate: true });
    }
    if (force) setEdited(new Set());
  }
  function updateAnswers(next: GuidedAnswers) {
    setAnswers(next);
    applyGenerated(next);
  }
  function markEdited(field: string) {
    setEdited((previous) => new Set(previous).add(field));
  }

  return (
    <form className="space-y-5 rounded-app border border-border bg-white p-5 shadow-subtle" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <div className="rounded-app border border-border bg-page p-3 text-sm text-muted">
        Modelo: <strong>{template.label}</strong>. Fotos, área e responsável são preservados. A edição textual só é aceita enquanto o ciclo estiver aberto ou reaberto.
      </div>
      {guided ? <GuidedQuestions templateKey={templateKey} answers={answers} onChange={updateAnswers} onGenerate={() => applyGenerated(answers, true)} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label htmlFor="edit-activity-title" className="text-sm font-medium">
          Título da atividade
          <Input id="edit-activity-title" className="mt-1" aria-invalid={Boolean(error("title"))} aria-describedby={error("title") ? "edit-activity-title-error" : undefined} {...form.register("title", { onChange: () => markEdited("title") })} />
          <CharacterCounter value={values.title} limit={ACTIVITY_LIMITS.title} />
          <FieldMessage id="edit-activity-title-error">{error("title")}</FieldMessage>
        </label>
        <label htmlFor="edit-activity-date" className="text-sm font-medium">
          Data
          <Input id="edit-activity-date" className="mt-1" type="date" min={cycle.startsAt} max={cycle.endsAt} aria-invalid={Boolean(error("date"))} aria-describedby={error("date") ? "edit-activity-date-error" : undefined} {...form.register("date")} />
          <FieldMessage id="edit-activity-date-error">{error("date")}</FieldMessage>
        </label>
        <label htmlFor="edit-activity-location" className="text-sm font-medium">
          Local
          <Input id="edit-activity-location" className="mt-1" aria-invalid={Boolean(error("location"))} aria-describedby={error("location") ? "edit-activity-location-error" : undefined} {...form.register("location")} />
          <FieldMessage id="edit-activity-location-error">{error("location")}</FieldMessage>
        </label>
        <label htmlFor="edit-activity-beneficiaries" className="text-sm font-medium">
          Público beneficiado
          <Input id="edit-activity-beneficiaries" className="mt-1" aria-invalid={Boolean(error("beneficiaries"))} aria-describedby={error("beneficiaries") ? "edit-activity-beneficiaries-error" : undefined} {...form.register("beneficiaries", { onChange: () => markEdited("beneficiaries") })} />
          <CharacterCounter value={values.beneficiaries} limit={ACTIVITY_LIMITS.beneficiaries} />
          <FieldMessage id="edit-activity-beneficiaries-error">{error("beneficiaries")}</FieldMessage>
        </label>
      </div>
      <label htmlFor="edit-activity-summary" className="block text-sm font-medium">
        {template.summaryLabel}
        <Textarea id="edit-activity-summary" className="mt-1" placeholder={template.summaryPlaceholder} aria-invalid={Boolean(error("summary"))} aria-describedby={error("summary") ? "edit-activity-summary-error" : undefined} {...form.register("summary", { onChange: () => markEdited("summary") })} />
        <CharacterCounter value={values.summary} limit={ACTIVITY_LIMITS.summary} />
        <FieldMessage id="edit-activity-summary-error">{error("summary")}</FieldMessage>
      </label>
      <label htmlFor="edit-activity-result" className="block text-sm font-medium">
        {template.resultLabel}
        <Textarea id="edit-activity-result" className="mt-1" placeholder={template.resultPlaceholder} aria-invalid={Boolean(error("result"))} aria-describedby={error("result") ? "edit-activity-result-error" : undefined} {...form.register("result", { onChange: () => markEdited("result") })} />
        <CharacterCounter value={values.result} limit={ACTIVITY_LIMITS.result} />
        <FieldMessage id="edit-activity-result-error">{error("result")}</FieldMessage>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label htmlFor="edit-activity-evidence" className="block text-sm font-medium">
          {template.evidenceLabel} <span className="font-normal text-muted">(opcional)</span>
          <Input id="edit-activity-evidence" className="mt-1" placeholder={template.evidencePlaceholder} aria-invalid={Boolean(error("evidence"))} {...form.register("evidence")} />
          <CharacterCounter value={values.evidence} limit={ACTIVITY_LIMITS.evidence} />
          <FieldMessage id="edit-activity-evidence-error">{error("evidence")}</FieldMessage>
        </label>
        <label htmlFor="edit-activity-next-step" className="block text-sm font-medium">
          {template.nextStepLabel} <span className="font-normal text-muted">(opcional)</span>
          <Input id="edit-activity-next-step" className="mt-1" placeholder={template.nextStepPlaceholder} aria-invalid={Boolean(error("nextStep"))} {...form.register("nextStep")} />
          <CharacterCounter value={values.nextStep} limit={ACTIVITY_LIMITS.nextStep} />
          <FieldMessage id="edit-activity-next-step-error">{error("nextStep")}</FieldMessage>
        </label>
      </div>
      <ActivitySynthesisPreview templateKey={report.templateKey} title={values.title} date={values.date} location={values.location} summary={values.summary} result={values.result} beneficiaries={values.beneficiaries} evidence={values.evidence} nextStep={values.nextStep} />
      <label htmlFor="edit-activity-notes" className="block border-t border-border pt-5 text-sm font-medium">
        Notas para consulta <span className="font-normal text-muted">(não aparecem na síntese)</span>
        <Textarea id="edit-activity-notes" className="mt-1 min-h-36" aria-invalid={Boolean(error("internalNotes"))} {...form.register("internalNotes")} />
        <CharacterCounter value={values.internalNotes} limit={ACTIVITY_LIMITS.internalNotes} />
        <FieldMessage id="edit-activity-notes-error">{error("internalNotes")}</FieldMessage>
      </label>
      {mutation.isError ? <p role="alert" className="rounded-app border border-danger p-3 text-sm text-danger">{mutation.error.message}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" loading={mutation.isPending}><Save size={16} />Salvar alterações</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X size={16} />Cancelar</Button>
      </div>
    </form>
  );
}
