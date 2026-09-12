"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Archive, FilePlus2, Files, LayoutGrid, ListChecks, Home, LogOut, Settings, X, type LucideIcon } from "lucide-react";
import { useAuth } from "@/app/providers";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: (pathname: string) => boolean;
};

const mainItems: NavigationItem[] = [
  { href: "/", label: "Início", icon: Home, active: (pathname) => pathname === "/" },
  { href: "/relatos", label: "Relatos", icon: Files, active: (pathname) => pathname === "/relatos" || (pathname.startsWith("/relatos/") && pathname !== "/relatos/novo") },
];

const mosaicItems: NavigationItem[] = [
  {
    href: "/relatorio-semanal",
    label: "Visão geral",
    icon: LayoutGrid,
    active: (pathname) => pathname === "/relatorio-semanal" || (pathname.startsWith("/relatorio-semanal/") && pathname !== "/relatorio-semanal/selecao"),
  },
  { href: "/relatorio-semanal/selecao", label: "Seleção editorial", icon: ListChecks, active: (pathname) => pathname === "/relatorio-semanal/selecao" },
  { href: "/historico", label: "Histórico e PDFs", icon: Archive, active: (pathname) => pathname.startsWith("/historico") || pathname.startsWith("/relatorios/") },
];

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const [leaving, setLeaving] = useState(false);

  function renderItem(item: NavigationItem, nested = false) {
    const active = item.active(pathname);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={cn(
          "group flex min-h-11 items-center gap-3 rounded-app px-3 text-sm font-medium transition",
          nested && "ml-2 min-h-10 text-[13px]",
          active ? "bg-white text-primary shadow-sm" : "text-white/72 hover:bg-white/10 hover:text-white",
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={nested ? 16 : 18} aria-hidden />
        {item.label}
      </Link>
    );
  }

  return (
    <>
      <button type="button" aria-label="Fechar menu" onClick={onClose} className={cn("fixed inset-0 z-30 bg-primary/35 backdrop-blur-sm transition lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} />
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-primary text-white shadow-raised transition-transform duration-300 lg:translate-x-0 lg:shadow-none", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
        <div>
          <div className="text-xl font-semibold tracking-tight">synthesis<span className="text-accent">.</span></div>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">Relatos semanais</p>
        </div>
        <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-app text-white/70 hover:bg-white/10 lg:hidden" aria-label="Fechar menu"><X size={20} /></button>
      </div>
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5" aria-label="Menu principal">
        {mainItems.map((item) => renderItem(item))}
        {role === "gestor" ? renderItem({ href: "/relatos/novo", label: "Nova atividade", icon: FilePlus2, active: (current) => current === "/relatos/novo" }) : null}

        {role === "gerente" ? (
          <section className="pt-5" aria-labelledby="mosaic-navigation">
            <div id="mosaic-navigation" className="mb-2 flex items-center gap-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              <LayoutGrid size={13} aria-hidden />
              Mosaico
            </div>
            <div className="space-y-1">{mosaicItems.map((item) => renderItem(item, true))}</div>
          </section>
        ) : null}

        {role === "admin" ? (
          <section className="pt-5" aria-labelledby="system-navigation">
            <div id="system-navigation" className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Sistema</div>
            {renderItem({ href: "/administracao", label: "Administração", icon: Settings, active: (current) => current.startsWith("/administracao") })}
          </section>
        ) : null}
      </nav>
      <div className="border-t border-white/10 p-4 text-sm">
        <div className="mb-3 flex items-center gap-3 rounded-app bg-white/[0.07] p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-semibold text-primary">{user?.name?.charAt(0) ?? "U"}</span>
          <div className="min-w-0"><div className="truncate font-semibold text-white">{user?.name ?? "Carregando"}</div><div className="truncate text-xs text-white/55">{user?.area ?? "Área"} · {role}</div></div>
        </div>
        <Button
          disabled={leaving}
          variant="outline"
          className="w-full justify-start border-white/15 bg-transparent text-white hover:border-white/30 hover:bg-white/10"
          onClick={async () => {
            setLeaving(true);
            setLogoutError("");
            try { await logout(); router.replace("/login"); }
            catch (error) { setLogoutError((error as Error).message); }
            finally { setLeaving(false); }
          }}
        >
          <LogOut size={16} aria-hidden />
          Sair
        </Button>
        {logoutError ? <p role="alert" className="mt-2 text-sm">{logoutError}</p> : null}
      </div>
      </aside>
    </>
  );
}
