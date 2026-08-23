import Link from "next/link";
import { Building2, Clock, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";

const cards = [
  { href: "/administracao/usuarios", title: "Usuários", icon: Users },
  { href: "/administracao/areas", title: "Áreas", icon: Building2 },
  { href: "/administracao/prazos", title: "Prazos", icon: Clock },
];

export default function AdminPage() {
  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="A administração é exclusiva do administrador técnico." />}>
        <PageHeader title="Administração" description="Estruturas visuais para configurações técnicas do synthesis." />
        <section className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="rounded-app border border-border bg-white p-5 shadow-subtle hover:border-secondary">
                <Icon className="mb-3 text-secondary" size={24} />
                <h2 className="text-lg font-semibold">{card.title}</h2>
              </Link>
            );
          })}
        </section>
      </RoleGuard>
    </AppShell>
  );
}
