"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { RoleGuard } from "@/components/RoleGuard";
import { api } from "@/services/api";
import { downloadReportPdf, viewReportPdf } from "@/lib/pdf";
import { reportStatusLabel } from "@/lib/utils";
import { useAuth } from "@/app/providers";

export default function ReportViewPage() {
  const params = useParams<{ id: string }>();
  const { role } = useAuth();
  const enabled = role === "gerente";
  const report = useQuery({
    queryKey: ["weeklyReport", params.id],
    queryFn: () => api.getWeeklyReport(params.id),
    enabled,
  });
  const versions = useQuery({
    queryKey: ["reportVersions", params.id],
    queryFn: () => api.listReportVersions(params.id),
    enabled,
  });
  const users = useQuery({ queryKey: ["users"], queryFn: api.listUsers, enabled });
  const latest = versions.data?.at(-1);

  return (
    <AppShell>
      <RoleGuard allowed={["gerente"]} fallback={<EmptyState title="Acesso restrito" description="O relatório editorial é exclusivo da gerente." />}>
        <PageHeader
          title="Visualizar relatório"
          description="Cada versão gerada é imutável e permanece disponível."
          actions={latest ? (
            <>
              <Button variant="outline" onClick={() => void viewReportPdf(latest.id)}><Eye size={16} />Abrir última versão</Button>
              <Button variant="outline" onClick={() => void downloadReportPdf(latest.id, `synthesis-relatorio-v${latest.version}.pdf`)}><Download size={16} />Baixar última versão</Button>
            </>
          ) : null}
        />
        {report.isError || versions.isError ? <ErrorState onRetry={() => { void report.refetch(); void versions.refetch(); }} /> : null}
        {report.data ? (
          <div className="space-y-5">
            <section className="rounded-app border border-border bg-white p-6 shadow-subtle">
              <div className="mb-5 text-2xl font-semibold text-primary">synthesis</div>
              <p className="text-sm text-muted">Estado: {reportStatusLabel(report.data.status)}</p>
              <p className="text-sm text-muted">{report.data.selectedActivityIds.length} atividades na seleção original.</p>
              <p className="text-sm text-muted">{report.data.sections.flatMap((section) => section.cards).filter((card) => !card.removed).length} cards ativos.</p>
            </section>
            <section className="rounded-app border border-border bg-white p-5 shadow-subtle">
              <h2 className="text-lg font-semibold">Versões de PDF</h2>
              {!versions.isLoading && !versions.data?.length ? <p className="mt-3 text-sm text-muted">Nenhuma versão foi gerada.</p> : null}
              <div className="mt-3 divide-y divide-border">
                {versions.data?.map((version) => (
                  <div key={version.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">Versão {version.version}</p>
                      <p className="text-sm text-muted">
                        {new Date(version.generatedAt).toLocaleString("pt-BR")} · {users.data?.find((user) => user.id === version.generatedBy)?.name ?? "Gerente"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => void viewReportPdf(version.id)}><Eye size={16} />Abrir</Button>
                      <Button variant="outline" onClick={() => void downloadReportPdf(version.id, `synthesis-relatorio-v${version.version}.pdf`)}><Download size={16} />Baixar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : !report.isLoading ? (
          <EmptyState description="Relatório não encontrado." />
        ) : (
          <div className="rounded-app border border-border bg-white p-6">Carregando relatório.</div>
        )}
      </RoleGuard>
    </AppShell>
  );
}

