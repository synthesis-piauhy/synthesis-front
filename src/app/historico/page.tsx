"use client";

import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { WeekSelector } from "@/components/WeekSelector";
import { ActivityFilters } from "@/components/activity/ActivityFilters";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { areas } from "@/services/mock-data";

export default function HistoryPage() {
  const reports = useQuery({ queryKey: ["weeklyReports"], queryFn: api.listWeeklyReports });
  const users = useQuery({ queryKey: ["users"], queryFn: api.listUsers });
  return (
    <AppShell>
      <PageHeader title="Histórico" description="Consulte relatórios semanais anteriores, versões e relatos arquivados." />
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <WeekSelector />
        <label className="text-sm font-medium">Período inicial<input type="date" className="mt-1 min-h-10 w-full rounded-app border border-border px-3" /></label>
        <label className="text-sm font-medium">Período final<input type="date" className="mt-1 min-h-10 w-full rounded-app border border-border px-3" /></label>
      </div>
      <ActivityFilters areas={areas} users={users.data ?? []} scope="todos" onScopeChange={() => undefined} />
      {!reports.data?.length && !reports.isLoading ? <EmptyState description="Nenhum relatório histórico encontrado." /> : null}
      <div className="space-y-3">
        {reports.data?.map((report) => (
          <article key={report.id} className="rounded-app border border-border bg-white p-4 shadow-subtle">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Semana {report.cycleId}</h2>
                <p className="text-sm text-muted">
                  {report.sections.length || 2} áreas · {report.selectedActivityIds.length} cards · versão {report.versions.at(-1)?.version ?? 0}
                </p>
                <p className="text-sm text-muted">Relatos publicados e não publicados permanecem consultáveis por filtro.</p>
              </div>
              <div className="flex gap-2">
                <Link className="inline-flex min-h-10 items-center gap-2 rounded-app border border-border bg-white px-4 py-2 text-sm font-medium" href={`/relatorios/${report.id}`}>
                  <Eye size={16} />Visualizar
                </Link>
                <Button variant="outline"><Download size={16} />Baixar PDF</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
