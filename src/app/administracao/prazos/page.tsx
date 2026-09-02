"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export default function DeadlinesAdminPage() {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const reopen = useMutation({
    mutationFn: () => api.reopenCollection(reason, new Date(newDeadline).toISOString()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cycles"] });
      await queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    reopen.mutate();
  }

  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="Somente o administrador técnico pode configurar prazos." />}>
        <PageHeader title="Prazos" description="Reabertura excepcional do ciclo semanal atual." />
        <form onSubmit={submit} className="rounded-app border border-border bg-white p-5 shadow-subtle">
          <h2 className="text-lg font-semibold">Reabrir período</h2>
          <p className="mt-1 text-sm text-muted">A justificativa será registrada na auditoria e o novo prazo ficará ativo imediatamente.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium">
              Justificativa
              <Input className="mt-1" required value={reason} onChange={(event) => setReason(event.target.value)} />
            </label>
            <label className="text-sm font-medium">
              Novo prazo
              <Input className="mt-1" type="datetime-local" required value={newDeadline} onChange={(event) => setNewDeadline(event.target.value)} />
            </label>
          </div>
          {reopen.isSuccess ? <p className="mt-4 rounded-app border border-success p-3 text-sm text-success">Período reaberto com sucesso.</p> : null}
          {reopen.isError ? <p role="alert" className="mt-4 rounded-app border border-danger p-3 text-sm text-danger">{reopen.error.message}</p> : null}
          <Button className="mt-4" type="submit" disabled={reopen.isPending || !reason || !newDeadline}>
            {reopen.isPending ? "Reabrindo..." : "Reabrir período"}
          </Button>
        </form>
      </RoleGuard>
    </AppShell>
  );
}

