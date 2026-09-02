"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { RoleGuard } from "@/components/RoleGuard";
import { api } from "@/services/api";
import { downloadReportPdf, viewReportPdf } from "@/lib/pdf";
import { reportStatusLabel } from "@/lib/utils";
import { useAuth } from "@/app/providers";

export default function ReportViewPage() {
  const params = useParams<{ id: string }>();
  const { role } = useAuth();
  const report = useQuery({
    queryKey: ["weeklyReport", params.id],
    queryFn: () => api.getWeeklyReport(params.id),
    enabled: role === "gerente",
  });
  const latest = report.data?.versions.at(-1);

  return (
    <AppShell>
      <RoleGuard allowed={["gerente"]} fallback={<EmptyState title="Acesso restrito" description="O relatório editorial é exclusivo da gerente." />}>
        <PageHeader
          title="Visualizar relatório"
          description="Versões geradas permanecem imutáveis no histórico."
          actions={latest ? (
            <>
              <Button variant="outline" onClick={() => void viewReportPdf(latest.id)}><Eye size={16} />Abrir PDF</Button>
              <Button variant="outline" onClick={() => void downloadReportPdf(latest.id, `synthesis-relatorio-v${latest.version}.pdf`)}><Download size={16} />Baixar PDF</Button>
            </>
          ) : null}
        />
        {report.data ? (
          <section className="rounded-app border border-border bg-white p-6 shadow-subtle">
            <div className="mb-5 text-2xl font-semibold text-primary">synthesis</div>
            <p className="text-sm text-muted">Estado: {reportStatusLabel(report.data.status)}</p>
            <p className="text-sm text-muted">{report.data.selectedActivityIds.length} cards publicados na seleção.</p>
            <p className="text-sm text-muted">{report.data.versions.length} versões de PDF preservadas.</p>
          </section>
        ) : !report.isLoading ? (
          <EmptyState description="Relatório não encontrado." />
        ) : (
          <div className="rounded-app border border-border bg-white p-6">Carregando relatório.</div>
        )}
      </RoleGuard>
    </AppShell>
  );
}

