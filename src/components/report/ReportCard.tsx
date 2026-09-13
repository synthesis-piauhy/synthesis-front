import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
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
  const { setNodeRef, transform, transition, attributes, listeners } = useSortable({ id: card.id });
  const photo = activity?.photos.find((item) => item.id === card.selectedPhotoId) ?? activity?.photos[0];
  const classificationLabel = card.executiveClassification === "destaque" ? "Destaque" : card.executiveClassification === "atencao" ? "Ponto de atenção" : "Informativo";
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative break-inside-avoid",
        card.removed && "hidden",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "w-full rounded-app border bg-white p-2 pr-7 text-left shadow-subtle",
          selected ? "border-accent" : "border-border",
        )}
      >
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-secondary">{classificationLabel}</p>
        <h4 className="text-sm font-semibold text-primary">{card.editorialTitle}</h4>
        <p className="text-xs text-text"><strong>Resultado:</strong> {card.editorialResult}</p>
        {card.editorialEvidence ? <p className="rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">Evidência: {card.editorialEvidence}</p> : null}
        {photo ? <Image src={photo.url} alt={photo.alt} width={360} height={150} className="my-2 h-20 w-full rounded-md object-cover" unoptimized /> : null}
        <p className="text-xs text-text">{card.editorialSummary}</p>
        <p className="text-[11px] text-muted">{formatDate(card.originalDate)} · {card.originalLocation} · {card.originalBeneficiaries}</p>
        {card.editorialNextStep ? <p className="text-xs text-muted"><strong>Próximo passo:</strong> {card.editorialNextStep}{card.nextStepOwner ? ` — ${card.nextStepOwner}` : ""}{card.nextStepDueDate ? ` · ${formatDate(card.nextStepDueDate)}` : ""}</p> : null}
        {card.needsDecision ? <p className="rounded-md bg-danger/10 px-2 py-1 text-xs font-medium text-danger"><strong>Decisão:</strong> {card.decisionRequest || "pedido pendente"}</p> : null}
      </div>
      </button>
      <span
        {...attributes}
        {...listeners}
        aria-label={`Reordenar ${card.editorialTitle}`}
        className="absolute right-1 top-1 cursor-grab rounded p-1 text-muted hover:bg-page active:cursor-grabbing"
      >
        <GripVertical size={14} aria-hidden />
      </span>
    </div>
  );
}
