"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/services/api";
import { reportStatusLabel } from "@/lib/utils";

export default function ReportViewPage() {
  const params = useParams<{ id: string }>();
  const report = useQuery({ queryKey: ["weeklyReport", params.id], queryFn: () => api.getWeeklyReport(params.id) });
  return (
    <AppShell>
      <PageHeader title="Visualizar relatório" description="Versões geradas permanecem imutáveis no histórico." actions={<Button variant="outline">Baixar PDF</Button>} />
      {report.data ? (
        <section className="rounded-app border border-border bg-white p-6 shadow-subtle">
          <div className="mb-5 text-2xl font-semibold text-primary">synthesis</div>
          <p className="text-sm text-muted">Estado: {reportStatusLabel(report.data.status)}</p>
          <p className="text-sm text-muted">{report.data.selectedActivityIds.length} cards publicados na seleção.</p>
        </section>
      ) : !report.isLoading ? (
        <EmptyState description="Relatório não encontrado." />
      ) : (
        <div className="rounded-app border border-border bg-white p-6">Carregando relatório.</div>
      )}
    </AppShell>
  );
}
