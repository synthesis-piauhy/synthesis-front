"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading || !user) {
    return <main className="flex min-h-screen items-center justify-center bg-page text-muted">Carregando sessão...</main>;
  }

  return (
    <div className="min-h-screen bg-page">
      <a href="#conteudo-principal" className="fixed left-4 top-3 z-50 -translate-y-20 rounded-app bg-primary px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0">
        Ir para o conteúdo
      </a>
      <AppSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="min-w-0 lg:pl-64">
        <AppHeader onMenuOpen={() => setMenuOpen(true)} />
        <main id="conteudo-principal" className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
