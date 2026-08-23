import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex rounded-md border border-border bg-white px-2 py-1 text-xs font-medium text-muted", className)}>{children}</span>;
}
