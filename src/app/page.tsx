"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { CollectionStatusBanner } from "@/components/CollectionStatusBanner";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "./providers";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";
import { reportStatusLabel } from "@/lib/utils";

export default function HomePage() {
  const { role, user } = useAuth();
  const editorView = role === "gerente" || role === "admin";
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const cycle = currentCycle(cycles.data);
  const reports = useQuery({
    queryKey: ["activityReports", cycle?.id],
    queryFn: () => api.listActivityReports({ cycleId: cycle?.id }),
    enabled: Boolean(cycle),
  });
  const overview = useQuery({
    queryKey: ["overview"],
    queryFn: api.getCollectionOverview,
    enabled: editorView,
  });

  if (cycles.isLoading || reports.isLoading || (editorView && overview.isLoading)) {
    return <AppShell><div className="rounded-app border border-border bg-white p-6">Carregando situação da coleta.</div></AppShell>;
  }
  if (cycles.isError || reports.isError || (editorView && overview.isError)) {
    return <AppShell><ErrorState onRetry={() => { void cycles.refetch(); void reports.refetch(); void overview.refetch(); }} /></AppShell>;
  }
  if (!cycle) return <AppShell><EmptyState description="Nenhum ciclo semanal foi cadastrado." /></AppShell>;

  const mine = reports.data?.filter((report) => report.managerId === user?.id) ?? [];
  const hasSubmitted = mine.length > 0;
  const stats = overview.data ? [
    ["Gestores que enviaram", overview.data.submittedManagers.length],
    ["Gestores pendentes", overview.data.pendingManagers.length],
    ["Relatos recebidos", overview.data.totalReports],
    ["Estado do relatório", reportStatusLabel(overview.data.reportStatus)],
  ] : [];

  return (
    <AppShell>
      <PageHeader title="Situação da coleta desta semana" description="Visão objetiva do período atual de registros semanais." />
      <div className="space-y-5">
        <CollectionStatusBanner cycle={cycle} />
        {overview.data ? (
          <section className="grid gap-4 md:grid-cols-4">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-app border border-border bg-white p-4 shadow-subtle">
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-primary">{value}</p>
              </div>
            ))}
          </section>
        ) : null}
        {role === "gerente" && overview.data ? (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-app border border-border bg-white p-4">
              <h2 className="text-lg font-semibold">Gestores que enviaram</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted">{overview.data.submittedManagers.map((item) => <li key={item.id}>{item.name} · {item.area}</li>)}</ul>
            </div>
            <div className="rounded-app border border-border bg-white p-4">
              <h2 className="text-lg font-semibold">Gestores pendentes</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted">{overview.data.pendingManagers.map((item) => <li key={item.id}>{item.name} · {item.area}</li>)}</ul>
              <Link className="mt-4 inline-flex min-h-10 items-center justify-center rounded-app bg-primary px-4 py-2 text-sm font-medium text-white" href="/relatorio-semanal/selecao">
                Iniciar seleção
              </Link>
            </div>
          </section>
        ) : role === "admin" ? (
          <section className="rounded-app border border-border bg-white p-4">
            <h2 className="text-lg font-semibold">Administração técnica</h2>
            <p className="mt-2 text-sm text-muted">Use a área de administração para consultar cadastros e reabrir excepcionalmente um período.</p>
            <Link className="mt-4 inline-flex min-h-10 items-center rounded-app bg-primary px-4 py-2 text-sm font-medium text-white" href="/administracao">
              Abrir administração
            </Link>
          </section>
        ) : (
          <section className="rounded-app border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{hasSubmitted ? "Você já enviou relatos nesta semana" : "Você ainda não enviou relatos nesta semana"}</h2>
              {(cycle.status === "aberta" || cycle.status === "reaberta") ? (
                <Link href="/relatos/novo" className="inline-flex min-h-10 items-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-medium text-white">
                  <FilePlus2 size={16} aria-hidden />
                  Registrar atividade
                </Link>
              ) : null}
            </div>
            <div className="mt-4">
              {mine.length ? <ul className="space-y-2 text-sm text-muted">{mine.map((item) => <li key={item.id}>{item.title}</li>)}</ul> : <EmptyState description="Não há relatos seus para a semana atual." />}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

