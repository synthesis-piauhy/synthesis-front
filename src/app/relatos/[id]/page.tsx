"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { PhotoGallery } from "@/components/activity/PhotoGallery";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { formatDate } from "@/lib/utils";

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const report = useQuery({ queryKey: ["activityReport", params.id], queryFn: () => api.getActivityReport(params.id) });
  const users = useQuery({ queryKey: ["users"], queryFn: api.listUsers });

  return (
    <AppShell>
      {report.isLoading ? <div className="rounded-app border border-border bg-white p-6">Carregando relato.</div> : null}
      {report.isError ? <ErrorState onRetry={() => void report.refetch()} /> : null}
      {!report.isLoading && !report.data ? <EmptyState description="Relato não encontrado." /> : null}
      {report.data ? (
        <>
          <PageHeader title={report.data.title} description="Detalhes do relato original enviado pelo gestor." />
          <article className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <section className="space-y-5 rounded-app border border-border bg-white p-5 shadow-subtle">
              <PhotoGallery photos={report.data.photos} />
              <div>
                <h2 className="text-lg font-semibold">Descrição resumida</h2>
                <p className="mt-2 text-sm text-muted">{report.data.summary}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Resultado alcançado</h2>
                <p className="mt-2 text-sm text-muted">{report.data.result}</p>
              </div>
            </section>
            <aside className="space-y-3 rounded-app border border-border bg-white p-5 shadow-subtle">
              <Badge>{report.data.area}</Badge>
              <p className="text-sm"><strong>Data:</strong> {formatDate(report.data.date)}</p>
              <p className="text-sm"><strong>Local:</strong> {report.data.location}</p>
              <p className="text-sm"><strong>Gestor:</strong> {users.data?.find((item) => item.id === report.data?.managerId)?.name}</p>
              <p className="text-sm"><strong>Público beneficiado:</strong> {report.data.beneficiaries}</p>
            </aside>
          </article>
        </>
      ) : null}
    </AppShell>
  );
}
