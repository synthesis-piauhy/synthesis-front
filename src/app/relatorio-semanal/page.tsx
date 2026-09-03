"use client";

import Link from "next/link";
import { Edit3, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { WeekSelector } from "@/components/WeekSelector";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";
import { reportStatusLabel } from "@/lib/utils";
import { useAuth } from "../providers";

export default function WeeklyReportPage() {
  const { role } = useAuth();
  const [cycleId, setCycleId] = useState<string>();
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const reports = useQuery({ queryKey: ["weeklyReports"], queryFn: api.listWeeklyReports, enabled: role === "gerente" });
  const selectedCycleId = cycleId ?? currentCycle(cycles.data)?.id;
  const current = reports.data?.find((report) => report.cycleId === selectedCycleId);
  const cycle = cycles.data?.find((item) => item.id === selectedCycleId);

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
                <p className="text-sm text-muted">{current.selectedActivityIds.length} atividades na seleção fechada</p>
                <p className="text-sm text-muted">{current.versions.length} versões de PDF preservadas</p>
              </div>
              <div className="flex gap-2">
                <Link className="inline-flex min-h-10 items-center gap-2 rounded-app border border-border bg-white px-4 py-2 text-sm font-medium text-text" href={`/relatorios/${current.id}`}>
                  <Eye size={16} />Ver versões
                </Link>
                <Link className="inline-flex min-h-10 items-center gap-2 rounded-app bg-secondary px-4 py-2 text-sm font-medium text-white" href={`/relatorio-semanal/${current.id}/editar`}>
                  <Edit3 size={16} />Abrir editor
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </RoleGuard>
    </AppShell>
  );
}
