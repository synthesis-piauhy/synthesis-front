"use client";

import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { WeekSelector } from "@/components/WeekSelector";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/RoleGuard";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";
import { downloadReportPdf } from "@/lib/pdf";
import { useAuth } from "../providers";

export default function HistoryPage() {
  const { role } = useAuth();
  const [cycleId, setCycleId] = useState<string>();
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const selectedCycleId = cycleId ?? currentCycle(cycles.data)?.id;
  const reports = useQuery({ queryKey: ["weeklyReports"], queryFn: api.listWeeklyReports, enabled: role === "gerente" });
  const filtered = selectedCycleId ? reports.data?.filter((report) => report.cycleId === selectedCycleId) : reports.data;

  return (
    <AppShell>
      <RoleGuard allowed={["gerente"]} fallback={<EmptyState title="Acesso restrito" description="O histórico editorial é exclusivo da gerente." />}>
        <PageHeader title="Histórico" description="Consulte relatórios semanais anteriores e todas as versões geradas." />
        <div className="mb-4 max-w-xs">
          <WeekSelector value={selectedCycleId} onChange={setCycleId} />
        </div>
        {!filtered?.length && !reports.isLoading ? <EmptyState description="Nenhum relatório histórico encontrado para esta semana." /> : null}
        <div className="space-y-3">
          {filtered?.map((report) => {
            const latest = report.versions.at(-1);
            const label = cycles.data?.find((cycle) => cycle.id === report.cycleId)?.label ?? report.cycleId;
            return (
              <article key={report.id} className="rounded-app border border-border bg-white p-4 shadow-subtle">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{label}</h2>
                    <p className="text-sm text-muted">
                      {report.sections.length} áreas · {report.selectedActivityIds.length} cards · versão {latest?.version ?? 0}
                    </p>
                    <p className="text-sm text-muted">Cada PDF gerado permanece imutável e disponível para consulta.</p>
                  </div>
                  <div className="flex gap-2">
                    <Link className="inline-flex min-h-10 items-center gap-2 rounded-app border border-border bg-white px-4 py-2 text-sm font-medium" href={`/relatorios/${report.id}`}>
                      <Eye size={16} />Visualizar
                    </Link>
                    <Button variant="outline" disabled={!latest} onClick={() => latest && void downloadReportPdf(latest.id, `synthesis-${label}-v${latest.version}.pdf`)}>
                      <Download size={16} />Baixar PDF
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </RoleGuard>
    </AppShell>
  );
}

