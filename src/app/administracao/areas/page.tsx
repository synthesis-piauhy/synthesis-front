"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/services/api";

export default function AreasAdminPage() {
  const areas = useQuery({ queryKey: ["areas"], queryFn: api.listAreas });
  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="Somente o administrador técnico pode gerenciar áreas." />}>
        <PageHeader title="Áreas" description="Áreas ativas disponíveis para relatos." />
        <section className="grid gap-3 md:grid-cols-3">
          {areas.data?.map((area) => <div key={area} className="rounded-app border border-border bg-white p-4 shadow-subtle">{area}</div>)}
        </section>
      </RoleGuard>
    </AppShell>
  );
}

