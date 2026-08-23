import { Inbox } from "lucide-react";

export function EmptyState({ title = "Nenhum resultado", description }: { title?: string; description: string }) {
  return (
    <div className="rounded-app border border-border bg-white p-8 text-center shadow-subtle">
      <Inbox className="mx-auto mb-3 text-secondary" aria-hidden size={28} />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}
