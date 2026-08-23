import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
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
