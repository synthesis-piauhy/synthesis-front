import type { ActivityReport, ReportSection as ReportSectionType } from "@/types";
import { ReportSection } from "./ReportSection";

export function ReportPage({
  page,
  cycleLabel,
  sections,
  activities,
  selectedCardId,
  onSelect,
}: {
  page: number;
  cycleLabel: string;
  sections: ReportSectionType[];
  activities: ActivityReport[];
  selectedCardId?: string;
  onSelect: (cardId: string) => void;
}) {
  return (
    <div className="a4-page w-[560px] shrink-0 overflow-hidden rounded-app border border-border bg-white p-8 shadow-subtle">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div className="text-xl font-semibold text-primary">synthesis</div>
        <div className="text-right text-sm text-muted">{cycleLabel}</div>
      </header>
      {sections.map((section) => (
        <ReportSection key={section.id} section={section} activities={activities} selectedCardId={selectedCardId} onSelect={onSelect} />
      ))}
      <footer className="mt-4 border-t border-border pt-3 text-right text-xs text-muted">Página {page}</footer>
    </div>
  );
}
