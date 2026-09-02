"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { api } from "@/services/api";

export default function AreasAdminPage() {
  const areas = useQuery({ queryKey: ["areas"], queryFn: api.listAreas });
  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="Somente o administrador técnico pode consultar áreas." />}>
        <PageHeader title="Áreas" description="Áreas ativas disponíveis para relatos. Cadastros são feitos no Django Admin." />
        {areas.isLoading ? <div className="rounded-app border border-border bg-white p-6">Carregando áreas.</div> : null}
        {areas.isError ? <ErrorState message={areas.error.message} onRetry={() => void areas.refetch()} /> : null}
        {!areas.isLoading && !areas.data?.length ? <EmptyState description="Nenhuma área ativa cadastrada." /> : null}
        <section className="grid gap-3 md:grid-cols-3">
          {areas.data?.map((area) => <div key={area} className="rounded-app border border-border bg-white p-4 shadow-subtle">{area}</div>)}
        </section>
      </RoleGuard>
    </AppShell>
  );
}

