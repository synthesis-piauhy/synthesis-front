export const ACTIVITY_LIMITS = {
  title: 80,
  summary: 240,
  result: 180,
  beneficiaries: 80,
  evidence: 100,
  nextStep: 140,
  internalNotes: 2000,
} as const;

export const EDITORIAL_LIMITS = {
  editorialTitle: ACTIVITY_LIMITS.title,
  editorialSummary: ACTIVITY_LIMITS.summary,
  editorialResult: ACTIVITY_LIMITS.result,
  editorialEvidence: ACTIVITY_LIMITS.evidence,
  editorialNextStep: ACTIVITY_LIMITS.nextStep,
  decisionRequest: 180,
  nextStepOwner: 120,
} as const;

export const EXECUTIVE_LIMITS = {
  executiveSummary: 400,
  sectionExecutiveSummary: 180,
} as const;

export const ACTIVITY_TEMPLATES = [
  {
    key: "acao_evento",
    label: "Ação ou evento realizado",
    description: "Para oficinas, capacitações, reuniões e eventos.",
    summaryLabel: "O que foi realizado?",
    summaryHelp: "Descreva a ação principal em até duas frases.",
    summaryPlaceholder: "Ex.: Foi realizada uma oficina prática de precificação com empreendedores locais.",
    resultLabel: "Qual foi o resultado concreto?",
    resultPlaceholder: "Ex.: 24 participantes concluíram a atividade com uma nova tabela de preços.",
    evidenceLabel: "Evidência do resultado",
    evidencePlaceholder: "Ex.: 24 tabelas de preço concluídas",
    nextStepLabel: "Próximo passo",
    nextStepPlaceholder: "Ex.: Acompanhar a aplicação das tabelas em outubro.",
  },
  {
    key: "entrega_marco",
    label: "Entrega ou marco concluído",
    description: "Para produtos, implantações e etapas de projeto.",
    summaryLabel: "Qual entrega foi concluída?",
    summaryHelp: "Explique a entrega e o problema que ela resolve.",
    summaryPlaceholder: "Ex.: Foi implantado o novo fluxo de atendimento nas seis unidades.",
    resultLabel: "Que impacto já foi observado?",
    resultPlaceholder: "Ex.: O tempo médio de triagem caiu de 20 para 12 minutos.",
    evidenceLabel: "Indicador ou evidência",
    evidencePlaceholder: "Ex.: Redução de 40% no tempo de triagem",
    nextStepLabel: "Dependência ou próximo passo",
    nextStepPlaceholder: "Ex.: Treinar a última equipe até 30/09.",
  },
  {
    key: "atendimento_articulacao",
    label: "Atendimento ou articulação",
    description: "Para consultorias, visitas e encaminhamentos.",
    summaryLabel: "Qual demanda foi atendida?",
    summaryHelp: "Registre a demanda e o atendimento realizado de forma objetiva.",
    summaryPlaceholder: "Ex.: A empresa recebeu diagnóstico do fluxo produtivo e orientação técnica.",
    resultLabel: "Qual encaminhamento ou resultado foi obtido?",
    resultPlaceholder: "Ex.: A equipe identificou dois gargalos e adotou controle diário de perdas.",
    evidenceLabel: "Alcance do atendimento",
    evidencePlaceholder: "Ex.: 1 empresa e 12 colaboradores atendidos",
    nextStepLabel: "Situação ou acompanhamento",
    nextStepPlaceholder: "Ex.: Retorno técnico agendado para 25/09.",
  },
] as const;

export type ActivityTemplateKey = (typeof ACTIVITY_TEMPLATES)[number]["key"];

export const LEGACY_TEMPLATE = {
  key: "legado",
  label: "Relato legado",
  description: "Registro criado antes da adoção dos modelos guiados.",
  summaryLabel: "O que foi realizado?",
  summaryHelp: "Resuma a informação principal em até duas frases.",
  summaryPlaceholder: "Descreva objetivamente a ação realizada.",
  resultLabel: "Qual foi o resultado concreto?",
  resultPlaceholder: "Informe a principal mudança ou entrega observada.",
  evidenceLabel: "Evidência do resultado",
  evidencePlaceholder: "Informe um número, entrega ou mudança observável.",
  nextStepLabel: "Próximo passo",
  nextStepPlaceholder: "Informe o acompanhamento, se houver.",
} as const;

export function getActivityTemplate(key?: string) {
  return ACTIVITY_TEMPLATES.find((template) => template.key === key) ?? LEGACY_TEMPLATE;
}
