"use client";

import Link from "next/link";
import { Edit3, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/services/api";
import { reportStatusLabel } from "@/lib/utils";

export default function WeeklyReportPage() {
  const reports = useQuery({ queryKey: ["weeklyReports"], queryFn: api.listWeeklyReports });
  const current = reports.data?.[0];
  return (
    <AppShell>
      <PageHeader
        title="Relatório semanal"
        description="Acompanhe o relatório da semana e as versões geradas."
        actions={
          <RoleGuard allowed={["gerente"]}>
            <Link className="inline-flex min-h-10 items-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-medium text-white" href="/relatorio-semanal/selecao">
              <FileText size={16} /> Selecionar atividades
            </Link>
          </RoleGuard>
        }
      />
      {!current ? <EmptyState description="Nenhum relatório foi iniciado para a semana selecionada." /> : null}
      {current ? (
        <section className="rounded-app border border-border bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Relatório da semana</h2>
              <p className="text-sm text-muted">Estado: {reportStatusLabel(current.status)}</p>
              <p className="text-sm text-muted">{current.selectedActivityIds.length} atividades selecionadas</p>
            </div>
            <RoleGuard allowed={["gerente"]} fallback={<Button variant="outline" disabled>Ações editoriais restritas</Button>}>
              <Link className="inline-flex min-h-10 items-center gap-2 rounded-app bg-secondary px-4 py-2 text-sm font-medium text-white" href={`/relatorio-semanal/${current.id}/editar`}>
                <Edit3 size={16} /> Abrir editor
              </Link>
            </RoleGuard>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
