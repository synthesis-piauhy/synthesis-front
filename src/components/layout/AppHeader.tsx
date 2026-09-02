"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/app/providers";

const titles: Record<string, string> = {
  "/": "Início",
  "/relatos": "Relatos",
  "/relatos/novo": "Nova atividade",
  "/relatorio-semanal": "Relatório semanal",
  "/historico": "Histórico",
  "/administracao": "Administração",
};

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = titles[pathname] ?? (pathname.includes("editar") ? "Editor do relatório" : "synthesis");

  useEffect(() => {
    document.title = `synthesis | ${title}`;
  }, [title]);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-page px-8">
      <div>
        <p className="text-xs text-muted">synthesis | {title}</p>
        <h1 className="text-2xl font-semibold text-text">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-app border border-border bg-white p-2 text-primary" aria-label="Notificações">
          <Bell size={18} />
        </button>
        <span className="text-sm text-muted">{user?.email}</span>
      </div>
    </header>
  );
}
