"use client";

import { RotateCcw, Scissors, Trash2, Undo2 } from "lucide-react";
import type { ActivityReport, ReportCard } from "@/types";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { Select } from "../ui/select";

export function CardPropertiesPanel({
  card,
  activity,
  onChange,
  onRestore,
  onRemove,
  onCrop,
  onUndo,
}: {
  card?: ReportCard;
  activity?: ActivityReport;
  onChange: (changes: Partial<ReportCard>) => void;
  onRestore: () => void;
  onRemove: () => void;
  onCrop: () => void;
  onUndo: () => void;
}) {
  if (!card || !activity) {
    return <aside className="rounded-app border border-border bg-white p-4 text-sm text-muted">Selecione um card para editar.</aside>;
  }

  return (
    <aside className="space-y-4 rounded-app border border-border bg-white p-4 shadow-subtle">
      <p className="rounded-app border border-border bg-page p-3 text-sm text-muted">
        As alterações desta tela afetam somente o relatório. O relato original enviado pelo gestor será preservado.
      </p>
      <label className="block text-sm font-medium">
        Título editorial
        <Input className="mt-1" value={card.editorialTitle} onChange={(event) => onChange({ editorialTitle: event.target.value })} />
      </label>
      <label className="block text-sm font-medium">
        Descrição
        <Textarea className="mt-1" value={card.editorialSummary} onChange={(event) => onChange({ editorialSummary: event.target.value })} />
      </label>
      <label className="block text-sm font-medium">
        Resultado apresentado
        <Textarea className="mt-1" value={card.editorialResult} onChange={(event) => onChange({ editorialResult: event.target.value })} />
      </label>
      <label className="block text-sm font-medium">
        Foto principal do card
        <Select className="mt-1" value={card.selectedPhotoId} onChange={(event) => onChange({ selectedPhotoId: event.target.value })}>
          {activity.photos.map((photo) => (
            <option key={photo.id} value={photo.id}>
              {photo.name}
            </option>
          ))}
        </Select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onCrop}>
          <Scissors size={16} aria-hidden />
          Recortar
        </Button>
        <Button variant="outline" onClick={onRestore}>
          <RotateCcw size={16} aria-hidden />
          Restaurar
        </Button>
        <Button variant="outline" onClick={onUndo}>
          <Undo2 size={16} aria-hidden />
          Desfazer
        </Button>
        <Button variant="danger" onClick={onRemove}>
          <Trash2 size={16} aria-hidden />
          Retirar
        </Button>
      </div>
      <dl className="space-y-2 border-t border-border pt-4 text-sm">
        <div>
          <dt className="font-medium">Autor original</dt>
          <dd className="text-muted">Preservado no relato</dd>
        </div>
        <div>
          <dt className="font-medium">Área original</dt>
          <dd className="text-muted">{card.area}</dd>
        </div>
        <div>
          <dt className="font-medium">Data original</dt>
          <dd className="text-muted">{card.originalDate}</dd>
        </div>
      </dl>
    </aside>
  );
}
