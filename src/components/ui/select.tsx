import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("min-h-11 w-full rounded-app border border-border bg-surface px-3.5 py-2 text-sm text-text shadow-sm transition hover:border-secondary/60 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/10 disabled:cursor-not-allowed disabled:bg-page", props.className)} />;
}
