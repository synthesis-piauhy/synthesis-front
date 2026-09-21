"use client";

import { Pencil } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { PhotoGallery } from "@/components/activity/PhotoGallery";
import { ActivityEditForm } from "@/components/activity/ActivityEditForm";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/app/providers";
import { getActivityTemplate } from "@/components/activity/activityTemplates";

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const [editing, setEditing] = useState(false);
  const report = useQuery({
    queryKey: ["activityReport", params.id],
    queryFn: async () => (await api.getActivityReport(params.id)) ?? null,
  });
  const users = useQuery({ queryKey: ["users"], queryFn: api.listUsers, enabled: role !== "gestor" });
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const cycle = cycles.data?.find((item) => item.id === report.data?.cycleId);
  const ownsReport = role === "gestor" && user?.id === report.data?.managerId;
  const acceptsChanges = cycle?.status === "aberta" || cycle?.status === "reaberta";
  const canEdit = Boolean(ownsReport && acceptsChanges && cycle);
  const template = getActivityTemplate(report.data?.templateKey);

  return (
    <AppShell>
      {report.isLoading ? <div className="rounded-app border border-border bg-white p-6">Carregando relato.</div> : null}
      {report.isError ? <ErrorState onRetry={() => void report.refetch()} /> : null}
      {!report.isLoading && !report.data ? <EmptyState description="Relato não encontrado ou indisponível para este usuário." /> : null}
      {report.data ? (
        <>
          <PageHeader
            title={report.data.title}
            description="Detalhes do relato original enviado pelo gestor."
            actions={canEdit && !editing ? <Button onClick={() => setEditing(true)}><Pencil size={16} />Editar meu relato</Button> : null}
          />
          {editing && cycle ? (
            <ActivityEditForm report={report.data} cycle={cycle} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />
          ) : (
            <>
              {ownsReport && !acceptsChanges ? (
                <p className="mb-4 rounded-app border border-warning bg-white p-3 text-sm text-text">
                  Este ciclo está encerrado. O relato permanece disponível para consulta, mas não pode mais ser alterado.
                </p>
              ) : null}
              <article className="grid gap-5 lg:grid-cols-[1fr_360px]">
                <section className="space-y-5 rounded-app border border-border bg-white p-5 shadow-subtle">
                  <PhotoGallery photos={report.data.photos} />
                  <div>
                    <h2 className="text-lg font-semibold">{template.summaryLabel}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{report.data.summary}</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{template.resultLabel}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{report.data.result}</p>
                  </div>
                  {report.data.evidence ? <div><h2 className="text-lg font-semibold">{template.evidenceLabel}</h2><p className="mt-2 text-sm text-muted">{report.data.evidence}</p></div> : null}
                  {report.data.nextStep ? <div><h2 className="text-lg font-semibold">{template.nextStepLabel}</h2><p className="mt-2 text-sm text-muted">{report.data.nextStep}</p></div> : null}
                  {report.data.internalNotes ? (
                    <div className="rounded-app border border-border bg-page p-4">
                      <h2 className="text-base font-semibold">Informações complementares</h2>
                      <p className="text-xs text-muted">Conteúdo de consulta; não é publicado na síntese.</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{report.data.internalNotes}</p>
                    </div>
                  ) : null}
                </section>
                <aside className="space-y-3 rounded-app border border-border bg-white p-5 shadow-subtle">
                  <Badge>{report.data.area}</Badge>
                  <p className="text-sm"><strong>Modelo:</strong> {template.label} · v{report.data.templateVersion}</p>
                  <p className="text-sm"><strong>Data:</strong> {formatDate(report.data.date)}</p>
                  <p className="text-sm"><strong>Local:</strong> {report.data.location}</p>
                  <p className="text-sm"><strong>Gestor:</strong> {users.data?.find((item) => item.id === report.data?.managerId)?.name ?? user?.name}</p>
                  <p className="text-sm"><strong>Público beneficiado:</strong> {report.data.beneficiaries}</p>
                  <p className="text-sm"><strong>Ciclo:</strong> {cycle?.label ?? "Carregando..."}</p>
                  <p className="text-sm"><strong>Situação:</strong> {cycle?.status ?? "Carregando..."}</p>
                </aside>
              </article>
            </>
          )}
        </>
      ) : null}
    </AppShell>
  );
}
