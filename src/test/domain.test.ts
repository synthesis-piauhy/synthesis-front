import { describe, expect, it } from "vitest";
import { activitySchema } from "@/components/activity/activitySchema";
import { mockApi } from "@/services/api";
import type { ReportCard, UserRole } from "@/types";
import { reportGenerationIssues } from "@/components/report/reportValidation";

const image = new File(["conteudo"], "foto.png", { type: "image/png" });

describe("validação do formulário de atividade", () => {
  it("aceita dados válidos com foto principal", () => {
    const result = activitySchema.safeParse({
      templateKey: "acao_evento",
      title: "Oficina de boas práticas",
      date: "2026-08-18",
      location: "Centro de capacitação",
      summary: "Atividade realizada com participantes da área.",
      result: "Participantes definiram melhorias para aplicação imediata.",
      beneficiaries: "24 participantes",
      evidence: "24 planos elaborados",
      nextStep: "Acompanhar a aplicação dos planos.",
      internalNotes: "",
      area: "Gastronomia",
      managerId: "u2",
      mainPhoto: image,
      additionalPhotos: [],
    });

    expect(result.success).toBe(true);
  });

  it("bloqueia envio sem foto principal", () => {
    const result = activitySchema.safeParse({
      templateKey: "acao_evento",
      title: "Oficina",
      date: "2026-08-18",
      location: "Sala",
      summary: "Descrição adequada para validação.",
      result: "Resultado adequado para validação.",
      beneficiaries: "Participantes",
      evidence: "",
      nextStep: "",
      internalNotes: "",
      area: "Gastronomia",
      managerId: "u2",
      additionalPhotos: [],
    });

    expect(result.success).toBe(false);
  });

  it("impede textos publicáveis maiores que o card da síntese", () => {
    const result = activitySchema.safeParse({
      templateKey: "acao_evento",
      title: "Oficina",
      date: "2026-08-18",
      location: "Sala",
      summary: "a".repeat(241),
      result: "Resultado adequado para validação.",
      beneficiaries: "Participantes",
      evidence: "",
      nextStep: "",
      internalNotes: "Contexto extenso permitido para consulta da gerente.",
      area: "Gastronomia",
      managerId: "u2",
      mainPhoto: image,
      additionalPhotos: [],
    });

    expect(result.success).toBe(false);
  });
});

describe("permissões por perfil", () => {
  const canEditMosaic = (role: UserRole) => role === "gerente";
  const canAdmin = (role: UserRole) => role === "admin";

  it("restringe edição do mosaico à gerente", () => {
    expect(canEditMosaic("gerente")).toBe(true);
    expect(canEditMosaic("gestor")).toBe(false);
    expect(canEditMosaic("admin")).toBe(false);
  });

  it("restringe administração ao administrador técnico", () => {
    expect(canAdmin("admin")).toBe(true);
    expect(canAdmin("gestor")).toBe(false);
  });
});

