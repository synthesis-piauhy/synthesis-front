import { describe, expect, it } from "vitest";
import { generateActivityText, guidedAnswersComplete, type GuidedAnswers } from "@/components/activity/guidedActivity";
import type { ActivityTemplateKey } from "@/components/activity/activityTemplates";

const examples: { key: ActivityTemplateKey; answers: GuidedAnswers; expected: string }[] = [
  {
    key: "acao_evento" as const,
    answers: { kind: "Oficina", subject: "precificação", audience: "empreendedores locais", quantity: "24", outcome: "montaram uma tabela de preços" },
    expected: "24 participantes",
  },
  {
    key: "entrega_marco" as const,
    answers: { kind: "Implantação", subject: "novo fluxo de atendimento", scope: "seis unidades", audience: "equipes locais", outcome: "triagem passou de 20 para 12 minutos" },
    expected: "seis unidades",
  },
  {
    key: "atendimento_articulacao" as const,
    answers: { kind: "Consultoria", subject: "redução de perdas", audience: "equipe de produção", quantity: "12", outcome: "controle diário de perdas implantado" },
    expected: "12 atendidos",
  },
];

describe("relatos guiados", () => {
  it.each(examples)("gera texto publicável para $key", ({ key, answers, expected }) => {
    expect(guidedAnswersComplete(key, answers)).toBe(true);
    const text = generateActivityText(key, answers);
    expect(text.summary).toContain(expected);
    expect(text.result.toLowerCase()).toContain(answers.outcome);
    expect(text.title.length).toBeLessThanOrEqual(80);
    expect(text.summary.length).toBeLessThanOrEqual(240);
    expect(text.result.length).toBeLessThanOrEqual(180);
  });

  it("não aceita respostas essenciais incompletas", () => {
    expect(guidedAnswersComplete("acao_evento", { kind: "Oficina", subject: "tema", audience: "público", outcome: "curto" })).toBe(false);
  });
});
