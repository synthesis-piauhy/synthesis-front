import { CalendarClock } from "lucide-react";
import type { CollectionOverview } from "@/types";

export function CollectionStatusBanner({ overview }: { overview: CollectionOverview }) {
  return (
    <section className="rounded-app border border-border bg-white p-5 shadow-subtle">
      <div className="flex items-center gap-3">
        <CalendarClock className="text-secondary" size={22} aria-hidden />
        <div>
          <h2 className="text-lg font-semibold">Coleta {overview.cycle.status}</h2>
          <p className="text-sm text-muted">
            Semana de {overview.cycle.label}. Prazo final: {new Date(overview.cycle.deadline).toLocaleString("pt-BR")}.
          </p>
        </div>
      </div>
    </section>
  );
}
