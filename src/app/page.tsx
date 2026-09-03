"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, ClipboardList, FilePlus2, FileText, Users } from "lucide-react";
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
  const pendingManagers = useQuery({
    queryKey: ["pendingManagers"],
    queryFn: api.getPendingManagers,
    enabled: editorView,
  });

  if (cycles.isLoading || reports.isLoading || (editorView && (overview.isLoading || pendingManagers.isLoading))) {
    return <AppShell><div className="rounded-app border border-border bg-white p-6">Carregando situação da coleta.</div></AppShell>;
  }
  if (cycles.isError || reports.isError || (editorView && (overview.isError || pendingManagers.isError))) {
    return <AppShell><ErrorState onRetry={() => { void cycles.refetch(); void reports.refetch(); void overview.refetch(); void pendingManagers.refetch(); }} /></AppShell>;
  }
  if (!cycle) return <AppShell><EmptyState description="Nenhum ciclo semanal foi cadastrado." /></AppShell>;

  const mine = reports.data?.filter((report) => report.managerId === user?.id) ?? [];
  const hasSubmitted = mine.length > 0;
  const stats = overview.data ? [
    { label: "Gestores que enviaram", value: overview.data.submittedManagers.length, icon: CheckCircle2, tone: "text-success bg-success/10" },
    { label: "Gestores pendentes", value: pendingManagers.data?.length ?? 0, icon: CircleAlert, tone: "text-warning bg-warning/10" },
    { label: "Relatos recebidos", value: overview.data.totalReports, icon: ClipboardList, tone: "text-secondary bg-secondary/10" },
    { label: "Estado do relatório", value: reportStatusLabel(overview.data.reportStatus), icon: FileText, tone: "text-primary bg-primary/10" },
  ] : [];

  return (
    <AppShell>
      <PageHeader title="Situação da coleta desta semana" description="Visão objetiva do período atual de registros semanais." />
      <div className="space-y-5">
        <CollectionStatusBanner cycle={cycle} />
        {overview.data ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="group rounded-app border border-border bg-white p-5 shadow-subtle transition hover:-translate-y-0.5 hover:shadow-raised">
                <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-muted">{label}</p><span className={`grid size-9 shrink-0 place-items-center rounded-app ${tone}`}><Icon size={18} /></span></div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-primary">{value}</p>
              </div>
            ))}
          </section>
        ) : null}
        {role === "gerente" && overview.data ? (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-app border border-border bg-white p-5 shadow-subtle">
              <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-app bg-success/10 text-success"><Users size={18} /></span><div><h2 className="font-semibold">Envios recebidos</h2><p className="text-xs text-muted">Gestores com relato nesta semana</p></div></div>
              <ul className="mt-4 divide-y divide-border/70">{overview.data.submittedManagers.map((item) => <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" key={item.id}><span className="grid size-8 place-items-center rounded-full bg-page text-xs font-semibold text-primary">{item.name.charAt(0)}</span><span><span className="block text-sm font-medium text-text">{item.name}</span><span className="block text-xs text-muted">{item.area}</span></span><CheckCircle2 className="ml-auto text-success" size={17} /></li>)}</ul>
            </div>
            <div className="rounded-app border border-border bg-white p-5 shadow-subtle">
              <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-app bg-warning/10 text-warning"><CircleAlert size={18} /></span><div><h2 className="font-semibold">Envios pendentes</h2><p className="text-xs text-muted">Acompanhe quem ainda não enviou</p></div></div>
              {pendingManagers.data?.length ? (
                <ul className="mt-4 divide-y divide-border/70">{pendingManagers.data.map((item) => <li className="flex items-center gap-3 py-3 first:pt-0" key={item.id}><span className="grid size-8 place-items-center rounded-full bg-page text-xs font-semibold text-primary">{item.name.charAt(0)}</span><span><span className="block text-sm font-medium text-text">{item.name}</span><span className="block text-xs text-muted">{item.area}</span></span></li>)}</ul>
              ) : <p className="mt-3 text-sm text-muted">Todos os gestores enviaram ao menos um relato.</p>}
              <Link className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-secondary" href="/relatorio-semanal/selecao">
                Iniciar seleção <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        ) : role === "admin" ? (
          <section className="rounded-app border border-border bg-white p-5 shadow-subtle sm:p-6">
            <h2 className="text-lg font-semibold">Administração técnica</h2>
            <p className="mt-2 text-sm text-muted">Use a área de administração para consultar cadastros e reabrir excepcionalmente um período.</p>
            <Link className="mt-4 inline-flex min-h-10 items-center rounded-app bg-primary px-4 py-2 text-sm font-medium text-white" href="/administracao">
              Abrir administração
            </Link>
          </section>
        ) : (
          <section className="rounded-app border border-border bg-white p-5 shadow-subtle sm:p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
