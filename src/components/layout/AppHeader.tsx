"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Menu } from "lucide-react";
import { useAuth } from "@/app/providers";
import { api } from "@/services/api";
import { ProfileAvatar } from "@/components/ProfileAvatar";

const titles: Record<string, string> = {
  "/": "Início",
  "/relatos": "Relatos",
  "/relatos/novo": "Nova atividade",
  "/relatorio-semanal": "Mosaico semanal",
  "/relatorio-semanal/selecao": "Seleção editorial",
  "/historico": "Histórico e PDFs",
  "/administracao": "Administração",
  "/perfil": "Meu perfil",
};

const kindLabels = {
  conclusao: "Concluído",
  atividade: "Novo relato",
  ciclo: "Ciclo",
  prazo: "Prazo",
};

export function AppHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const title = titles[pathname] ?? (pathname.includes("editar") ? "Editor do mosaico" : pathname.startsWith("/relatorios/") ? "Versões do mosaico" : "synthesis");
  const notifications = useQuery({ queryKey: ["notifications", user?.id], queryFn: api.listNotifications, enabled: Boolean(user), refetchInterval: 60_000 });
  const markRead = useMutation({ mutationFn: api.markNotificationRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }) });
  const markAll = useMutation({ mutationFn: api.markAllNotificationsRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }) });
  const unread = notifications.data?.unreadCount ?? 0;

  useEffect(() => {
    document.title = `synthesis | ${title}`;
  }, [title]);
  useEffect(() => {
    const refresh = () => { void queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }); };
    window.addEventListener("synthesis:notifications-changed", refresh);
    return () => window.removeEventListener("synthesis:notifications-changed", refresh);
  }, [queryClient, user?.id]);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

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
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            className="relative grid size-10 place-items-center rounded-app border border-border bg-surface text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-accent"
            aria-label={`Notificações${unread ? `, ${unread} não lidas` : ""}`}
            aria-expanded={open}
            aria-controls="notifications-panel"
            onClick={() => { setOpen((value) => !value); void notifications.refetch(); }}
          >
            <Bell size={18} aria-hidden />
            {unread > 0 ? <span className="absolute -right-1 -top-1 grid min-w-5 h-5 place-items-center rounded-full bg-warning px-1 text-[10px] font-bold text-white ring-2 ring-white" aria-hidden>{unread > 9 ? "9+" : unread}</span> : null}
          </button>
          {open ? (
            <div id="notifications-panel" role="region" aria-label="Notificações" className="absolute right-0 top-12 w-[min(90vw,380px)] overflow-hidden rounded-app border border-border bg-white shadow-raised">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div><h2 className="font-semibold text-text">Notificações</h2><p className="text-xs text-muted">{unread ? `${unread} não lida${unread === 1 ? "" : "s"}` : "Tudo em dia"}</p></div>
                {unread ? <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline disabled:opacity-50" disabled={markAll.isPending} onClick={() => markAll.mutate()}><CheckCheck size={14} aria-hidden />Marcar todas como lidas</button> : null}
              </div>
              {markAll.isError ? <p role="alert" className="px-4 py-2 text-xs text-danger">Não foi possível marcar as notificações como lidas. Tente novamente.</p> : null}
              <div className="max-h-[min(65vh,480px)] overflow-y-auto">
                {notifications.isLoading ? <p className="p-4 text-sm text-muted">Carregando notificações...</p> : null}
                {notifications.isError ? <div className="p-4 text-sm text-danger">Não foi possível carregar. <button type="button" className="font-semibold underline" onClick={() => void notifications.refetch()}>Tentar novamente</button></div> : null}
                {notifications.data?.items.length === 0 ? <p className="p-5 text-sm text-muted">Nenhuma notificação por enquanto.</p> : null}
                {notifications.data?.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`block w-full border-b border-border/70 px-4 py-3 text-left transition last:border-0 hover:bg-page ${item.read ? "bg-white" : "bg-secondary/[0.055]"}`}
                    onClick={async () => {
                      if (!item.read) {
                        try { await markRead.mutateAsync(item.id); } catch { /* O destino continua acessível. */ }
                      }
                      setOpen(false);
                      router.push(item.href);
                    }}
                  >
                    <span className="flex items-center justify-between gap-2"><span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">{kindLabels[item.kind]}</span>{!item.read ? <span className="size-2 rounded-full bg-accent" aria-label="Não lida" /> : null}</span>
                    <span className="mt-1 block text-sm leading-5 text-text">{item.message}</span>
                    <span className="mt-1 block text-xs text-muted">{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <Link href="/perfil" aria-label="Abrir meu perfil" aria-current={pathname === "/perfil" ? "page" : undefined} className="hidden items-center gap-2 rounded-app border-l border-border pl-3 transition hover:text-secondary sm:flex">
          <ProfileAvatar user={{ name: user?.name ?? "Usuário", avatarUrl: user?.avatarUrl }} className="size-9 bg-primary text-sm font-semibold text-white" />
          <div className="max-w-44 leading-tight">
            <p className="truncate text-sm font-semibold text-text">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
