"use client";

import { useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { CropImageDialog } from "@/components/report/CropImageDialog";
import { SaveStatus } from "@/components/report/SaveStatus";
import { api } from "@/services/api";
import type { ReportCard, WeeklyReport } from "@/types";
import { useAuth } from "@/app/providers";

export default function ReportEditorPage() {
  const params = useParams<{ id: string }>();
  const { role } = useAuth();
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [localReport, setLocalReport] = useState<WeeklyReport>();
  const [lastCard, setLastCard] = useState<ReportCard>();
  const [removeOpen, setRemoveOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const reportQuery = useQuery({
    queryKey: ["weeklyReport", params.id],
    queryFn: () => api.getWeeklyReport(params.id),
    enabled: role === "gerente",
  });
  const activities = useQuery({ queryKey: ["activityReports"], queryFn: () => api.listActivityReports() });
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const updateCard = useMutation({ mutationFn: ({ cardId, changes }: { cardId: string; changes: Partial<ReportCard> }) => api.updateReportCard(params.id, cardId, changes) });
  const removeCard = useMutation({ mutationFn: (cardId: string) => api.removeReportCard(params.id, cardId) });
  const generate = useMutation({ mutationFn: () => api.generatePdf(params.id), onSuccess: () => setPreviewOpen(true) });

  const report = localReport ?? reportQuery.data;
  const selectedCard = useMemo(() => report?.sections.flatMap((section) => section.cards).find((card) => card.id === selectedCardId), [report, selectedCardId]);
  const selectedActivity = activities.data?.find((activity) => activity.id === selectedCard?.activityReportId);
  const cycleLabel = cycles.data?.find((cycle) => cycle.id === report?.cycleId)?.label ?? "Semana selecionada";
  const activePhoto = selectedActivity?.photos.find((photo) => photo.id === selectedCard?.selectedPhotoId)?.url;
  const pdfUrl = generate.data?.pdfUrl ?? report?.versions.at(-1)?.pdfUrl;

  function patchCard(cardId: string, changes: Partial<ReportCard>) {
    if (!report) return;
    const current = report.sections.flatMap((section) => section.cards).find((card) => card.id === cardId);
    if (current) setLastCard(current);
    setLocalReport({
      ...report,
      sections: report.sections.map((section) => ({
        ...section,
        cards: section.cards.map((card) => (card.id === cardId ? { ...card, ...changes } : card)),
      })),
    });
    updateCard.mutate({ cardId, changes });
  }

  function reorder(sectionId: string, activeId: string, overId: string) {
    if (!report) return;
    const next = {
      ...report,
      sections: report.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const oldIndex = section.cards.findIndex((card) => card.id === activeId);
        const newIndex = section.cards.findIndex((card) => card.id === overId);
        return { ...section, cards: arrayMove(section.cards, oldIndex, newIndex).map((card, order) => ({ ...card, order })) };
      }),
    };
    setLocalReport(next);
    const section = next.sections.find((item) => item.id === sectionId);
    if (section) void api.reorderReportCards(params.id, sectionId, section.cards.map((card) => card.id));
  }

  return (
    <AppShell>
      <RoleGuard allowed={["gerente"]} fallback={<EmptyState title="Acesso restrito" description="A edição do mosaico é exclusiva da gerente." />}>
        <PageHeader
          title="Editor do mosaico"
          description="Organize o relatório visual sem alterar os relatos originais."
          actions={
            <>
              <SaveStatus saving={updateCard.isPending || removeCard.isPending} />
              <Button variant="outline" onClick={() => setPreviewOpen(true)}><Eye size={16} />Pré-visualização</Button>
              <Button onClick={() => generate.mutate()} disabled={!report?.sections.some((section) => section.cards.some((card) => !card.removed)) || generate.isPending}>
                <FileCheck2 size={16} />Gerar PDF
              </Button>
            </>
          }
        />
        {reportQuery.isLoading ? <div className="rounded-app border border-border bg-white p-6">Carregando editor.</div> : null}
        {reportQuery.isError ? <ErrorState onRetry={() => void reportQuery.refetch()} /> : null}
        {!reportQuery.isLoading && !report ? <EmptyState description="Relatório não encontrado." /> : null}
        {report ? (
          <div className="grid gap-4 xl:grid-cols-[240px_minmax(620px,1fr)_340px]">
            <aside className="rounded-app border border-border bg-white p-4 shadow-subtle">
              <h2 className="text-lg font-semibold">Áreas e páginas</h2>
              <div className="mt-3 space-y-2">
                {report.sections.map((section, index) => (
                  <button key={section.id} className="w-full rounded-app border border-border px-3 py-2 text-left text-sm hover:border-secondary">
                    Página {index + 1} · {section.area}
                    <span className="block text-muted">{section.cards.filter((card) => !card.removed).length} cards</span>
                  </button>
                ))}
              </div>
            </aside>
            <ReportCanvas report={report} cycleLabel={cycleLabel} activities={activities.data ?? []} selectedCardId={selectedCardId} onSelectCard={setSelectedCardId} onReorder={reorder} />
            <CardPropertiesPanel
              card={selectedCard}
              activity={selectedActivity}
              onChange={(changes) => selectedCard && patchCard(selectedCard.id, changes)}
              onRestore={() => selectedCard && selectedActivity && patchCard(selectedCard.id, { editorialTitle: selectedActivity.title, editorialSummary: selectedActivity.summary, editorialResult: selectedActivity.result })}
              onRemove={() => setRemoveOpen(true)}
              onCrop={() => setCropOpen(true)}
              onUndo={() => lastCard && patchCard(lastCard.id, lastCard)}
            />
          </div>
        ) : null}
        <ConfirmDialog
          open={removeOpen}
          title="Retirar card do relatório"
          description="O card será retirado apenas desta versão editorial. O relato original permanecerá arquivado."
          onCancel={() => setRemoveOpen(false)}
          onConfirm={() => {
            if (selectedCard) {
              patchCard(selectedCard.id, { removed: true });
              removeCard.mutate(selectedCard.id);
            }
            setRemoveOpen(false);
          }}
        />
        <CropImageDialog open={cropOpen} image={activePhoto} onClose={() => setCropOpen(false)} />
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen} title="Prévia final e geração">
          <div className="space-y-4 text-sm text-muted">
            <p>Validação concluída: há cards no relatório e as áreas possuem título de seção.</p>
            {generate.isPending ? <p>Gerando PDF.</p> : null}
            {generate.data ? (
              <div className="rounded-app border border-success p-3 text-success">
                Versão {generate.data.version} gerada.
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={!pdfUrl} onClick={() => pdfUrl && window.open(pdfUrl, "_blank", "noopener,noreferrer")}><Eye size={16} />Visualizar PDF</Button>
              <Button variant="outline" disabled={!pdfUrl} onClick={() => {
                if (!pdfUrl) return;
                const link = document.createElement("a");
                link.href = pdfUrl;
                link.download = `synthesis-relatorio-v${generate.data?.version ?? report?.versions.at(-1)?.version ?? 1}.pdf`;
                link.click();
              }}><Download size={16} />Baixar PDF</Button>
              <Button onClick={() => setPreviewOpen(false)}>Voltar ao editor</Button>
            </div>
          </div>
        </Dialog>
      </RoleGuard>
    </AppShell>
  );
}
