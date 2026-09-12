import type { FormEvent } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AdminList, AdminRecord, AdminResource, AdminValue } from "@/services/administration";
import { AdminFields } from "./AdminFields";

export type Selection = { id?: string; mode: "view" | "edit" | "create" };

export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.length ? value.map(displayValue).join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  if (typeof value !== "string") return String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString("pt-BR");
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split("-").reverse().join("/");
  return value;
}

function ResourceNotice({ resourceKey, canCreate }: { resourceKey: string; canCreate: boolean }) {
  if (resourceKey === "cycles") {
    return <p className="mb-4 text-sm text-muted">Para encerrar, edite a situação para Encerrada. Para reabrir, escolha Reaberta e informe a justificativa e um novo prazo futuro.</p>;
  }
  if (resourceKey === "groups" && !canCreate) {
    return <p className="mb-4 text-sm text-muted">A alteração de grupos e permissões técnicas exige acesso de superusuário.</p>;
  }
  return null;
}

export function AdminResourceBody({ resource, resourceKey, list, loading, fetching, error, query, search, page,
  onSearch, onQuery, onPage, onRetry, onOpen, onDelete }: {
  resource: AdminResource; resourceKey: string; list?: AdminList; loading: boolean; fetching: boolean;
  error?: Error | null; query: string; search: string; page: number; onSearch: (value: string) => void;
  onQuery: (value: string) => void; onPage: (value: number) => void; onRetry: () => void;
  onOpen: (record: AdminRecord, mode: "view" | "edit") => void; onDelete: (record: AdminRecord) => void;
}) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onPage(1);
    onQuery(search.trim());
  }
  function clear() {
    onSearch(""); onQuery(""); onPage(1);
  }
  return <>
    <form onSubmit={submit} className="mb-5 flex flex-col gap-2 rounded-app border border-border bg-surface p-3 shadow-subtle sm:flex-row">
      <Input className="max-w-md shadow-none" aria-label={`Buscar ${resource.title}`} placeholder="Buscar por nome ou descrição" value={search} onChange={(event) => onSearch(event.target.value)} />
      <Button type="submit" variant="outline">Buscar</Button>
      {query ? <Button type="button" variant="ghost" onClick={clear}>Limpar busca</Button> : null}
    </form>
    <ResourceNotice resourceKey={resourceKey} canCreate={resource.canCreate} />
    {error ? <ErrorState message={error.message} onRetry={onRetry} /> : null}
    {!loading && list && !list.items.length ? <EmptyState description={query ? "Nenhum resultado para esta busca." : "Nenhum registro cadastrado."} /> : null}
    {list?.items.length ? <div className="overflow-x-auto rounded-app border border-border bg-surface shadow-subtle">
      <table className="min-w-[720px] w-full text-left text-sm">
        <caption className="sr-only">{resource.title}</caption>
        <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-muted"><tr>{resource.columns.map((column) => <th scope="col" className="px-4 py-3" key={column.value}>{column.label}</th>)}<th scope="col" className="sticky right-0 bg-neutral-50 px-4 py-3">Ações</th></tr></thead>
        <tbody>{list.items.map((record) => <tr className="border-t border-border transition hover:bg-neutral-50/70" key={record.id}>
          {resource.columns.map((column) => <td className="max-w-xs px-4 py-3.5 align-top" key={column.value}><span className="line-clamp-3 break-words">{displayValue(record.display[column.value])}</span></td>)}
          <td className="sticky right-0 bg-surface px-4 py-3 align-top"><div className="flex flex-wrap gap-1">
            <Button variant="ghost" onClick={() => onOpen(record, "view")} aria-label={`Ver ${record.label}`}>Detalhes</Button>
            {record.canEdit ? <Button variant="outline" onClick={() => onOpen(record, "edit")} aria-label={`Editar ${record.label}`}>Editar</Button> : null}
            {record.canDelete ? <Button variant="ghost" className="text-danger" onClick={() => onDelete(record)} aria-label={`Excluir ${record.label}`}>Excluir</Button> : null}
          </div></td>
        </tr>)}</tbody>
      </table>
    </div> : null}
    {list ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <span>{list.total} registros · Página {page} de {Math.max(1, Math.ceil(list.total / list.pageSize))}</span>
      <div className="flex gap-2"><Button variant="outline" disabled={page <= 1 || fetching} onClick={() => onPage(page - 1)}>Anterior</Button><Button variant="outline" disabled={page * list.pageSize >= list.total || fetching} onClick={() => onPage(page + 1)}>Próxima</Button></div>
    </div> : null}
  </>;
}

