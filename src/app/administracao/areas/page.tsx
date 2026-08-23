import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { areas } from "@/services/mock-data";

export default function AreasAdminPage() {
  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="Somente o administrador técnico pode gerenciar áreas." />}>
        <PageHeader title="Áreas" description="Cadastro inicial de áreas disponíveis para relatos." />
        <section className="grid gap-3 md:grid-cols-3">
          {areas.map((area) => <div key={area} className="rounded-app border border-border bg-white p-4 shadow-subtle">{area}</div>)}
        </section>
      </RoleGuard>
    </AppShell>
  );
}