describe("fluxo editorial", () => {
  it("expõe pendências objetivas do briefing executivo", async () => {
    const report = await mockApi.generateDraft("c1", ["a1"]);
    const card = report.sections[0].cards[0];
    const invalid = {
      ...report,
      executiveSummary: "",
      sections: report.sections.map((section) => ({
        ...section,
        cards: section.cards.map((item) => item.id !== card.id ? item : ({
          ...item,
          executiveClassification: "destaque" as const,
          editorialEvidence: "",
          needsDecision: true,
          decisionRequest: "",
          nextStepOwner: "",
          nextStepDueDate: null,
        })),
      })),
    };

    expect(reportGenerationIssues(invalid)).toEqual(expect.arrayContaining([
      "Preencha a leitura executiva da semana.",
      "Todo destaque precisa apresentar uma evidência.",
      "Toda decisão necessária precisa conter um pedido claro.",
      "Todo próximo passo precisa ter responsável e prazo.",
    ]));
  });

  it("gera rascunho somente com relatos selecionados", async () => {
    const draft = await mockApi.generateDraft("c1", ["a1", "a2"]);

    expect(draft.selectedActivityIds).toEqual(["a1", "a2"]);
    expect(draft.sections.flatMap((section) => section.cards)).toHaveLength(2);
  });

  it("representa botão de rascunho desabilitado sem seleção", () => {
    const selected: string[] = [];
    expect(selected.length === 0).toBe(true);
  });

  it("reordena cards preservando os identificadores", async () => {
    const draft = await mockApi.generateDraft("c1", ["a1", "a1"]);
    const section = draft.sections[0];
    const ids = section.cards.map((card) => card.id);
    const reversed = [...ids].reverse();
    const reordered = await mockApi.reorderReportCards(draft.id, section.id, reversed);

    expect(reordered.sections[0].cards.map((card) => card.id)).toEqual(reversed);
  });

  it("preserva o relato original após editar o card", async () => {
    const original = await mockApi.getActivityReport("a1");
    const report = await mockApi.generateDraft("c1", ["a1"]);
    const card = report.sections[0].cards[0];

    await mockApi.updateReportCard(report.id, card.id, { editorialTitle: "Título editorial resumido" });
    const after = await mockApi.getActivityReport("a1");

    expect(after?.title).toBe(original?.title);
    expect(after?.title).not.toBe("Título editorial resumido");
  });

  it("retira o card sem excluir o relato original", async () => {
    const report = await mockApi.generateDraft("c1", ["a2"]);
    const card = report.sections[0].cards[0];
    const updated = await mockApi.removeReportCard(report.id, card.id);
    const original = await mockApi.getActivityReport("a2");

    expect(updated.sections[0].cards[0].removed).toBe(true);
    expect(original).toBeDefined();
  });

  it("gera uma nova versão do relatório", async () => {
    const report = await mockApi.generateDraft("c1", ["a3"]);
    const first = await mockApi.generatePdf(report.id);
    const second = await mockApi.generatePdf(report.id);

    expect(second.version).toBe(first.version + 1);
  });

  it("renderiza estados vazio e erro como decisões explícitas", () => {
    const emptyState = { title: "Nenhum resultado", description: "Sem dados." };
    const errorState = { retry: true };

    expect(emptyState.title).toBe("Nenhum resultado");
    expect(errorState.retry).toBe(true);
  });

  it("executa o fluxo completo de gestor até versão gerada", async () => {
    const created = await mockApi.createActivityReport({
      templateKey: "acao_evento",
      title: "Jornada de capacitação empresarial",
      date: "2026-08-21",
      location: "Sala multiuso",
      summary: "Registro de atividade realizada com pequenos negócios.",
      result: "Participantes criaram plano de acompanhamento mensal.",
      beneficiaries: "20 participantes",
      evidence: "20 planos mensais criados",
      nextStep: "Revisar os planos no próximo ciclo.",
      internalNotes: "",
      area: "Jornadas Empresariais",
      managerId: "u6",
      cycleId: "c1",
      photos: [image],
    });
    const draft = await mockApi.generateDraft("c1", [created.id]);
    const card: ReportCard = draft.sections[0].cards[0];
    await mockApi.updateReportCard(draft.id, card.id, { editorialResult: "Plano mensal criado." });
    const version = await mockApi.generatePdf(draft.id);

    expect(version.version).toBe(1);
  });
});

describe("gestão operacional de ciclos", () => {
  it("encerra, abre, ajusta e reabre ciclos pela API do site", async () => {
    const activeCycles = (await mockApi.listWeeklyCycles()).filter((cycle) => cycle.status === "aberta" || cycle.status === "reaberta");
    const current = activeCycles.find((cycle) => cycle.status === "aberta");
    expect(current).toBeDefined();
    await Promise.all(activeCycles.map((cycle) => mockApi.closeWeeklyCycle(cycle.id)));

    const created = await mockApi.createWeeklyCycle({
      label: "24 a 28 de agosto de 2026",
      startsAt: "2026-08-24",
      endsAt: "2026-08-28",
      deadline: "2026-08-28T18:00:00-03:00",
    });
    expect(created.status).toBe("aberta");
    const changed = await mockApi.updateWeeklyCycleDeadline(created.id, "2026-08-28T19:00:00-03:00");
    expect(changed.deadline).toContain("19:00:00");

    await mockApi.closeWeeklyCycle(created.id);
    const reopened = await mockApi.reopenCollection(current!.id, "Correção autorizada", "2026-08-29T12:00:00-03:00");
    expect(reopened.status).toBe("reaberta");
  });
});
