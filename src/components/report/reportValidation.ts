import { EDITORIAL_LIMITS } from "@/components/activity/activityTemplates";
import type { WeeklyReport } from "@/types";

export function reportGenerationIssues(report: WeeklyReport): string[] {
  const activeCards = report.sections.flatMap((section) => section.cards).filter((card) => !card.removed);
  const highlights = activeCards.filter((card) => card.executiveClassification === "destaque");
  const attentionPoints = activeCards.filter((card) => card.executiveClassification === "atencao");
  const invalidEditorialFields = activeCards.some((card) =>
    !card.editorialTitle.trim() ||
    !card.editorialSummary.trim() ||
    !card.editorialResult.trim() ||
    card.editorialTitle.length > EDITORIAL_LIMITS.editorialTitle ||
    card.editorialSummary.length > EDITORIAL_LIMITS.editorialSummary ||
    card.editorialResult.length > EDITORIAL_LIMITS.editorialResult ||
    card.editorialEvidence.length > EDITORIAL_LIMITS.editorialEvidence ||
    card.editorialNextStep.length > EDITORIAL_LIMITS.editorialNextStep
  );
  return [
    ...(!report.executiveSummary.trim() ? ["Preencha a leitura executiva da semana."] : []),
    ...(invalidEditorialFields ? ["Revise os campos editoriais obrigatórios e seus limites."] : []),
    ...(highlights.length > 3 ? ["Mantenha no máximo três destaques."] : []),
    ...(attentionPoints.length > 3 ? ["Mantenha no máximo três pontos de atenção."] : []),
    ...(highlights.some((card) => !card.editorialEvidence.trim()) ? ["Todo destaque precisa apresentar uma evidência."] : []),
    ...(activeCards.some((card) => card.needsDecision && !card.decisionRequest.trim()) ? ["Toda decisão necessária precisa conter um pedido claro."] : []),
    ...(activeCards.some((card) => card.editorialNextStep.trim() && (!card.nextStepOwner.trim() || !card.nextStepDueDate)) ? ["Todo próximo passo precisa ter responsável e prazo."] : []),
  ];
}
