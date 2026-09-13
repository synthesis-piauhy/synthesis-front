import { CalendarDays, MapPin, Users } from "lucide-react";
import { getActivityTemplate } from "./activityTemplates";

export function ActivitySynthesisPreview({
  templateKey,
  title,
  date,
  location,
  summary,
  result,
  beneficiaries,
  evidence,
  nextStep,
}: {
  templateKey?: string;
  title?: string;
  date?: string;
  location?: string;
  summary?: string;
  result?: string;
  beneficiaries?: string;
  evidence?: string;
  nextStep?: string;
}) {
  const template = getActivityTemplate(templateKey);

  return (
    <aside className="rounded-app border border-accent/40 bg-page p-4" aria-label="Prévia do card na síntese">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Prévia da síntese</p>
          <p className="text-xs text-muted">Somente estes campos serão publicados no card.</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-primary">{template.label}</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-app border border-border bg-white shadow-subtle">
        <div className="grid h-28 place-items-center bg-neutral-100 text-xs text-muted">Foto principal</div>
        <div className="space-y-2 p-4">
          <h3 className="font-semibold text-primary">{title?.trim() || "Título objetivo da atividade"}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{date || "Data"}</span>
            <span className="inline-flex items-center gap-1"><MapPin size={12} />{location?.trim() || "Local"}</span>
            <span className="inline-flex items-center gap-1"><Users size={12} />{beneficiaries?.trim() || "Público"}</span>
          </div>
          <p className="text-sm text-text">{summary?.trim() || "O que aconteceu aparecerá aqui."}</p>
          <p className="text-sm text-text"><strong>Resultado:</strong> {result?.trim() || "O resultado concreto aparecerá aqui."}</p>
          {evidence?.trim() ? <p className="rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">Evidência: {evidence}</p> : null}
          {nextStep?.trim() ? <p className="text-xs text-muted"><strong>Próximo passo:</strong> {nextStep}</p> : null}
        </div>
      </div>
    </aside>
  );
}
