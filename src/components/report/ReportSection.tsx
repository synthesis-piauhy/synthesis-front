import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ActivityReport, ReportSection as ReportSectionType } from "@/types";
import { ReportCard } from "./ReportCard";

export function ReportSection({
  section,
  activities,
  selectedCardId,
  onSelect,
}: {
  section: ReportSectionType;
  activities: ActivityReport[];
  selectedCardId?: string;
  onSelect: (cardId: string) => void;
}) {
  const visibleCards = section.cards.filter((card) => !card.removed).sort((a, b) => a.order - b.order);
  return (
    <section className="mt-5">
      <h3 className="border-b border-border pb-2 text-base font-semibold text-primary">{section.title}</h3>
      <SortableContext items={visibleCards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {visibleCards.map((card) => (
            <ReportCard
              key={card.id}
              card={card}
              activity={activities.find((activity) => activity.id === card.activityReportId)}
              selected={card.id === selectedCardId}
              onSelect={() => onSelect(card.id)}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
