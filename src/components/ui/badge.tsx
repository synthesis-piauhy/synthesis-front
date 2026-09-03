import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full border border-secondary/15 bg-secondary/[0.07] px-2.5 py-1 text-[11px] font-semibold text-secondary", className)}>{children}</span>;
}
