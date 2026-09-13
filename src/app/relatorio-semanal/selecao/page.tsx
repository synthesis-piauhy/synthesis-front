"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FileText, LockKeyhole } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { WeekSelector } from "@/components/WeekSelector";
import { RoleGuard } from "@/components/RoleGuard";
import { ActivityFilters, emptyActivityFilters, filterActivityReports, type ActivityFilterValue } from "@/components/activity/ActivityFilters";
import { EditorialSelectionCard } from "@/components/report/EditorialSelectionCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";
import { useAuth } from "@/app/providers";

export default function EditorialSelectionPage() {
  const { role } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [selectionOverrides, setSelectionOverrides] = useState<Record<string, string[]>>({});
  const [cycleId, setCycleId] = useState<string>();
  const [filters, setFilters] = useState<ActivityFilterValue>(emptyActivityFilters);
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const selectedCycleId = cycleId ?? currentCycle(cycles.data)?.id;
  const reports = useQuery({
    queryKey: ["activityReports", selectedCycleId],
    queryFn: () => api.listActivityReports({ cycleId: selectedCycleId }),
    enabled: Boolean(selectedCycleId),
  });
  const weeklyReports = useQuery({ queryKey: ["weeklyReports"], queryFn: api.listWeeklyReports, enabled: role === "gerente" });
  const users = useQuery({ queryKey: ["users"], queryFn: api.listUsers });
  const areas = useQuery({ queryKey: ["areas"], queryFn: api.listAreas });
  const existingReport = weeklyReports.data?.find((report) => report.cycleId === selectedCycleId);
  const selectionReopened = existingReport?.status === "em_selecao";
  const locked = Boolean(existingReport && !selectionReopened);
  const effectiveSelected = selectionReopened && selectedCycleId
    ? (selectionOverrides[selectedCycleId] ?? existingReport.selectedActivityIds)
    : (existingReport?.selectedActivityIds ?? selected);
  const visibleReports = filterActivityReports(
    (reports.data ?? []).filter((report) =>
      (!filters.area || report.area === filters.area) &&
      (!filters.managerId || report.managerId === filters.managerId),
    ),
    filters,
  );
  const draft = useMutation({
    mutationFn: () => {
      if (!selectedCycleId) throw new Error("Selecione uma semana.");
      return api.generateDraft(selectedCycleId, effectiveSelected);
    },
    onSuccess: async (report) => {
      await queryClient.invalidateQueries({ queryKey: ["weeklyReports"] });
      router.push(`/relatorio-semanal/${report.id}/editar`);
    },
  });

  function updateSelection(update: (current: string[]) => string[]) {
    if (selectionReopened && selectedCycleId && existingReport) {
      setSelectionOverrides((current) => ({
        ...current,
        [selectedCycleId]: update(current[selectedCycleId] ?? existingReport.selectedActivityIds),
      }));
      return;
    }
    setSelected(update);
  }

  const selectedByArea = useMemo(() => {
    return (areas.data ?? []).map((area) => ({
      area,
      total: effectiveSelected.filter((id) => reports.data?.find((report) => report.id === id)?.area === area).length,
    })).filter((item) => item.total > 0);
  }, [areas.data, effectiveSelected, reports.data]);

  return (
    <AppShell>
      <RoleGuard allowed={["gerente"]} fallback={<EmptyState title="Acesso restrito" description="A seleção editorial é exclusiva da gerente." />}>
        <PageHeader title="Seleção editorial" description="Escolha os relatos que farão parte do único rascunho visual da semana." />
        <div className="mb-4 grid gap-4 md:grid-cols-[280px_1fr]">
          <WeekSelector value={selectedCycleId} onChange={(value) => { setCycleId(value); setSelected([]); }} />
          <div className="rounded-app border border-border bg-white p-4 text-sm shadow-subtle">
            <strong>{reports.data?.length ?? 0}</strong> relatos no período · <strong>{effectiveSelected.length}</strong> selecionados
          </div>
        </div>
        {locked && existingReport ? (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-app border border-warning bg-white p-4 text-sm">
            <div className="flex items-center gap-3">
              <LockKeyhole className="text-warning" size={20} />
              <div>
                <strong>Seleção encerrada</strong>
                <p className="text-muted">O rascunho deste ciclo já existe. Reabra a seleção na página do mosaico se precisar corrigi-la antes do primeiro PDF.</p>
              </div>
            </div>
            <Link href={`/relatorio-semanal/${existingReport.id}/editar`} className="rounded-app bg-primary px-4 py-2 font-medium text-white">Abrir editor</Link>
          </div>
        ) : null}
        {selectionReopened ? (
          <div className="mb-5 rounded-app border border-warning bg-white p-4 text-sm">
            <strong>Seleção reaberta</strong>
            <p className="text-muted">Ajuste as atividades e atualize o rascunho. A edição fica bloqueada até você concluir esta etapa.</p>
          </div>
        ) : null}
        <ActivityFilters areas={areas.data ?? []} users={users.data ?? []} value={filters} onChange={setFilters} showScope={false} />
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-app border border-border bg-white p-4">
          <div className="text-sm text-muted">
            Resumo: {selectedByArea.length ? selectedByArea.map((item) => `${item.area}: ${item.total}`).join("; ") : "nenhuma atividade selecionada"}
          </div>
          {!locked ? (
            <Button onClick={() => updateSelection((current) => Array.from(new Set([...current, ...visibleReports.map((report) => report.id)])))} variant="outline">
              Selecionar resultados filtrados
            </Button>
          ) : null}
        </div>
        {reports.isError || weeklyReports.isError ? <ErrorState onRetry={() => { void reports.refetch(); void weeklyReports.refetch(); }} /> : null}
        {!reports.isLoading && visibleReports.length === 0 ? <EmptyState description="Nenhum relato corresponde aos filtros selecionados." /> : null}
        {(areas.data ?? []).map((area) => {
          const areaReports = visibleReports.filter((report) => report.area === area).sort((a, b) => a.date.localeCompare(b.date));
          if (!areaReports.length) return null;
          return (
            <section key={area} className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{area}</h2>
                {!locked ? (
                  <Button variant="outline" onClick={() => updateSelection((current) => Array.from(new Set([...current, ...areaReports.map((report) => report.id)])))}>
                    Selecionar todos da área
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {areaReports.map((report) => (
                  <EditorialSelectionCard
                    key={report.id}
                    report={report}
                    manager={users.data?.find((user) => user.id === report.managerId)}
                    checked={effectiveSelected.includes(report.id)}
                    disabled={locked}
                    onToggle={() => updateSelection((current) => current.includes(report.id) ? current.filter((id) => id !== report.id) : [...current, report.id])}
                  />
                ))}
              </div>
            </section>
          );
        })}
        {draft.isError ? <p role="alert" className="rounded-app border border-danger p-3 text-sm text-danger">{draft.error.message}</p> : null}
        {!locked ? (
          <div className="sticky bottom-0 mt-6 flex justify-end border-t border-border bg-page py-4">
            <Button disabled={!effectiveSelected.length || !selectedCycleId || draft.isPending} onClick={() => draft.mutate()}>
              <FileText size={16} aria-hidden />
              {draft.isPending ? "Salvando seleção..." : selectionReopened ? `Atualizar rascunho com ${effectiveSelected.length} atividades` : `Gerar rascunho com ${effectiveSelected.length} atividades`}
            </Button>
          </div>
        ) : null}
      </RoleGuard>
    </AppShell>
  );
}
