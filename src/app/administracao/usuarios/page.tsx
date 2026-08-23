"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

export default function UsersAdminPage() {
  const users = useQuery({ queryKey: ["users"], queryFn: api.listUsers });
  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="Somente o administrador técnico pode gerenciar usuários." />}>
        <PageHeader title="Usuários" description="Nome, e-mail, área, perfil e situação dos usuários." />
        <div className="overflow-hidden rounded-app border border-border bg-white shadow-subtle">
          <table className="w-full text-left text-sm">
            <thead className="bg-page text-muted"><tr><th className="p-3">Nome</th><th>E-mail</th><th>Área</th><th>Perfil</th><th>Situação</th></tr></thead>
            <tbody>{users.data?.map((user) => <tr key={user.id} className="border-t border-border"><td className="p-3 font-medium">{user.name}</td><td>{user.email}</td><td>{user.area}</td><td>{user.role}</td><td><Badge>{user.active ? "ativo" : "inativo"}</Badge></td></tr>)}</tbody>
          </table>
        </div>
      </RoleGuard>
    </AppShell>
  );
}
