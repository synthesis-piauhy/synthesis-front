import { CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import type { WeeklyCycle } from "@/types";

export function CollectionStatusBanner({ cycle }: { cycle: WeeklyCycle }) {
  const active = cycle.status === "aberta" || cycle.status === "reaberta";
  const StatusIcon = active ? Clock3 : CheckCircle2;
  return (
    <section className="relative overflow-hidden rounded-app border border-primary/10 bg-primary p-5 text-white shadow-subtle sm:p-6">
      <div className="absolute -right-10 -top-20 size-56 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-app bg-white/10"><CalendarClock className="text-accent" size={22} aria-hidden /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Ciclo atual</p>
            <h2 className="mt-1 text-lg font-semibold">{cycle.label}</h2>
            <p className="mt-1 text-sm text-white/65">Prazo final: {new Date(cycle.deadline).toLocaleString("pt-BR")}.</p>
          </div>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${active ? "bg-accent text-primary" : "bg-white/10 text-white"}`}><StatusIcon size={14} />Coleta {cycle.status}</span>
      </div>
    </section>
  );
}
