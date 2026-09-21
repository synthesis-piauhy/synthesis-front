"use client";

import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { GUIDED_QUESTIONS, guidedAnswersComplete, type GuidedAnswers } from "./guidedActivity";
import type { ActivityTemplateKey } from "./activityTemplates";

export function GuidedQuestions({ templateKey, answers, onChange, onGenerate, error }: {
  templateKey: ActivityTemplateKey;
  answers: GuidedAnswers;
  onChange: (answers: GuidedAnswers) => void;
  onGenerate: () => void;
  error?: string;
}) {
  return (
    <section className="space-y-4 rounded-app border border-border bg-white p-5 shadow-subtle">
      <div>
        <h2 className="text-base font-semibold text-text">Conte o essencial</h2>
        <p className="text-sm text-muted">Respostas curtas geram uma primeira versão do relato.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {GUIDED_QUESTIONS[templateKey].map((question) => (
          <label key={question.key} htmlFor={`guided-${question.key}`} className="block text-sm font-medium">
            {question.label}{question.required ? <span className="text-danger"> *</span> : <span className="font-normal text-muted"> (opcional)</span>}
            {question.options ? (
              <Select id={`guided-${question.key}`} className="mt-1" value={answers[question.key] ?? ""} onChange={(event) => onChange({ ...answers, [question.key]: event.target.value })}>
                <option value="">Selecione</option>
                {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </Select>
            ) : (
              <Input id={`guided-${question.key}`} className="mt-1" type={question.type === "number" ? "number" : "text"} min={question.type === "number" ? 1 : undefined} maxLength={question.type === "number" ? undefined : question.key === "outcome" ? 150 : question.key === "subject" ? 55 : 70} placeholder={question.placeholder} value={answers[question.key] ?? ""} onChange={(event) => onChange({ ...answers, [question.key]: event.target.value })} />
            )}
            {question.hint ? <span className="mt-1 block text-xs font-normal text-muted">{question.hint}</span> : null}
          </label>
        ))}
      </div>
      {error ? <p role="alert" className="text-sm text-danger">{error} Descreva o resultado em pelo menos 8 caracteres.</p> : null}
      <Button type="button" variant="outline" onClick={onGenerate} disabled={!guidedAnswersComplete(templateKey, answers)}>Atualizar texto a partir das respostas</Button>
    </section>
  );
}