function dialogTitle(selection: Selection | undefined, resource?: AdminResource) {
  const action = selection?.mode === "create" ? "Novo cadastro" : selection?.mode === "edit" ? "Editar" : "Detalhes";
  return `${action} — ${resource?.title ?? "Registro"}`;
}

export function AdminRecordDialog({ selection, resource, detail, values, loading, error, saving, saveError,
  canEdit, onClose, onEdit, onRetry, onChange, onSubmit }: {
  selection?: Selection; resource?: AdminResource; detail?: AdminRecord; values: Record<string, AdminValue>;
  loading: boolean; error?: Error | null; saving: boolean; saveError?: Error | null; canEdit?: boolean;
  onClose: () => void; onEdit: () => void; onRetry: () => void;
  onChange: (name: string, value: AdminValue) => void; onSubmit: (event: FormEvent) => void;
}) {
  const showForm = selection && selection.mode !== "view" && resource
    && (selection.mode === "create" || (detail && !loading));
  return <Dialog open={Boolean(selection)} onOpenChange={(open) => { if (!open && !saving) onClose(); }} title={dialogTitle(selection, resource)}>
    <div className="max-h-[72vh] overflow-y-auto pr-2">
      {selection?.id && loading ? <p role="status">Carregando detalhes...</p> : null}
      {selection?.id && error ? <ErrorState message={error.message} onRetry={onRetry} /> : null}
      {selection?.mode === "view" && detail && !loading ? <>
        <dl className="space-y-4">{resource?.detailFields.map((field) => <div key={field.value}><dt className="text-sm font-semibold">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-muted">
          {detail.files[field.value] ? <a href={detail.files[field.value]} target="_blank" rel="noopener noreferrer" className="text-secondary underline">Abrir {field.value === "pdf" ? "PDF" : "imagem"}</a> : displayValue(detail.display[field.value])}
        </dd></div>)}</dl>
        {detail.canEdit ? <Button className="mt-5" onClick={onEdit}>Editar cadastro</Button> : null}
      </> : null}
      {showForm ? canEdit ? <form onSubmit={onSubmit}>
        <fieldset disabled={saving}><AdminFields fields={resource.fields} values={values} creating={selection.mode === "create"} onChange={onChange} /></fieldset>
        {saveError ? <p role="alert" className="mt-4 rounded-app border border-danger p-3 text-sm text-danger">{saveError.message}</p> : null}
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancelar</Button><Button type="submit" loading={saving}>Salvar</Button></div>
      </form> : <p role="alert">Você não pode editar este registro.</p> : null}
    </div>
  </Dialog>;
}

export function AdminDeleteDialog({ record, pending, error, onClose, onConfirm }: {
  record?: AdminRecord; pending: boolean; error?: Error | null; onClose: () => void; onConfirm: () => void;
}) {
  return <Dialog open={Boolean(record)} onOpenChange={(open) => { if (!open && !pending) onClose(); }} title="Excluir cadastro">
    <p className="text-sm">Excluir <strong>{record?.label}</strong>? Esta ação não pode ser desfeita. Cadastros vinculados ao histórico serão preservados.</p>
    {error ? <p role="alert" className="mt-4 rounded-app border border-danger p-3 text-sm text-danger">{error.message}</p> : null}
    <div className="mt-5 flex justify-end gap-2"><Button variant="outline" disabled={pending} onClick={onClose}>Cancelar</Button><Button variant="danger" loading={pending} onClick={onConfirm}>Excluir</Button></div>
  </Dialog>;
}
