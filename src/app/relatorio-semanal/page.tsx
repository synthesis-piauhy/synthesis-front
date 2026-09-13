"use client";

import Link from "next/link";
import { Edit3, Eye, FileText, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { WeekSelector } from "@/components/WeekSelector";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";
import { reportStatusLabel } from "@/lib/utils";
import { useAuth } from "../providers";

export default function WeeklyReportPage() {
  const { role } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cycleId, setCycleId] = useState<string>();
  const [reopenOpen, setReopenOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const reports = useQuery({ queryKey: ["weeklyReports"], queryFn: api.listWeeklyReports, enabled: role === "gerente" });
  const selectedCycleId = cycleId ?? currentCycle(cycles.data)?.id;
  const current = reports.data?.find((report) => report.cycleId === selectedCycleId);
  const cycle = cycles.data?.find((item) => item.id === selectedCycleId);
  const canRecover = Boolean(current && current.versions.length === 0);
  const reopenSelection = useMutation({
    mutationFn: () => api.reopenReportSelection(current!.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["weeklyReports"] });
      setReopenOpen(false);
      router.push("/relatorio-semanal/selecao");
    },
  });
  const cancelDraft = useMutation({
    mutationFn: () => api.cancelWeeklyReport(current!.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["weeklyReports"] });
      setCancelOpen(false);
    },
  });
  const recoveryError = reopenSelection.error?.message ?? cancelDraft.error?.message;

  return (
    <AppShell>
      <RoleGuard allowed={["gerente"]} fallback={<EmptyState title="Acesso restrito" description="O relatório editorial é exclusivo da gerente." />}>
        <PageHeader title="Mosaico semanal" description="Acompanhe a entrega que reúne os relatos selecionados em um único relatório visual." />
        <div className="mb-5 max-w-xs"><WeekSelector value={selectedCycleId} onChange={setCycleId} /></div>
        {reports.isError || cycles.isError ? <ErrorState onRetry={() => { void reports.refetch(); void cycles.refetch(); }} /> : null}
        {!current && !reports.isLoading ? (
          <EmptyState
            title="Relatório ainda não iniciado"
            description="Selecione ao menos um relato para criar o único rascunho deste ciclo."
            action={
              <Link className="inline-flex min-h-10 items-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-medium text-white" href="/relatorio-semanal/selecao">
                <FileText size={16} />Selecionar atividades
              </Link>
            }
          />
        ) : null}
        {current ? (
          <section className="rounded-app border border-border bg-white p-5 shadow-subtle">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{cycle?.label ?? "Relatório da semana"}</h2>
                <p className="text-sm text-muted">Estado: {reportStatusLabel(current.status)}</p>
                <p className="text-sm text-muted">{current.selectedActivityIds.length} atividades {current.status === "em_selecao" ? "na seleção em revisão" : "na seleção fechada"}</p>
                <p className="text-sm text-muted">{current.versions.length} versões de PDF preservadas</p>
              </div>
              <div className="flex gap-2">
                <Link className="inline-flex min-h-10 items-center gap-2 rounded-app border border-border bg-white px-4 py-2 text-sm font-medium text-text" href={`/relatorios/${current.id}`}>
                  <Eye size={16} />Ver versões
                </Link>
                <Link className="inline-flex min-h-10 items-center gap-2 rounded-app bg-secondary px-4 py-2 text-sm font-medium text-white" href={current.status === "em_selecao" ? "/relatorio-semanal/selecao" : `/relatorio-semanal/${current.id}/editar`}>
                  <Edit3 size={16} />{current.status === "em_selecao" ? "Concluir seleção" : "Abrir editor"}
                </Link>
              </div>
            </div>
            {canRecover ? (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                {current.status !== "em_selecao" ? <Button variant="outline" onClick={() => setReopenOpen(true)}><RotateCcw size={16} />Reabrir seleção</Button> : null}
                <Button variant="outline" onClick={() => setCancelOpen(true)}><Trash2 size={16} />Cancelar rascunho</Button>
                <span className="text-xs text-muted">Disponível somente antes da primeira versão do PDF.</span>
              </div>
            ) : null}
            {recoveryError ? <p role="alert" className="mt-4 rounded-app border border-danger p-3 text-sm text-danger">{recoveryError}</p> : null}
          </section>
        ) : null}
        <ConfirmDialog
          open={reopenOpen}
          title="Reabrir seleção editorial"
          description="Você poderá incluir ou retirar atividades. Ao concluir, as seções e os cards serão reconstruídos a partir dos relatos originais."
          onCancel={() => setReopenOpen(false)}
          onConfirm={() => reopenSelection.mutate()}
        />
        <ConfirmDialog
          open={cancelOpen}
          title="Cancelar rascunho"
          description="O rascunho editorial será excluído, mas os relatos originais permanecerão intactos."
          onCancel={() => setCancelOpen(false)}
          onConfirm={() => cancelDraft.mutate()}
        />
      </RoleGuard>
    </AppShell>
  );
}
