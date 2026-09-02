"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { WeekSelector } from "@/components/WeekSelector";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { ActivityFilters } from "@/components/activity/ActivityFilters";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useAuth } from "../providers";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";

export default function ReportsPage() {
  const { user, role } = useAuth();
  const [cycleId, setCycleId] = useState<string>();
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const selectedCycleId = cycleId ?? currentCycle(cycles.data)?.id;
  const reports = useQuery({
    queryKey: ["activityReports", selectedCycleId],
    queryFn: () => api.listActivityReports({ cycleId: selectedCycleId }),
    enabled: Boolean(selectedCycleId),
  });
  const users = useQuery({ queryKey: ["users"], queryFn: api.listUsers, enabled: role !== "gestor" });
  const areas = useQuery({ queryKey: ["areas"], queryFn: api.listAreas });
  const selectedCycle = cycles.data?.find((cycle) => cycle.id === selectedCycleId);
  const open = selectedCycle?.status === "aberta" || selectedCycle?.status === "reaberta";

  return (
    <AppShell>
      <PageHeader
        title="Relatos"
        description="Consulta dos registros realizados nas semanas de coleta."
        actions={open ? <Link className="inline-flex min-h-10 items-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-medium text-white" href="/relatos/novo"><FilePlus2 size={16} />Nova atividade</Link> : null}
      />
      <div className="mb-4 max-w-xs"><WeekSelector value={selectedCycleId} onChange={setCycleId} /></div>
      <ActivityFilters areas={areas.data ?? []} users={users.data ?? []} scope="todos" onScopeChange={() => undefined} />
      {reports.isLoading ? <div className="rounded-app border border-border bg-white p-6">Carregando relatos.</div> : null}
      {reports.isError ? <ErrorState onRetry={() => void reports.refetch()} /> : null}
      {reports.data?.length === 0 ? <EmptyState description="O período selecionado não possui relatos registrados." /> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.data?.map((report) => (
          <ActivityCard key={report.id} report={report} manager={users.data?.find((item) => item.id === report.managerId) ?? user ?? undefined} />
        ))}
      </section>
    </AppShell>
  );
}

