"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { WeekSelector } from "@/components/WeekSelector";
import { RoleGuard } from "@/components/RoleGuard";
import { ActivityFilters } from "@/components/activity/ActivityFilters";
import { EditorialSelectionCard } from "@/components/report/EditorialSelectionCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/services/api";
import { areas } from "@/services/mock-data";

export default function EditorialSelectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const reports = useQuery({ queryKey: ["activityReports", "c1"], queryFn: () => api.listActivityReports({ cycleId: "c1" }) });
  const users = useQuery({ queryKey: ["users"], queryFn: api.listUsers });
  const draft = useMutation({
    mutationFn: () => api.generateDraft("c1", selected),
    onSuccess: (report) => router.push(`/relatorio-semanal/${report.id}/editar`),
  });

  const selectedByArea = useMemo(() => {
    return areas.map((area) => ({ area, total: selected.filter((id) => reports.data?.find((report) => report.id === id)?.area === area).length })).filter((item) => item.total > 0);
  }, [reports.data, selected]);

  return (
    <AppShell>
      <RoleGuard allowed={["gerente"]} fallback={<EmptyState title="Acesso restrito" description="A seleção editorial é exclusiva da gerente." />}>
        <PageHeader title="Seleção editorial" description="Escolha os relatos que farão parte do rascunho visual da semana." />
        <div className="mb-4 grid gap-4 md:grid-cols-[280px_1fr]">
          <WeekSelector />
          <div className="rounded-app border border-border bg-white p-4 text-sm shadow-subtle">
            <strong>{reports.data?.length ?? 0}</strong> relatos no período · <strong>{selected.length}</strong> selecionados
          </div>
        </div>
        <ActivityFilters areas={areas} users={users.data ?? []} scope="todos" onScopeChange={() => undefined} />
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-app border border-border bg-white p-4">
          <div className="text-sm text-muted">
            Resumo da seleção: {selectedByArea.length ? selectedByArea.map((item) => `${item.area}: ${item.total}`).join("; ") : "nenhuma atividade selecionada"}
          </div>
          <Button onClick={() => setSelected(reports.data?.map((report) => report.id) ?? [])} variant="outline">
            Selecionar todos os resultados filtrados
          </Button>
        </div>
        {areas.map((area) => {
          const areaReports = reports.data?.filter((report) => report.area === area).sort((a, b) => a.date.localeCompare(b.date)) ?? [];
          if (!areaReports.length) return null;
          return (
            <section key={area} className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{area}</h2>
                <Button variant="outline" onClick={() => setSelected((current) => Array.from(new Set([...current, ...areaReports.map((report) => report.id)])))}>
                  Selecionar todos da área
                </Button>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {areaReports.map((report) => (
                  <EditorialSelectionCard
                    key={report.id}
                    report={report}
                    manager={users.data?.find((user) => user.id === report.managerId)}
                    checked={selected.includes(report.id)}
                    onToggle={() => setSelected((current) => (current.includes(report.id) ? current.filter((id) => id !== report.id) : [...current, report.id]))}
                  />
                ))}
              </div>
            </section>
          );
        })}
        <div className="sticky bottom-0 mt-6 flex justify-end border-t border-border bg-page py-4">
          <Button disabled={!selected.length || draft.isPending} onClick={() => draft.mutate()}>
            <FileText size={16} aria-hidden />
            Gerar rascunho com {selected.length} atividades
          </Button>
        </div>
      </RoleGuard>
    </AppShell>
  );
}
