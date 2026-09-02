"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { WeekSelector } from "@/components/WeekSelector";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { ActivityFilters, emptyActivityFilters, filterActivityReports, type ActivityFilterValue } from "@/components/activity/ActivityFilters";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useAuth } from "../providers";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";

export default function ReportsPage() {
  const { user, role } = useAuth();
  const [cycleId, setCycleId] = useState<string>();
  const [filters, setFilters] = useState<ActivityFilterValue>(emptyActivityFilters);
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const selectedCycleId = cycleId ?? currentCycle(cycles.data)?.id;
  const managerId = filters.scope === "meus" ? user?.id : filters.managerId || undefined;
  const reports = useQuery({
    queryKey: ["activityReports", selectedCycleId, filters.area, managerId],
    queryFn: () => api.listActivityReports({
      cycleId: selectedCycleId,
      area: filters.area || undefined,
      managerId,
    }),
    enabled: Boolean(selectedCycleId),
  });
  const users = useQuery({ queryKey: ["users"], queryFn: api.listUsers, enabled: role !== "gestor" });
  const areas = useQuery({ queryKey: ["areas"], queryFn: api.listAreas });
  const selectedCycle = cycles.data?.find((cycle) => cycle.id === selectedCycleId);
  const open = selectedCycle?.status === "aberta" || selectedCycle?.status === "reaberta";
  const visibleReports = filterActivityReports(reports.data ?? [], filters);

  return (
    <AppShell>
      <PageHeader
        title="Relatos"
        description="Consulta dos registros realizados nas semanas de coleta."
        actions={role === "gestor" && open ? (
          <Link className="inline-flex min-h-10 items-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-medium text-white" href="/relatos/novo">
            <FilePlus2 size={16} />Nova atividade
          </Link>
        ) : null}
      />
      <div className="mb-4 max-w-xs"><WeekSelector value={selectedCycleId} onChange={setCycleId} /></div>
      <ActivityFilters
        areas={areas.data ?? []}
        users={users.data ?? (user ? [user] : [])}
        value={filters}
        onChange={setFilters}
        showScope={role !== "gestor"}
      />
      {reports.isLoading ? <div className="rounded-app border border-border bg-white p-6">Carregando relatos.</div> : null}
      {reports.isError ? <ErrorState onRetry={() => void reports.refetch()} /> : null}
      {!reports.isLoading && visibleReports.length === 0 ? <EmptyState description="Nenhum relato corresponde aos filtros selecionados." /> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleReports.map((report) => (
          <ActivityCard key={report.id} report={report} manager={users.data?.find((item) => item.id === report.managerId) ?? user ?? undefined} />
        ))}
      </section>
    </AppShell>
  );
}

