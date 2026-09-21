import { ACTIVITY_LIMITS, type ActivityTemplateKey } from "./activityTemplates";

export type GuidedAnswers = Record<string, string>;
export type GuidedQuestion = {
  key: string;
  label: string;
  placeholder?: string;
  options?: string[];
  type?: "number";
  required?: boolean;
  hint?: string;
};

export const GUIDED_QUESTIONS: Record<ActivityTemplateKey, GuidedQuestion[]> = {
  acao_evento: [
    { key: "kind", label: "Que tipo de ação foi realizada?", options: ["Oficina", "Capacitação", "Reunião", "Evento", "Outra ação"], required: true },
    { key: "subject", label: "Qual foi o tema ou nome da ação?", placeholder: "Ex.: precificação para pequenos negócios", required: true },
    { key: "audience", label: "Quem participou ou foi beneficiado?", placeholder: "Ex.: empreendedores locais", required: true },
    { key: "quantity", label: "Quantas pessoas participaram?", type: "number", placeholder: "Ex.: 24", hint: "Deixe em branco se não houver contagem." },
    { key: "outcome", label: "O que os participantes conseguiram fazer ou receber?", placeholder: "Ex.: montar uma tabela de preços", required: true },
  ],
  entrega_marco: [
    { key: "kind", label: "Que tipo de entrega foi concluída?", options: ["Produto", "Implantação", "Etapa de projeto", "Documento", "Outra entrega"], required: true },
    { key: "subject", label: "O que foi entregue?", placeholder: "Ex.: novo fluxo de atendimento", required: true },
    { key: "scope", label: "Onde ou para quem foi feita a entrega?", placeholder: "Ex.: seis unidades regionais", required: true },
    { key: "audience", label: "Quem se beneficia da entrega?", placeholder: "Ex.: equipes de atendimento", required: true },
    { key: "outcome", label: "Qual mudança concreta já ocorreu?", placeholder: "Ex.: triagem passou de 20 para 12 minutos", required: true },
  ],
  atendimento_articulacao: [
    { key: "kind", label: "Que tipo de atendimento foi feito?", options: ["Consultoria", "Visita técnica", "Orientação", "Reunião de articulação", "Encaminhamento"], required: true },
    { key: "subject", label: "Qual demanda foi tratada?", placeholder: "Ex.: reduzir perdas na produção", required: true },
    { key: "audience", label: "Quem foi atendido?", placeholder: "Ex.: empresa e sua equipe de produção", required: true },
    { key: "quantity", label: "Quantas pessoas ou organizações foram atendidas?", type: "number", placeholder: "Ex.: 12", hint: "Deixe em branco se não houver contagem." },
    { key: "outcome", label: "Qual encaminhamento ou resultado concreto houve?", placeholder: "Ex.: controle diário de perdas implantado", required: true },
  ],
};

const clean = (value?: string) => (value ?? "").trim().replace(/\s+/g, " ");
const sentence = (value: string) => value ? `${value.charAt(0).toUpperCase()}${value.slice(1).replace(/[.!?]+$/, "")}.` : "";
const limit = (value: string, max: number) => value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;

export function generateActivityText(key: ActivityTemplateKey, answers: GuidedAnswers) {
  const kind = clean(answers.kind);
  const subject = clean(answers.subject);
  const audience = clean(answers.audience);
  const scope = clean(answers.scope);
  const quantity = clean(answers.quantity);
  const outcome = clean(answers.outcome);
  const title = `${kind}: ${subject}`;
  const summary = key === "acao_evento"
    ? sentence(`${kind} sobre ${subject} realizada para ${audience}${quantity ? `, com ${quantity} participantes` : ""}`)
    : key === "entrega_marco"
      ? sentence(`Foi concluída a entrega de ${subject} em ${scope}, beneficiando ${audience}`)
      : sentence(`${kind} para ${audience} sobre ${subject}${quantity ? `, com ${quantity} atendidos` : ""}`);
  return {
    title: limit(title, ACTIVITY_LIMITS.title),
    summary: limit(summary, ACTIVITY_LIMITS.summary),
    result: limit(sentence(outcome), ACTIVITY_LIMITS.result),
    beneficiaries: limit(audience, ACTIVITY_LIMITS.beneficiaries),
  };
}

export function guidedAnswersComplete(key: ActivityTemplateKey, answers: GuidedAnswers) {
  return GUIDED_QUESTIONS[key].filter((question) => question.required).every((question) =>
    clean(answers[question.key]).length >= (question.key === "outcome" ? 8 : question.key === "subject" ? 3 : question.key === "audience" || question.key === "scope" ? 2 : 1),
  );
}
