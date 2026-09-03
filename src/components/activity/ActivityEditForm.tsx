"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { ActivityReport, WeeklyCycle } from "@/types";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { FieldMessage } from "../ui/field-message";
import { activityEditSchema, type ActivityEditValues } from "./activitySchema";

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
  const mutation = useMutation({
    mutationFn: (values: ActivityEditValues) => api.updateOwnActivityReport(report.id, values),
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
    },
  });
  const error = (field: keyof ActivityEditValues) => form.formState.errors[field]?.message?.toString();

  return (
    <form className="space-y-5 rounded-app border border-border bg-white p-5 shadow-subtle" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <div className="rounded-app border border-border bg-page p-3 text-sm text-muted">
        Fotos, área e responsável são preservados. A edição textual só é aceita enquanto o ciclo estiver aberto ou reaberto.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label htmlFor="edit-activity-title" className="text-sm font-medium">
          Título da atividade
          <Input id="edit-activity-title" className="mt-1" aria-invalid={Boolean(error("title"))} aria-describedby={error("title") ? "edit-activity-title-error" : undefined} {...form.register("title")} />
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
          <Input id="edit-activity-beneficiaries" className="mt-1" aria-invalid={Boolean(error("beneficiaries"))} aria-describedby={error("beneficiaries") ? "edit-activity-beneficiaries-error" : undefined} {...form.register("beneficiaries")} />
          <FieldMessage id="edit-activity-beneficiaries-error">{error("beneficiaries")}</FieldMessage>
        </label>
      </div>
      <label htmlFor="edit-activity-summary" className="block text-sm font-medium">
        Descrição resumida
        <Textarea id="edit-activity-summary" className="mt-1" aria-invalid={Boolean(error("summary"))} aria-describedby={error("summary") ? "edit-activity-summary-error" : undefined} {...form.register("summary")} />
        <FieldMessage id="edit-activity-summary-error">{error("summary")}</FieldMessage>
      </label>
      <label htmlFor="edit-activity-result" className="block text-sm font-medium">
        Resultado alcançado
        <Textarea id="edit-activity-result" className="mt-1" aria-invalid={Boolean(error("result"))} aria-describedby={error("result") ? "edit-activity-result-error" : undefined} {...form.register("result")} />
        <FieldMessage id="edit-activity-result-error">{error("result")}</FieldMessage>
      </label>
      {mutation.isError ? <p role="alert" className="rounded-app border border-danger p-3 text-sm text-danger">{mutation.error.message}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" loading={mutation.isPending}><Save size={16} />Salvar alterações</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X size={16} />Cancelar</Button>
      </div>
    </form>
  );
}
