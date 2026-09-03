import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title = "Nenhum resultado", description, action }: { title?: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-app border border-dashed border-border bg-white p-8 text-center shadow-subtle sm:p-10">
      <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-secondary/10 text-secondary"><Inbox aria-hidden size={23} /></span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
