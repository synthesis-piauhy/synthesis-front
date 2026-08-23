import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("min-h-10 w-full rounded-app border border-border bg-white px-3 py-2 text-sm", props.className)} />;
}
