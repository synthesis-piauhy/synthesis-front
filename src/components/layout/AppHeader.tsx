"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import { useAuth } from "@/app/providers";

const titles: Record<string, string> = {
  "/": "Início",
  "/relatos": "Relatos",
  "/relatos/novo": "Nova atividade",
  "/relatorio-semanal": "Mosaico semanal",
  "/relatorio-semanal/selecao": "Seleção editorial",
  "/historico": "Histórico e PDFs",
  "/administracao": "Administração",
};

export function AppHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = titles[pathname] ?? (pathname.includes("editar") ? "Editor do mosaico" : pathname.startsWith("/relatorios/") ? "Versões do mosaico" : "synthesis");

  useEffect(() => {
    document.title = `synthesis | ${title}`;
  }, [title]);

  return (
    <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-white/70 bg-page/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenuOpen} className="grid size-10 shrink-0 place-items-center rounded-app border border-border bg-white text-primary shadow-sm lg:hidden" aria-label="Abrir menu">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Área de trabalho</p>
          <h1 className="truncate text-lg font-semibold tracking-tight text-text sm:text-xl">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className="relative grid size-10 place-items-center rounded-app border border-border bg-surface text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-accent" aria-label="Notificações">
          <Bell size={18} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-warning ring-2 ring-white" aria-hidden />
        </button>
        <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-white">{user?.name?.charAt(0) ?? "U"}</span>
          <div className="max-w-44 leading-tight">
            <p className="truncate text-sm font-semibold text-text">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
