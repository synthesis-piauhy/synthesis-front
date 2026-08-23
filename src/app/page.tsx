"use client";

import Link from "next/link";
import { FilePlus2, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { CollectionStatusBanner } from "@/components/CollectionStatusBanner";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "./providers";
import { api } from "@/services/api";
import { reportStatusLabel } from "@/lib/utils";

export default function HomePage() {
  const { role, user } = useAuth();
  const overview = useQuery({ queryKey: ["overview"], queryFn: api.getCollectionOverview });
  const reports = useQuery({ queryKey: ["activityReports"], queryFn: () => api.listActivityReports({ cycleId: "c1" }) });

  if (overview.isLoading) return <AppShell><div className="rounded-app border border-border bg-white p-6">Carregando situação da coleta.</div></AppShell>;
  if (overview.isError || !overview.data) return <AppShell><ErrorState onRetry={() => void overview.refetch()} /></AppShell>;

  const mine = reports.data?.filter((report) => report.managerId === user?.id) ?? [];
  const hasSubmitted = mine.length > 0;
  const stats = [
    ["Gestores que enviaram", overview.data.submittedManagers.length],
    ["Gestores pendentes", overview.data.pendingManagers.length],
    ["Relatos recebidos", overview.data.totalReports],
    ["Estado do relatório", reportStatusLabel(overview.data.reportStatus)],
  ];

  return (
    <AppShell>
      <PageHeader title="Situação da coleta desta semana" description="Visão objetiva do período atual de registros semanais." />
      <div className="space-y-5">
        <CollectionStatusBanner overview={overview.data} />
        <section className="grid gap-4 md:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-app border border-border bg-white p-4 shadow-subtle">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-primary">{value}</p>
            </div>
          ))}
        </section>
        {role === "gerente" ? (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-app border border-border bg-white p-4">
              <h2 className="text-lg font-semibold">Gestores que enviaram</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted">{overview.data.submittedManagers.map((item) => <li key={item.id}>{item.name} · {item.area}</li>)}</ul>
            </div>
            <div className="rounded-app border border-border bg-white p-4">
              <h2 className="text-lg font-semibold">Gestores pendentes</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted">{overview.data.pendingManagers.map((item) => <li key={item.id}>{item.name} · {item.area}</li>)}</ul>
              <div className="mt-4 flex gap-2">
                <Link className="inline-flex min-h-10 items-center justify-center rounded-app bg-primary px-4 py-2 text-sm font-medium text-white" href="/relatorio-semanal/selecao">
                  Iniciar seleção
                </Link>
                <Button variant="outline"><RotateCcw size={16} aria-hidden />Reabrir período</Button>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-app border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{hasSubmitted ? "Você já enviou relatos nesta semana" : "Você ainda não enviou relatos nesta semana"}</h2>
              <Link href="/relatos/novo" className="inline-flex min-h-10 items-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-medium text-white">
                <FilePlus2 size={16} aria-hidden />
                Registrar atividade
              </Link>
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
