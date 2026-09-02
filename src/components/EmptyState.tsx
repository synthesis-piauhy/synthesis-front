import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title = "Nenhum resultado", description, action }: { title?: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-app border border-border bg-white p-8 text-center shadow-subtle">
      <Inbox className="mx-auto mb-3 text-secondary" aria-hidden size={28} />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
