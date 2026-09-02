"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminField, AdminValue } from "@/services/administration";

function MultipleField({ field, value, onChange }: { field: AdminField; value: AdminValue; onChange: (value: AdminValue) => void }) {
  const [search, setSearch] = useState("");
  const selected = Array.isArray(value) ? value : [];
  const options = field.options.filter((option) => option.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return (
    <fieldset className="rounded-app border border-border p-3">
      <legend className="px-1 text-sm font-medium">{field.label} ({selected.length} selecionados)</legend>
      <Input aria-label={`Buscar em ${field.label}`} placeholder="Buscar opções" value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="mt-2 max-h-44 space-y-2 overflow-y-auto">
        {options.map((option) => (
          <label className="flex items-start gap-2 text-sm" key={option.value}>
            <input className="mt-1" type="checkbox" checked={selected.includes(option.value)} onChange={(event) => onChange(event.target.checked ? [...selected, option.value] : selected.filter((id) => id !== option.value))} />
            <span>{option.label}</span>
          </label>
        ))}
        {!options.length ? <p className="text-sm text-muted">Nenhuma opção encontrada.</p> : null}
      </div>
      {field.help ? <p className="mt-2 text-xs text-muted">{field.help}</p> : null}
    </fieldset>
  );
}

export function toLocalDatetime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function AdminFields({ fields, values, creating, onChange }: {
  fields: AdminField[];
  values: Record<string, AdminValue>;
  creating: boolean;
  onChange: (name: string, value: AdminValue) => void;
}) {
  return <div className="space-y-4">{fields.map((field) => {
    const value = values[field.name] ?? "";
    if (field.type === "multiple") return <MultipleField key={field.name} field={field} value={value} onChange={(next) => onChange(field.name, next)} />;
    if (field.type === "checkbox") return (
      <label key={field.name} className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(field.name, event.target.checked)} />{field.label}
      </label>
    );
    const inputId = `admin-field-${field.name}`;
    const required = field.required || (field.type === "password" && creating);
    return (
      <div key={field.name}>
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium">{field.label}{required ? " *" : ""}</label>
        {field.type === "select" ? (
          <Select id={inputId} required={required} value={String(value)} onChange={(event) => onChange(field.name, event.target.value)}>
            <option value="">{required ? "Selecione" : "Sem vínculo"}</option>
            {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        ) : field.type === "textarea" ? (
          <Textarea id={inputId} required={required} maxLength={field.maxLength ?? undefined} value={String(value)} onChange={(event) => onChange(field.name, event.target.value)} />
        ) : (
          <Input id={inputId} type={field.type} required={required} autoComplete={field.type === "password" ? "new-password" : undefined}
            min={field.type === "number" ? 0 : undefined} maxLength={field.maxLength ?? undefined}
            value={field.type === "datetime-local" ? toLocalDatetime(String(value)) : String(value)}
            onChange={(event) => onChange(field.name, field.type === "datetime-local" && event.target.value ? new Date(event.target.value).toISOString() : event.target.value)} />
        )}
        {field.help ? <p className="mt-1 text-xs text-muted">{field.help}</p> : null}
      </div>
    );
  })}</div>;
}
