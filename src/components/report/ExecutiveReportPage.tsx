import type { ReportCard, WeeklyReport } from "@/types";
import { formatDate } from "@/lib/utils";

function ExecutiveItem({ card, kind }: { card: ReportCard; kind: "highlight" | "attention" | "priority" }) {
  if (kind === "priority") {
    return (
      <li className="rounded-md border border-border bg-white p-2.5">
        <p className="text-xs font-semibold text-text">{card.editorialNextStep}</p>
        <p className="mt-1 text-[11px] text-muted">
          {card.nextStepOwner || "Responsável pendente"} · {card.nextStepDueDate ? formatDate(card.nextStepDueDate) : "Prazo pendente"}
        </p>
      </li>
    );
  }
  return (
    <li className="rounded-md border border-border bg-white p-2.5">
      <p className="text-xs font-semibold text-primary">{card.editorialTitle}</p>
      <p className="mt-1 text-[11px] leading-4 text-text">{card.editorialResult}</p>
      {kind === "highlight" ? <p className="mt-1 text-[11px] font-medium text-success">Evidência: {card.editorialEvidence || "pendente"}</p> : null}
      {kind === "attention" && card.needsDecision ? <p className="mt-1 text-[11px] font-medium text-danger">Decisão: {card.decisionRequest || "pedido pendente"}</p> : null}
    </li>
  );
}

export function ExecutiveReportPage({ report, cycleLabel }: { report: WeeklyReport; cycleLabel: string }) {
  const activeCards = report.sections.flatMap((section) => section.cards).filter((card) => !card.removed);
  const highlights = activeCards.filter((card) => card.executiveClassification === "destaque").slice(0, 3);
  const attention = activeCards.filter((card) => card.executiveClassification === "atencao").slice(0, 3);
  const priorities = activeCards.filter((card) => card.editorialNextStep.trim()).slice(0, 3);
  const evidenceCount = activeCards.filter((card) => card.editorialEvidence.trim()).length;
  const areasCount = report.sections.filter((section) => section.cards.some((card) => !card.removed)).length;

  return (
    <div className="a4-page w-[560px] shrink-0 overflow-hidden rounded-app border border-border bg-white p-8 shadow-subtle">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div><p className="text-xl font-semibold text-primary">synthesis</p><p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Briefing executivo</p></div>
        <div className="text-right text-sm text-muted">{cycleLabel}</div>
      </header>

      <section className="mt-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.13em] text-secondary">Leitura da semana</h2>
        <p className={`mt-2 text-sm leading-6 ${report.executiveSummary.trim() ? "text-text" : "text-danger"}`}>
          {report.executiveSummary.trim() || "Preencha a leitura executiva antes de gerar o PDF."}
        </p>
      </section>

      <dl className="mt-5 grid grid-cols-3 overflow-hidden rounded-app border border-border bg-page text-center">
        <div className="p-3"><dt className="text-xl font-semibold text-primary">{activeCards.length}</dt><dd className="text-[11px] text-muted">iniciativas</dd></div>
        <div className="border-x border-border p-3"><dt className="text-xl font-semibold text-primary">{areasCount}</dt><dd className="text-[11px] text-muted">áreas mobilizadas</dd></div>
        <div className="p-3"><dt className="text-xl font-semibold text-primary">{evidenceCount}</dt><dd className="text-[11px] text-muted">com evidência</dd></div>
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.13em] text-secondary">Destaques</h2>
          <ul className="mt-2 space-y-2">
            {highlights.length ? highlights.map((card) => <ExecutiveItem key={card.id} card={card} kind="highlight" />) : <li className="text-xs text-muted">Nenhum destaque selecionado.</li>}
          </ul>
        </section>
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.13em] text-secondary">Pontos de atenção</h2>
          <ul className="mt-2 space-y-2">
            {attention.length ? attention.map((card) => <ExecutiveItem key={card.id} card={card} kind="attention" />) : <li className="text-xs text-muted">Nenhum ponto de atenção selecionado.</li>}
          </ul>
        </section>
      </div>

      <section className="mt-5 border-t border-border pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.13em] text-secondary">Prioridades da próxima semana</h2>
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {priorities.length ? priorities.map((card) => <ExecutiveItem key={card.id} card={card} kind="priority" />) : <li className="col-span-3 text-xs text-muted">Nenhuma prioridade registrada.</li>}
        </ul>
      </section>
      <footer className="mt-5 border-t border-border pt-3 text-right text-xs text-muted">Página 1</footer>
    </div>
  );
}
