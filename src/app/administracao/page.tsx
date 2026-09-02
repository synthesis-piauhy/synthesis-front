"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/providers";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { administration, adminDescriptions, adminRoutes } from "@/services/administration";

export default function AdminPage() {
  const { role } = useAuth();
  const resources = useQuery({ queryKey: ["administration", "resources"], queryFn: administration.resources, enabled: role === "admin" });
  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="A administração é exclusiva do administrador técnico." />}>
        <PageHeader title="Administração" description="Gerencie cadastros e acessos e consulte os registros do synthesis." />
        {resources.isLoading ? <p role="status" className="p-4 text-muted">Carregando administração...</p> : null}
        {resources.isError ? <ErrorState message={resources.error.message} onRetry={() => void resources.refetch()} /> : null}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.data?.map((resource) => (
            <Link key={resource.key} href={`/administracao/${adminRoutes[resource.key]}`} className="rounded-app border border-border bg-white p-5 shadow-subtle hover:border-secondary">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{resource.title}</h2><span className="rounded-full bg-page px-2 py-1 text-sm text-muted">{resource.count}</span></div>
              <p className="mt-2 text-sm text-muted">{adminDescriptions[resource.key]}</p>
              <span className="mt-4 inline-block text-sm font-medium text-secondary">{resource.canCreate ? "Gerenciar" : "Consultar"} →</span>
            </Link>
          ))}
        </section>
      </RoleGuard>
    </AppShell>
  );
}
