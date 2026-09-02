"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { ActivityReport, WeeklyCycle } from "@/types";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
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
        <label className="text-sm font-medium">
          Título da atividade
          <Input className="mt-1" {...form.register("title")} />
          {error("title") ? <span className="text-sm text-danger">{error("title")}</span> : null}
        </label>
        <label className="text-sm font-medium">
          Data
          <Input className="mt-1" type="date" min={cycle.startsAt} max={cycle.endsAt} {...form.register("date")} />
          {error("date") ? <span className="text-sm text-danger">{error("date")}</span> : null}
        </label>
        <label className="text-sm font-medium">
          Local
          <Input className="mt-1" {...form.register("location")} />
          {error("location") ? <span className="text-sm text-danger">{error("location")}</span> : null}
        </label>
        <label className="text-sm font-medium">
          Público beneficiado
          <Input className="mt-1" {...form.register("beneficiaries")} />
          {error("beneficiaries") ? <span className="text-sm text-danger">{error("beneficiaries")}</span> : null}
        </label>
      </div>
      <label className="block text-sm font-medium">
        Descrição resumida
        <Textarea className="mt-1" {...form.register("summary")} />
        {error("summary") ? <span className="text-sm text-danger">{error("summary")}</span> : null}
      </label>
      <label className="block text-sm font-medium">
        Resultado alcançado
        <Textarea className="mt-1" {...form.register("result")} />
        {error("result") ? <span className="text-sm text-danger">{error("result")}</span> : null}
      </label>
      {mutation.isError ? <p role="alert" className="rounded-app border border-danger p-3 text-sm text-danger">{mutation.error.message}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.isPending}><Save size={16} />{mutation.isPending ? "Salvando..." : "Salvar alterações"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X size={16} />Cancelar</Button>
      </div>
    </form>
  );
}

