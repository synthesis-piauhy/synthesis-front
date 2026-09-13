"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus2, CalendarRange, Clock3, LockKeyhole, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { api, type WeeklyCycleInput } from "@/services/api";
import type { WeeklyCycle } from "@/types";

type FormMode = "create" | "deadline" | "reopen";

function dateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function localDateTimeValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function initialCycle(): WeeklyCycleInput {
  const now = new Date();
  const start = new Date(now);
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() + ((8 - start.getDay()) % 7 || 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 4);
  const deadline = new Date(end);
  deadline.setHours(18, 0, 0, 0);
  return {
    label: `${start.toLocaleDateString("pt-BR")} a ${end.toLocaleDateString("pt-BR")}`,
    startsAt: dateValue(start),
    endsAt: dateValue(end),
    deadline: localDateTimeValue(deadline),
  };
}

function statusLabel(status: WeeklyCycle["status"]) {
  if (status === "aberta") return "Aberta";
  if (status === "reaberta") return "Reaberta";
  return "Encerrada";
}

export default function CyclesPage() {
  const queryClient = useQueryClient();
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const [mode, setMode] = useState<FormMode>();
  const [selected, setSelected] = useState<WeeklyCycle>();
  const [cycleForm, setCycleForm] = useState(initialCycle);
  const [deadline, setDeadline] = useState("");
  const [reason, setReason] = useState("");
  const [closing, setClosing] = useState<WeeklyCycle>();
  const [success, setSuccess] = useState("");

  async function refresh(message: string) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["cycles"] }),
      queryClient.invalidateQueries({ queryKey: ["overview"] }),
      queryClient.invalidateQueries({ queryKey: ["activityReports"] }),
    ]);
    setSuccess(message);
    setMode(undefined);
    setSelected(undefined);
    setReason("");
  }

  const createCycle = useMutation({
    mutationFn: (input: WeeklyCycleInput) => api.createWeeklyCycle({ ...input, deadline: new Date(input.deadline).toISOString() }),
    onSuccess: () => refresh("Novo ciclo aberto com sucesso."),
  });
  const updateDeadline = useMutation({
    mutationFn: ({ cycleId, value }: { cycleId: string; value: string }) => api.updateWeeklyCycleDeadline(cycleId, new Date(value).toISOString()),
    onSuccess: () => refresh("Prazo atualizado com sucesso."),
  });
  const reopenCycle = useMutation({
    mutationFn: ({ cycleId, value, justification }: { cycleId: string; value: string; justification: string }) => api.reopenCollection(cycleId, justification, new Date(value).toISOString()),
    onSuccess: () => refresh("Ciclo reaberto com sucesso."),
  });
  const closeCycle = useMutation({
    mutationFn: (cycleId: string) => api.closeWeeklyCycle(cycleId),
    onSuccess: async () => {
      setClosing(undefined);
      await refresh("Coleta encerrada. Os relatos permanecem disponíveis para seleção editorial.");
    },
  });
  const activeCycle = cycles.data?.find((cycle) => cycle.status === "aberta" || cycle.status === "reaberta");
  const pending = createCycle.isPending || updateDeadline.isPending || reopenCycle.isPending || closeCycle.isPending;
  const error = createCycle.error ?? updateDeadline.error ?? reopenCycle.error ?? closeCycle.error;

  function openAction(nextMode: FormMode, cycle?: WeeklyCycle) {
    setSuccess("");
    setSelected(cycle);
    setMode(nextMode);
    if (nextMode === "create") setCycleForm(initialCycle());
    if (cycle) {
      const future = new Date(Math.max(Date.now() + 86_400_000, new Date(cycle.deadline).getTime()));
      setDeadline(localDateTimeValue(future));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "create") createCycle.mutate(cycleForm);
    if (mode === "deadline" && selected) updateDeadline.mutate({ cycleId: selected.id, value: deadline });
    if (mode === "reopen" && selected) reopenCycle.mutate({ cycleId: selected.id, value: deadline, justification: reason });
  }

  return (
    <AppShell>
      <RoleGuard allowed={["gerente"]} fallback={<EmptyState title="Acesso restrito" description="A gestão operacional dos ciclos é exclusiva da gerente." />}>
        <PageHeader
          title="Ciclos semanais"
          description="Abra períodos de coleta, ajuste prazos e controle encerramentos e reaberturas."
          actions={<Button onClick={() => openAction("create")} disabled={Boolean(activeCycle) || pending}><CalendarPlus2 size={17} />Abrir novo ciclo</Button>}
        />
        {success ? <p role="status" className="mb-4 rounded-app border border-success bg-success/10 p-3 text-sm text-success">{success}</p> : null}
        {error ? <p role="alert" className="mb-4 rounded-app border border-danger bg-white p-3 text-sm text-danger">{error.message}</p> : null}
        {activeCycle ? <p className="mb-4 rounded-app border border-accent bg-accent/10 p-3 text-sm text-text">Existe uma coleta ativa. Encerre-a antes de abrir um novo ciclo.</p> : null}
        {cycles.isError ? <ErrorState onRetry={() => void cycles.refetch()} /> : null}
        {cycles.isLoading ? <div className="rounded-app border border-border bg-white p-6">Carregando ciclos.</div> : null}
        {!cycles.isLoading && !cycles.data?.length ? <EmptyState title="Nenhum ciclo cadastrado" description="Abra o primeiro período semanal de coleta." action={<Button onClick={() => openAction("create")}><CalendarPlus2 size={17} />Abrir primeiro ciclo</Button>} /> : null}
        <div className="space-y-3">
          {cycles.data?.map((cycle) => {
            const active = cycle.status === "aberta" || cycle.status === "reaberta";
            return (
              <section key={cycle.id} className="rounded-app border border-border bg-white p-5 shadow-subtle">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-text">{cycle.label}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-success/10 text-success" : "bg-page text-muted"}`}>{statusLabel(cycle.status)}</span></div>
                    <p className="mt-2 text-sm text-muted"><CalendarRange className="mr-1 inline" size={15} />{new Date(`${cycle.startsAt}T00:00:00`).toLocaleDateString("pt-BR")} a {new Date(`${cycle.endsAt}T00:00:00`).toLocaleDateString("pt-BR")}</p>
                    <p className="mt-1 text-sm text-muted"><Clock3 className="mr-1 inline" size={15} />Prazo: {new Date(cycle.deadline).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active ? <Button variant="outline" onClick={() => openAction("deadline", cycle)}><Clock3 size={16} />Ajustar prazo</Button> : <Button variant="outline" onClick={() => openAction("reopen", cycle)} disabled={Boolean(activeCycle)}><RotateCcw size={16} />Reabrir</Button>}
                    {active ? <Button variant="danger" onClick={() => setClosing(cycle)}><LockKeyhole size={16} />Encerrar coleta</Button> : null}
                    <Link href="/relatorio-semanal/selecao" className="inline-flex min-h-10 items-center rounded-app bg-secondary px-4 py-2 text-sm font-semibold text-white">Seleção editorial</Link>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <Dialog open={Boolean(mode)} onOpenChange={(open) => !open && setMode(undefined)} title={mode === "create" ? "Abrir novo ciclo" : mode === "deadline" ? "Ajustar prazo" : "Reabrir ciclo"}>
          <form className="space-y-4" onSubmit={submit}>
            {mode === "create" ? (
              <>
                <label className="block text-sm font-medium">Nome do ciclo<Input className="mt-1" required minLength={3} maxLength={120} value={cycleForm.label} onChange={(event) => setCycleForm((current) => ({ ...current, label: event.target.value }))} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium">Início<Input className="mt-1" type="date" required value={cycleForm.startsAt} onChange={(event) => setCycleForm((current) => ({ ...current, startsAt: event.target.value }))} /></label>
                  <label className="block text-sm font-medium">Fim<Input className="mt-1" type="date" required min={cycleForm.startsAt} value={cycleForm.endsAt} onChange={(event) => setCycleForm((current) => ({ ...current, endsAt: event.target.value }))} /></label>
                </div>
                <label className="block text-sm font-medium">Prazo para envio<Input className="mt-1" type="datetime-local" required min={`${cycleForm.startsAt}T00:00`} max={`${cycleForm.endsAt}T23:59`} value={cycleForm.deadline} onChange={(event) => setCycleForm((current) => ({ ...current, deadline: event.target.value }))} /></label>
              </>
            ) : (
              <>
                <p className="rounded-app bg-page p-3 text-sm text-muted">{selected?.label}</p>
                {mode === "reopen" ? <label className="block text-sm font-medium">Justificativa<Textarea className="mt-1 min-h-24" required minLength={5} maxLength={2000} value={reason} onChange={(event) => setReason(event.target.value)} /></label> : null}
                <label className="block text-sm font-medium">Novo prazo<Input className="mt-1" type="datetime-local" required value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
              </>
            )}
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setMode(undefined)}>Cancelar</Button><Button type="submit" loading={pending}>{mode === "create" ? "Abrir ciclo" : mode === "reopen" ? "Reabrir ciclo" : "Salvar prazo"}</Button></div>
          </form>
        </Dialog>
        <ConfirmDialog
          open={Boolean(closing)}
          title="Encerrar coleta"
          description="Os gestores não poderão criar nem editar relatos neste ciclo. A seleção editorial continuará disponível."
          onCancel={() => setClosing(undefined)}
          onConfirm={() => closing && closeCycle.mutate(closing.id)}
        />
      </RoleGuard>
    </AppShell>
  );
}
