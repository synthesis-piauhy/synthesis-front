"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading || !user) {
    return <main className="flex min-h-screen items-center justify-center bg-page text-muted">Carregando sessão...</main>;
  }

  return (
    <div className="min-h-screen bg-page">
      <AppSidebar />
      <div className="pl-60">
        <AppHeader />
        <main className="mx-auto max-w-[1440px] px-8 py-6">{children}</main>
      </div>
    </div>
  );
}

