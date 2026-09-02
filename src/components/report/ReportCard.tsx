import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ActivityReport, ReportCard as ReportCardType } from "@/types";
import { cn, formatDate } from "@/lib/utils";

export function ReportCard({
  card,
  activity,
  selected,
  onSelect,
}: {
  card: ReportCardType;
  activity?: ActivityReport;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const sortable = useSortable({ id: card.id });
  const photo = activity?.photos.find((item) => item.id === card.selectedPhotoId) ?? activity?.photos[0];
  return (
    <button
      ref={sortable.setNodeRef}
      style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }}
      {...sortable.attributes}
      {...sortable.listeners}
      onClick={onSelect}
      className={cn(
        "break-inside-avoid rounded-app border bg-white p-2 text-left shadow-subtle",
        selected ? "border-accent" : "border-border",
        card.removed && "hidden",
      )}
    >
      {photo ? <Image src={photo.url} alt={photo.alt} width={360} height={190} className="h-28 w-full rounded-md object-cover" unoptimized /> : null}
      <div className="mt-2 space-y-1">
        <h4 className="text-sm font-semibold text-primary">{card.editorialTitle}</h4>
        <p className="text-xs text-muted">{formatDate(card.originalDate)}</p>
        <p className="text-xs text-text">{card.editorialResult}</p>
      </div>
    </button>
  );
}
