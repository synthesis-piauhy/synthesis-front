"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { WeekSelector } from "@/components/WeekSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";

function minimumDeadline() {
  const value = new Date(Date.now() + 60_000);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 16);
}

export default function DeadlinesAdminPage() {
  const queryClient = useQueryClient();
  const [cycleId, setCycleId] = useState<string>();
  const [reason, setReason] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const selectedCycleId = cycleId ?? currentCycle(cycles.data)?.id;
  const selectedCycle = cycles.data?.find((cycle) => cycle.id === selectedCycleId);
  const valid = Boolean(selectedCycleId && reason.trim().length >= 5 && newDeadline && new Date(newDeadline).getTime() > Date.now());
  const reopen = useMutation({
    mutationFn: () => {
      if (!selectedCycleId) throw new Error("Selecione um ciclo.");
      return api.reopenCollection(selectedCycleId, reason.trim(), new Date(newDeadline).toISOString());
    },
    onSuccess: async () => {
      setReason("");
      setNewDeadline("");
      await queryClient.invalidateQueries({ queryKey: ["cycles"] });
      await queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (valid) reopen.mutate();
  }

  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="Somente o administrador técnico pode configurar prazos." />}>
        <PageHeader title="Prazos" description="Reabertura excepcional de ciclos semanais." />
        <form onSubmit={submit} className="rounded-app border border-border bg-white p-5 shadow-subtle">
          <h2 className="text-lg font-semibold">Reabrir período</h2>
          <p className="mt-1 text-sm text-muted">A justificativa será registrada na auditoria e o novo prazo precisa estar no futuro.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <WeekSelector value={selectedCycleId} onChange={setCycleId} />
            <label className="text-sm font-medium">
              Justificativa
              <Input className="mt-1" required minLength={5} value={reason} onChange={(event) => setReason(event.target.value)} />
              {reason && reason.trim().length < 5 ? <span className="text-xs text-danger">Informe ao menos 5 caracteres.</span> : null}
            </label>
            <label className="text-sm font-medium">
              Novo prazo
              <Input className="mt-1" type="datetime-local" required min={minimumDeadline()} value={newDeadline} onChange={(event) => setNewDeadline(event.target.value)} />
              {newDeadline && new Date(newDeadline).getTime() <= Date.now() ? <span className="text-xs text-danger">Escolha uma data futura.</span> : null}
            </label>
          </div>
          {selectedCycle ? (
            <p className="mt-3 text-sm text-muted">
              Situação atual: <strong>{selectedCycle.status}</strong>. Prazo: {new Date(selectedCycle.deadline).toLocaleString("pt-BR")}.
            </p>
          ) : null}
          {reopen.isSuccess ? <p className="mt-4 rounded-app border border-success p-3 text-sm text-success">Período reaberto com sucesso.</p> : null}
          {reopen.isError ? <p role="alert" className="mt-4 rounded-app border border-danger p-3 text-sm text-danger">{reopen.error.message}</p> : null}
          <Button className="mt-4" type="submit" disabled={reopen.isPending || !valid}>
            {reopen.isPending ? "Reabrindo..." : "Reabrir período selecionado"}
          </Button>
        </form>
      </RoleGuard>
    </AppShell>
  );
}

