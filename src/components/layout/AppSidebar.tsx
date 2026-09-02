"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Clock, FilePlus2, Files, History, Home, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/app/providers";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/relatos", label: "Relatos", icon: Files },
  { href: "/relatos/novo", label: "Nova atividade", icon: FilePlus2, manager: true },
  { href: "/relatorio-semanal", label: "Relatório semanal", icon: BarChart3, editor: true },
  { href: "/historico", label: "Histórico", icon: History, editor: true },
  { href: "/administracao", label: "Administração", icon: Settings, admin: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-border bg-white">
      <div className="border-b border-border px-5 py-5">
        <div className="text-xl font-semibold tracking-normal text-primary">synthesis</div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Menu principal">
        {items
          .filter((item) =>
            (!item.admin || role === "admin") &&
            (!item.editor || role === "gerente") &&
            (!item.manager || role === "gestor"),
          )
          .map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-app px-3 text-sm font-medium text-text",
                  active ? "bg-primary text-white" : "hover:bg-page",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} aria-hidden />
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="border-t border-border p-4 text-sm">
        <div className="mb-3 flex items-center gap-2 text-muted">
          <Clock size={16} aria-hidden />
          Perfil ativo
        </div>
        <div className="font-semibold text-text">{user?.name ?? "Carregando"}</div>
        <div className="text-muted">{user?.area ?? "Área"}</div>
        <div className="mb-3 text-muted">{role}</div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut size={16} aria-hidden />
          Sair
        </Button>
      </div>
    </aside>
  );
}
