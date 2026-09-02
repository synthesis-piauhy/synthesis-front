"use client";

import { RotateCcw, Trash2, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ActivityReport, ReportCard } from "@/types";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { Select } from "../ui/select";

type EditorialFields = Pick<ReportCard, "editorialTitle" | "editorialSummary" | "editorialResult">;

export function CardPropertiesPanel({
  card,
  activity,
  saving,
  error,
  onSave,
  onRestore,
  onRemove,
  onUndo,
}: {
  card?: ReportCard;
  activity?: ActivityReport;
  saving?: boolean;
  error?: string;
  onSave: (changes: Partial<ReportCard>) => void;
  onRestore: () => void;
  onRemove: () => void;
  onUndo: () => void;
}) {
  const [draft, setDraft] = useState<EditorialFields>({
    editorialTitle: "",
    editorialSummary: "",
    editorialResult: "",
  });

  useEffect(() => {
    if (!card) return;
    setDraft({
      editorialTitle: card.editorialTitle,
      editorialSummary: card.editorialSummary,
      editorialResult: card.editorialResult,
    });
  }, [card]);

  if (!card || !activity) {
    return <aside className="rounded-app border border-border bg-white p-4 text-sm text-muted">Selecione um card para editar.</aside>;
  }

  function commit(field: keyof EditorialFields) {
    const value = draft[field].trim();
    if (!value || value === card?.[field]) return;
    onSave({ [field]: value });
  }

  return (
    <aside className="space-y-4 rounded-app border border-border bg-white p-4 shadow-subtle">
      <p className="rounded-app border border-border bg-page p-3 text-sm text-muted">
        As alterações afetam somente o relatório. O relato original enviado pelo gestor será preservado.
      </p>
      <label className="block text-sm font-medium">
        Título editorial
        <Input
          className="mt-1"
          value={draft.editorialTitle}
          onChange={(event) => setDraft((current) => ({ ...current, editorialTitle: event.target.value }))}
          onBlur={() => commit("editorialTitle")}
        />
        {!draft.editorialTitle.trim() ? <span className="text-xs text-danger">O título não pode ficar vazio.</span> : null}
      </label>
      <label className="block text-sm font-medium">
        Descrição
        <Textarea
          className="mt-1"
          value={draft.editorialSummary}
          onChange={(event) => setDraft((current) => ({ ...current, editorialSummary: event.target.value }))}
          onBlur={() => commit("editorialSummary")}
        />
        {!draft.editorialSummary.trim() ? <span className="text-xs text-danger">A descrição não pode ficar vazia.</span> : null}
      </label>
      <label className="block text-sm font-medium">
        Resultado apresentado
        <Textarea
          className="mt-1"
          value={draft.editorialResult}
          onChange={(event) => setDraft((current) => ({ ...current, editorialResult: event.target.value }))}
          onBlur={() => commit("editorialResult")}
        />
        {!draft.editorialResult.trim() ? <span className="text-xs text-danger">O resultado não pode ficar vazio.</span> : null}
      </label>
      <label className="block text-sm font-medium">
        Foto principal do card
        <Select className="mt-1" value={card.selectedPhotoId} disabled={saving} onChange={(event) => onSave({ selectedPhotoId: event.target.value })}>
          {activity.photos.map((photo) => <option key={photo.id} value={photo.id}>{photo.name}</option>)}
        </Select>
      </label>
      {error ? <p role="alert" className="rounded-app border border-danger p-3 text-sm text-danger">{error}</p> : null}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onRestore} disabled={saving}>
          <RotateCcw size={16} aria-hidden />
          Restaurar original
        </Button>
        <Button variant="outline" onClick={onUndo} disabled={saving}>
          <Undo2 size={16} aria-hidden />
          Desfazer
        </Button>
        <Button className="col-span-2" variant="danger" onClick={onRemove} disabled={saving}>
          <Trash2 size={16} aria-hidden />
          Retirar do relatório
        </Button>
      </div>
      <dl className="space-y-2 border-t border-border pt-4 text-sm">
        <div><dt className="font-medium">Autor original</dt><dd className="text-muted">Preservado no relato</dd></div>
        <div><dt className="font-medium">Área original</dt><dd className="text-muted">{card.area}</dd></div>
        <div><dt className="font-medium">Data original</dt><dd className="text-muted">{card.originalDate}</dd></div>
      </dl>
    </aside>
  );
}

