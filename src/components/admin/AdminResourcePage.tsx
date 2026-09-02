"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/providers";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AdminFields } from "./AdminFields";
import { administration, adminDescriptions, type AdminRecord, type AdminResource, type AdminValue } from "@/services/administration";

export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.length ? value.map(displayValue).join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString("pt-BR");
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split("-").reverse().join("/");
  return String(value);
}

function initialValues(resource: AdminResource): Record<string, AdminValue> {
  return Object.fromEntries(resource.fields.map((field) => {
    if (field.type === "checkbox") return [field.name, field.name === "active"];
    if (field.type === "multiple") return [field.name, []];
    if (field.type === "number") return [field.name, 0];
    if (field.name === "status") return [field.name, "aberta"];
    if (field.name === "role") return [field.name, "gestor"];
    return [field.name, ""];
  }));
}

export function AdminResourcePage({ resourceKey }: { resourceKey: string }) {
  const { role } = useAuth();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<{ id?: string; mode: "view" | "edit" | "create" }>();
  const [values, setValues] = useState<Record<string, AdminValue>>({});
  const [deleteRecord, setDeleteRecord] = useState<AdminRecord>();
  const [notice, setNotice] = useState("");
  const resources = useQuery({ queryKey: ["administration", "resources"], queryFn: administration.resources, enabled: role === "admin" });
  const resource = resources.data?.find((item) => item.key === resourceKey);
  const list = useQuery({ queryKey: ["administration", resourceKey, query, page], queryFn: () => administration.list(resourceKey, query, page), enabled: role === "admin" && Boolean(resource) });
  const detail = useQuery({ queryKey: ["administration", resourceKey, "detail", selection?.id], queryFn: () => administration.get(resourceKey, selection!.id!), enabled: role === "admin" && Boolean(selection?.id), staleTime: 0, refetchOnWindowFocus: false });

  useEffect(() => {
    if (detail.data && selection?.id === detail.data.id) setValues({ ...detail.data.values, password: "" });
  }, [detail.data, selection?.id]);

  async function invalidate() {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["administration"] }),
      client.invalidateQueries({ queryKey: ["users"] }),
      client.invalidateQueries({ queryKey: ["areas"] }),
      client.invalidateQueries({ queryKey: ["cycles"] }),
      client.invalidateQueries({ queryKey: ["overview"] }),
      client.invalidateQueries({ queryKey: ["activityReports"] }),
    ]);
  }
  const save = useMutation({
    mutationFn: () => {
      if (!resource) throw new Error("Recurso não encontrado.");
      const allowed = Object.fromEntries(resource.fields.map((field) => [field.name, values[field.name] ?? (field.type === "multiple" ? [] : "")]));
      return administration.save(resourceKey, allowed, selection?.id);
    },
    onSuccess: async () => {
      setSelection(undefined);
      setNotice("Cadastro salvo com sucesso.");
      await invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: () => administration.remove(resourceKey, deleteRecord!.id),
    onSuccess: async () => {
      setDeleteRecord(undefined);
      setNotice("Cadastro excluído.");
      if (list.data?.items.length === 1 && page > 1) setPage(page - 1);
      await invalidate();
    },
  });

  function open(record: AdminRecord | undefined, mode: "view" | "edit" | "create") {
    save.reset();
    setNotice("");
    if (mode === "create" && resource) setValues(initialValues(resource));
    else setValues({});
    setSelection({ id: record?.id, mode });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!save.isPending) save.mutate();
  }
  const canEditDetail = selection?.mode === "create" || detail.data?.canEdit;

  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="Esta área é exclusiva do administrador técnico." />}>
        <Link href="/administracao" className="mb-4 inline-block text-sm text-secondary hover:underline">← Administração</Link>
        <PageHeader title={resource?.title ?? "Administração"} description={adminDescriptions[resourceKey] ?? "Consulta administrativa."}
          actions={resource?.canCreate ? <Button onClick={() => open(undefined, "create")}>Novo cadastro</Button> : undefined} />
        {notice ? <p role="status" className="mb-4 rounded-app border border-success bg-white p-3 text-sm text-success">{notice}</p> : null}
        {resources.isError ? <ErrorState message={resources.error.message} onRetry={() => void resources.refetch()} /> : null}
        {resources.isLoading || list.isLoading ? <p role="status" className="p-4 text-muted">Carregando registros...</p> : null}
        {resource ? <>
          <form onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(search.trim()); }} className="mb-4 flex flex-wrap gap-2">
            <Input className="max-w-md" aria-label={`Buscar ${resource.title}`} placeholder="Buscar por nome ou descrição" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Button type="submit" variant="outline">Buscar</Button>
            {query ? <Button type="button" variant="ghost" onClick={() => { setSearch(""); setQuery(""); setPage(1); }}>Limpar busca</Button> : null}
          </form>
          {resourceKey === "cycles" ? <p className="mb-4 text-sm text-muted">Para encerrar, edite a situação para Encerrada. Para reabrir, escolha Reaberta e informe a justificativa e um novo prazo futuro.</p> : null}
          {(resourceKey === "groups" && !resource.canCreate) ? <p className="mb-4 text-sm text-muted">A alteração de grupos e permissões técnicas exige acesso de superusuário.</p> : null}
          {list.isError ? <ErrorState message={list.error.message} onRetry={() => void list.refetch()} /> : null}
          {list.data && !list.data.items.length ? <EmptyState description={query ? "Nenhum resultado para esta busca." : "Nenhum registro cadastrado."} /> : null}
          {list.data?.items.length ? <div className="overflow-x-auto rounded-app border border-border bg-white shadow-subtle">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{resource.title}</caption>
              <thead className="bg-page text-muted"><tr>{resource.columns.map((column) => <th scope="col" className="p-3" key={column.value}>{column.label}</th>)}<th scope="col" className="p-3">Ações</th></tr></thead>
              <tbody>{list.data.items.map((record) => <tr className="border-t border-border" key={record.id}>
                {resource.columns.map((column) => <td className="max-w-xs p-3 align-top" key={column.value}><span className="line-clamp-3 break-words">{displayValue(record.display[column.value])}</span></td>)}
                <td className="p-3 align-top"><div className="flex flex-wrap gap-1">
                  <Button variant="ghost" onClick={() => open(record, "view")} aria-label={`Ver ${record.label}`}>Detalhes</Button>
                  {record.canEdit ? <Button variant="outline" onClick={() => open(record, "edit")} aria-label={`Editar ${record.label}`}>Editar</Button> : null}
                  {record.canDelete ? <Button variant="ghost" className="text-danger" onClick={() => { remove.reset(); setDeleteRecord(record); }} aria-label={`Excluir ${record.label}`}>Excluir</Button> : null}
                </div></td>
              </tr>)}</tbody>
            </table>
          </div> : null}
          {list.data ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <span>{list.data.total} registros · Página {page} de {Math.max(1, Math.ceil(list.data.total / list.data.pageSize))}</span>
            <div className="flex gap-2"><Button variant="outline" disabled={page <= 1 || list.isFetching} onClick={() => setPage(page - 1)}>Anterior</Button><Button variant="outline" disabled={page * list.data.pageSize >= list.data.total || list.isFetching} onClick={() => setPage(page + 1)}>Próxima</Button></div>
          </div> : null}
        </> : null}
        {resources.isSuccess && !resource ? <EmptyState description="Recurso administrativo não encontrado." /> : null}
        <Dialog open={Boolean(selection)} onOpenChange={(isOpen) => { if (!isOpen && !save.isPending) setSelection(undefined); }} title={`${selection?.mode === "create" ? "Novo cadastro" : selection?.mode === "edit" ? "Editar" : "Detalhes"} — ${resource?.title ?? "Registro"}`}>
          <div className="max-h-[72vh] overflow-y-auto pr-2">
            {selection?.id && detail.isFetching ? <p role="status">Carregando detalhes...</p> : null}
            {selection?.id && detail.isError ? <ErrorState message={detail.error.message} onRetry={() => void detail.refetch()} /> : null}
            {selection?.mode === "view" && detail.data && !detail.isFetching ? <>
              <dl className="space-y-4">{resource?.detailFields.map((field) => <div key={field.value}><dt className="text-sm font-semibold">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-muted">
                {detail.data.files[field.value] ? <a href={detail.data.files[field.value]} target="_blank" rel="noopener noreferrer" className="text-secondary underline">Abrir {field.value === "pdf" ? "PDF" : "imagem"}</a> : displayValue(detail.data.display[field.value])}
              </dd></div>)}</dl>
              {detail.data.canEdit ? <Button className="mt-5" onClick={() => setSelection({ ...selection, mode: "edit" })}>Editar cadastro</Button> : null}
            </> : null}
            {selection && selection.mode !== "view" && resource && (selection.mode === "create" || (detail.isSuccess && !detail.isFetching)) ? (
              canEditDetail ? <form onSubmit={submit}>
                <fieldset disabled={save.isPending}>
                  <AdminFields fields={resource.fields} values={values} creating={selection.mode === "create"} onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
                </fieldset>
                {save.isError ? <p role="alert" className="mt-4 rounded-app border border-danger p-3 text-sm text-danger">{save.error.message}</p> : null}
                <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" disabled={save.isPending} onClick={() => setSelection(undefined)}>Cancelar</Button><Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button></div>
              </form> : <p role="alert">Você não pode editar este registro.</p>
            ) : null}
          </div>
        </Dialog>
        <Dialog open={Boolean(deleteRecord)} onOpenChange={(isOpen) => { if (!isOpen && !remove.isPending) setDeleteRecord(undefined); }} title="Excluir cadastro">
          <p className="text-sm">Excluir <strong>{deleteRecord?.label}</strong>? Esta ação não pode ser desfeita. Cadastros vinculados ao histórico serão preservados.</p>
          {remove.isError ? <p role="alert" className="mt-4 rounded-app border border-danger p-3 text-sm text-danger">{remove.error.message}</p> : null}
          <div className="mt-5 flex justify-end gap-2"><Button variant="outline" disabled={remove.isPending} onClick={() => setDeleteRecord(undefined)}>Cancelar</Button><Button variant="danger" disabled={remove.isPending} onClick={() => remove.mutate()}>{remove.isPending ? "Excluindo..." : "Excluir"}</Button></div>
        </Dialog>
      </RoleGuard>
    </AppShell>
  );
}
