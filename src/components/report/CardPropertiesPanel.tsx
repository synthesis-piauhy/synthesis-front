"use client";

import { RotateCcw, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import type { ActivityReport, ReportCard } from "@/types";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { Select } from "../ui/select";
import { CharacterCounter } from "../activity/CharacterCounter";
import { EDITORIAL_LIMITS } from "../activity/activityTemplates";

type EditableFields = Pick<ReportCard, "editorialTitle" | "editorialSummary" | "editorialResult" | "editorialEvidence" | "editorialNextStep" | "decisionRequest" | "nextStepOwner" | "nextStepDueDate">;

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
  const [source, setSource] = useState(card);
  const [edits, setDraft] = useState<Partial<EditableFields>>({});
  if (source !== card) {
    setSource(card);
    setDraft({});
  }
  const draft: EditableFields = {
    editorialTitle: card?.editorialTitle ?? "",
    editorialSummary: card?.editorialSummary ?? "",
    editorialResult: card?.editorialResult ?? "",
    editorialEvidence: card?.editorialEvidence ?? "",
    editorialNextStep: card?.editorialNextStep ?? "",
    decisionRequest: card?.decisionRequest ?? "",
    nextStepOwner: card?.nextStepOwner ?? "",
    nextStepDueDate: card?.nextStepDueDate ?? null,
    ...edits,
  };

  if (!card || !activity) {
    return <aside className="rounded-app border border-border bg-white p-4 text-sm text-muted">Selecione um card para editar.</aside>;
  }

  function commit(field: keyof EditableFields) {
    const rawValue = draft[field];
    const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;
    if ((!value && ["editorialTitle", "editorialSummary", "editorialResult"].includes(field)) || value === card?.[field]) return;
    onSave({ [field]: value } as Partial<ReportCard>);
  }

  return (
    <aside className="space-y-4 rounded-app border border-border bg-white p-4 shadow-subtle">
      <p className="rounded-app border border-border bg-page p-3 text-sm text-muted">
        As alterações afetam somente o relatório. O relato original enviado pelo gestor será preservado.
      </p>
      <label className="block text-sm font-medium">
        Classificação executiva
        <Select className="mt-1" value={card.executiveClassification} disabled={saving} onChange={(event) => onSave({ executiveClassification: event.target.value as ReportCard["executiveClassification"] })}>
          <option value="informativo">Informativo</option>
          <option value="destaque">Destaque</option>
          <option value="atencao">Ponto de atenção</option>
        </Select>
        <span className="mt-1 block text-xs text-muted">Use no máximo três destaques e três pontos de atenção.</span>
      </label>
      <label className="block text-sm font-medium">
        Título editorial
        <Input
          className="mt-1"
          value={draft.editorialTitle}
          onChange={(event) => setDraft((current) => ({ ...current, editorialTitle: event.target.value }))}
          onBlur={() => commit("editorialTitle")}
        />
        <CharacterCounter value={draft.editorialTitle} limit={EDITORIAL_LIMITS.editorialTitle} />
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
        <CharacterCounter value={draft.editorialSummary} limit={EDITORIAL_LIMITS.editorialSummary} />
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
        <CharacterCounter value={draft.editorialResult} limit={EDITORIAL_LIMITS.editorialResult} />
        {!draft.editorialResult.trim() ? <span className="text-xs text-danger">O resultado não pode ficar vazio.</span> : null}
      </label>
      <label className="block text-sm font-medium">
        Evidência <span className="font-normal text-muted">(opcional)</span>
        <Input
          className="mt-1"
          value={draft.editorialEvidence}
          onChange={(event) => setDraft((current) => ({ ...current, editorialEvidence: event.target.value }))}
          onBlur={() => commit("editorialEvidence")}
        />
        <CharacterCounter value={draft.editorialEvidence} limit={EDITORIAL_LIMITS.editorialEvidence} />
      </label>
      {card.executiveClassification === "destaque" && !draft.editorialEvidence.trim() ? <p className="rounded-md bg-warning/10 p-2 text-xs text-text">Um destaque precisa de evidência antes da geração do PDF.</p> : null}
      <label className="block text-sm font-medium">
        Próximo passo <span className="font-normal text-muted">(opcional)</span>
        <Input
          className="mt-1"
          value={draft.editorialNextStep}
          onChange={(event) => setDraft((current) => ({ ...current, editorialNextStep: event.target.value }))}
          onBlur={() => commit("editorialNextStep")}
        />
        <CharacterCounter value={draft.editorialNextStep} limit={EDITORIAL_LIMITS.editorialNextStep} />
      </label>
      {draft.editorialNextStep.trim() ? (
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-medium">
            Responsável
            <Input
              className="mt-1"
              value={draft.nextStepOwner}
              onChange={(event) => setDraft((current) => ({ ...current, nextStepOwner: event.target.value }))}
              onBlur={() => commit("nextStepOwner")}
            />
            <CharacterCounter value={draft.nextStepOwner} limit={EDITORIAL_LIMITS.nextStepOwner} />
          </label>
          <label className="block text-sm font-medium">
            Prazo
            <Input
              type="date"
              className="mt-1"
              value={draft.nextStepDueDate ?? ""}
              onChange={(event) => {
                const value = event.target.value || null;
                setDraft((current) => ({ ...current, nextStepDueDate: value }));
                onSave({ nextStepDueDate: value });
              }}
            />
          </label>
        </div>
      ) : null}
      <div className="rounded-app border border-border p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={card.needsDecision} disabled={saving} onChange={(event) => onSave({ needsDecision: event.target.checked })} />
          Requer decisão da liderança
        </label>
        {card.needsDecision ? (
          <label className="mt-3 block text-sm font-medium">
            O que precisa ser decidido?
            <Textarea
              className="mt-1 min-h-20"
              value={draft.decisionRequest}
              onChange={(event) => setDraft((current) => ({ ...current, decisionRequest: event.target.value }))}
              onBlur={() => commit("decisionRequest")}
            />
            <CharacterCounter value={draft.decisionRequest} limit={EDITORIAL_LIMITS.decisionRequest} />
          </label>
        ) : null}
      </div>
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
