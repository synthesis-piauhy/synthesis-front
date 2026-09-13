"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import type { ActivityReport, WeeklyReport } from "@/types";
import { ReportPage } from "./ReportPage";
import { ExecutiveReportPage } from "./ExecutiveReportPage";

export function ReportCanvas({
  report,
  cycleLabel,
  activities,
  selectedCardId,
  onSelectCard,
  onReorder,
}: {
  report: WeeklyReport;
  cycleLabel: string;
  activities: ActivityReport[];
  selectedCardId?: string;
  onSelectCard: (cardId: string) => void;
  onReorder: (sectionId: string, activeId: string, overId: string) => void;
}) {
  const sections = report.sections.filter((section) => section.cards.some((card) => !card.removed));

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const section = report.sections.find((item) => item.cards.some((card) => card.id === event.active.id));
    if (section) onReorder(section.id, String(event.active.id), String(event.over.id));
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-[760px] space-y-6 overflow-auto rounded-app border border-border bg-neutral-100 p-6">
        <div className="flex justify-center"><ExecutiveReportPage report={report} cycleLabel={cycleLabel} /></div>
        <div className="flex justify-center"><ReportPage page={2} cycleLabel={cycleLabel} sections={sections} activities={activities} selectedCardId={selectedCardId} onSelect={onSelectCard} /></div>
      </div>
    </DndContext>
  );
}
