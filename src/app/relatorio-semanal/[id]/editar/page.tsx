"use client";

import { useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileCheck2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ReportCanvas } from "@/components/report/ReportCanvas";
import { CardPropertiesPanel } from "@/components/report/CardPropertiesPanel";
import { SaveStatus } from "@/components/report/SaveStatus";
import { api } from "@/services/api";
import { downloadReportPdf, viewReportPdf } from "@/lib/pdf";
import type { ReportCard, WeeklyReport } from "@/types";
import { useAuth } from "@/app/providers";

function replaceCard(report: WeeklyReport, cardId: string, changes: Partial<ReportCard>) {
  return {
    ...report,
    sections: report.sections.map((section) => ({
      ...section,
      cards: section.cards.map((card) => card.id === cardId ? { ...card, ...changes } : card),
    })),
  };
}

export default function ReportEditorPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [localReport, setLocalReport] = useState<WeeklyReport>();
  const [lastCard, setLastCard] = useState<ReportCard>();
  const [removeOpen, setRemoveOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [operationError, setOperationError] = useState("");
  const reportQuery = useQuery({
    queryKey: ["weeklyReport", params.id],
    queryFn: () => api.getWeeklyReport(params.id),
    enabled: role === "gerente",
  });
  const report = localReport ?? reportQuery.data;
  const activities = useQuery({
    queryKey: ["activityReports", report?.cycleId],
    queryFn: () => api.listActivityReports({ cycleId: report?.cycleId }),
    enabled: role === "gerente" && Boolean(report?.cycleId),
  });
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const updateCard = useMutation({
    mutationFn: ({ cardId, changes }: { cardId: string; changes: Partial<ReportCard> }) =>
      api.updateReportCard(params.id, cardId, changes),
  });
  const reorderCards = useMutation({
    mutationFn: ({ sectionId, cardIds }: { sectionId: string; cardIds: string[] }) =>
      api.reorderReportCards(params.id, sectionId, cardIds),
  });
  const removeCard = useMutation({ mutationFn: (cardId: string) => api.removeReportCard(params.id, cardId) });
  const generate = useMutation({
    mutationFn: () => api.generatePdf(params.id),
    onSuccess: async (version) => {
      setLocalReport((current) => {
        const base = current ?? reportQuery.data;
        if (!base) return current;
        return { ...base, status: "pdf_gerado", versions: [...base.versions, version] };
      });
      await queryClient.invalidateQueries({ queryKey: ["weeklyReports"] });
      setPreviewOpen(true);
    },
  });

  const selectedCard = useMemo(
    () => report?.sections.flatMap((section) => section.cards).find((card) => card.id === selectedCardId),
    [report, selectedCardId],
  );
  const selectedActivity = activities.data?.find((activity) => activity.id === selectedCard?.activityReportId);
  const cycleLabel = cycles.data?.find((cycle) => cycle.id === report?.cycleId)?.label ?? "Semana selecionada";
  const activeCards = report?.sections.flatMap((section) => section.cards).filter((card) => !card.removed) ?? [];
  const invalidEditorialFields = activeCards.some((card) =>
    !card.editorialTitle.trim() || !card.editorialSummary.trim() || !card.editorialResult.trim(),
  );
  const canGenerate = activeCards.length > 0 && !invalidEditorialFields;
  const saving = updateCard.isPending || reorderCards.isPending || removeCard.isPending;
  const latestVersion = generate.data ?? report?.versions.at(-1);

  async function saveCard(cardId: string, changes: Partial<ReportCard>, remember = true) {
    if (!report) return;
    const previous = report;
    const current = activeCards.find((card) => card.id === cardId);
    if (remember && current) setLastCard(current);
    setOperationError("");
    setLocalReport(replaceCard(report, cardId, changes));
    try {
      const saved = await updateCard.mutateAsync({ cardId, changes });
      setLocalReport((value) => value ? replaceCard(value, cardId, saved) : value);
    } catch (error) {
      setLocalReport(previous);
      setOperationError(error instanceof Error ? error.message : "Não foi possível salvar o card.");
    }
  }

  async function reorder(sectionId: string, activeId: string, overId: string) {
    if (!report) return;
    const previous = report;
    const next = {
      ...report,
      sections: report.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const oldIndex = section.cards.findIndex((card) => card.id === activeId);
        const newIndex = section.cards.findIndex((card) => card.id === overId);
        if (oldIndex < 0 || newIndex < 0) return section;
        return { ...section, cards: arrayMove(section.cards, oldIndex, newIndex).map((card, order) => ({ ...card, order })) };
      }),
    };
    const section = next.sections.find((item) => item.id === sectionId);
    if (!section) return;
    setOperationError("");
    setLocalReport(next);
    try {
      setLocalReport(await reorderCards.mutateAsync({ sectionId, cardIds: section.cards.map((card) => card.id) }));
    } catch (error) {
      setLocalReport(previous);
      setOperationError(error instanceof Error ? error.message : "Não foi possível reordenar os cards.");
    }
  }

  async function removeSelectedCard() {
    if (!report || !selectedCard) return;
    const previous = report;
    setOperationError("");
    setLocalReport(replaceCard(report, selectedCard.id, { removed: true }));
    try {
      setLocalReport(await removeCard.mutateAsync(selectedCard.id));
      setSelectedCardId(undefined);
    } catch (error) {
      setLocalReport(previous);
      setOperationError(error instanceof Error ? error.message : "Não foi possível retirar o card.");
    } finally {
      setRemoveOpen(false);
    }
  }

  return (
    <AppShell>
      <RoleGuard allowed={["gerente"]} fallback={<EmptyState title="Acesso restrito" description="A edição do mosaico é exclusiva da gerente." />}>
        <PageHeader
          title="Editor do mosaico"
          description="Organize o relatório visual sem alterar os relatos originais."
          actions={
            <>
              <SaveStatus saving={saving} error={Boolean(operationError)} />
              <Button variant="outline" onClick={() => setPreviewOpen(true)}><Eye size={16} />Pré-visualização</Button>
              <Button onClick={() => generate.mutate()} disabled={!canGenerate || generate.isPending || saving}>
                <FileCheck2 size={16} />{generate.isPending ? "Gerando PDF..." : "Gerar nova versão"}
              </Button>
            </>
          }
        />
        {operationError ? <p role="alert" className="mb-4 rounded-app border border-danger bg-white p-3 text-sm text-danger">{operationError}</p> : null}
        {!canGenerate && report ? (
          <p className="mb-4 rounded-app border border-warning bg-white p-3 text-sm text-text">
            {activeCards.length === 0 ? "Mantenha ao menos um card ativo para gerar o PDF." : "Preencha todos os campos editoriais antes de gerar o PDF."}
          </p>
        ) : null}
        {reportQuery.isLoading ? <div className="rounded-app border border-border bg-white p-6">Carregando editor.</div> : null}
        {reportQuery.isError ? <ErrorState onRetry={() => void reportQuery.refetch()} /> : null}
        {!reportQuery.isLoading && !report ? <EmptyState description="Relatório não encontrado." /> : null}
        {report ? (
          <div className="grid gap-4 xl:grid-cols-[240px_minmax(620px,1fr)_340px]">
            <aside className="rounded-app border border-border bg-white p-4 shadow-subtle">
              <h2 className="text-lg font-semibold">Áreas do relatório</h2>
              <div className="mt-3 space-y-2">
                {report.sections.map((section) => (
                  <div key={section.id} className="w-full rounded-app border border-border px-3 py-2 text-left text-sm">
                    {section.area}
                    <span className="block text-muted">{section.cards.filter((card) => !card.removed).length} cards ativos</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted">Arraste os cards dentro da própria área. A ordenação salva deve conter todos os cards da seção, inclusive os retirados.</p>
            </aside>
            <ReportCanvas report={report} cycleLabel={cycleLabel} activities={activities.data ?? []} selectedCardId={selectedCardId} onSelectCard={setSelectedCardId} onReorder={(sectionId, activeId, overId) => void reorder(sectionId, activeId, overId)} />
            <CardPropertiesPanel
              card={selectedCard}
              activity={selectedActivity}
              saving={saving}
              error={updateCard.isError ? updateCard.error.message : undefined}
              onSave={(changes) => selectedCard && void saveCard(selectedCard.id, changes)}
              onRestore={() => selectedCard && selectedActivity && void saveCard(selectedCard.id, {
                editorialTitle: selectedActivity.title,
                editorialSummary: selectedActivity.summary,
                editorialResult: selectedActivity.result,
              })}
              onRemove={() => setRemoveOpen(true)}
              onUndo={() => lastCard && void saveCard(lastCard.id, {
                editorialTitle: lastCard.editorialTitle,
                editorialSummary: lastCard.editorialSummary,
                editorialResult: lastCard.editorialResult,
                selectedPhotoId: lastCard.selectedPhotoId,
              }, false)}
            />
          </div>
        ) : null}
        <ConfirmDialog
          open={removeOpen}
          title="Retirar card do relatório"
          description="O card será retirado apenas do relatório editorial. O relato original e os PDFs já gerados permanecerão intactos."
          onCancel={() => setRemoveOpen(false)}
          onConfirm={() => void removeSelectedCard()}
        />
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen} title="Prévia e versões do PDF">
          <div className="space-y-4 text-sm text-muted">
            <p>{canGenerate ? "O relatório está pronto para gerar uma nova versão imutável." : "Corrija as pendências do relatório antes de gerar uma nova versão."}</p>
            {generate.isError ? <p role="alert" className="rounded-app border border-danger p-3 text-danger">{generate.error.message}</p> : null}
            {latestVersion ? <div className="rounded-app border border-success p-3 text-success">Versão {latestVersion.version} disponível.</div> : <p>Nenhuma versão de PDF foi gerada.</p>}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={!latestVersion} onClick={() => latestVersion && void viewReportPdf(latestVersion.id)}><Eye size={16} />Visualizar PDF</Button>
              <Button variant="outline" disabled={!latestVersion} onClick={() => latestVersion && void downloadReportPdf(latestVersion.id, `synthesis-relatorio-v${latestVersion.version}.pdf`)}><Download size={16} />Baixar PDF</Button>
              <Button onClick={() => setPreviewOpen(false)}>Voltar ao editor</Button>
            </div>
          </div>
        </Dialog>
      </RoleGuard>
    </AppShell>
  );
}

