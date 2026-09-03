import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block animate-pulse rounded-app-sm bg-neutral-200", className)} />;
}

export function LoadingState({ cards = 3, label = "Carregando conteúdo" }: { cards?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-4">
      <span className="sr-only">{label}</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="rounded-app border border-border bg-surface p-5">
            <div className="flex items-center gap-3"><Skeleton className="size-10" /><Skeleton className="h-4 w-2/5" /></div>
            <Skeleton className="mt-5 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
