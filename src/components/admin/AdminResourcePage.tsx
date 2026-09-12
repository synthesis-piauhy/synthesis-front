"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/providers";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { administration, adminDescriptions, type AdminRecord, type AdminResource, type AdminValue } from "@/services/administration";
import { AdminDeleteDialog, AdminRecordDialog, AdminResourceBody, displayValue, type Selection } from "./AdminResourceParts";

export { displayValue };

function initialValue(field: AdminResource["fields"][number]): AdminValue {
  if (field.type === "checkbox") return field.name === "active";
  if (field.type === "multiple") return [];
  if (field.type === "number") return 0;
  if (field.name === "status") return "aberta";
  if (field.name === "role") return "gestor";
  return "";
}

function initialValues(resource: AdminResource): Record<string, AdminValue> {
  return Object.fromEntries(resource.fields.map((field) => [field.name, initialValue(field)]));
}

export function AdminResourcePage({ resourceKey }: { resourceKey: string }) {
  const { role } = useAuth();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<Selection>();
  const [edits, setEdits] = useState<Record<string, AdminValue>>({});
  const [deleteRecord, setDeleteRecord] = useState<AdminRecord>();
  const [notice, setNotice] = useState("");
  const resources = useQuery({ queryKey: ["administration", "resources"], queryFn: administration.resources, enabled: role === "admin" });
  const resource = resources.data?.find((item) => item.key === resourceKey);
  const list = useQuery({ queryKey: ["administration", resourceKey, query, page], queryFn: () => administration.list(resourceKey, query, page), enabled: role === "admin" && Boolean(resource) });
  const detail = useQuery({ queryKey: ["administration", resourceKey, "detail", selection?.id], queryFn: () => administration.get(resourceKey, selection!.id!), enabled: role === "admin" && Boolean(selection?.id), staleTime: 0, refetchOnWindowFocus: false });
  const values = selection?.mode === "create" ? edits : { ...detail.data?.values, password: "", ...edits };

  async function invalidate() {
    const keys = ["administration", "users", "areas", "cycles", "overview", "activityReports"];
    await Promise.all(keys.map((key) => client.invalidateQueries({ queryKey: [key] })));
  }
  const save = useMutation({
    mutationFn: () => {
      if (!resource) throw new Error("Recurso não encontrado.");
      const allowed = Object.fromEntries(resource.fields.map((field) => [field.name, values[field.name] ?? (field.type === "multiple" ? [] : "")]));
      return administration.save(resourceKey, allowed, selection?.id);
    },
    onSuccess: async () => { setSelection(undefined); setNotice("Cadastro salvo com sucesso."); await invalidate(); },
  });
  const remove = useMutation({
    mutationFn: () => administration.remove(resourceKey, deleteRecord!.id),
    onSuccess: async () => {
      setDeleteRecord(undefined); setNotice("Cadastro excluído.");
      if (list.data?.items.length === 1 && page > 1) setPage(page - 1);
      await invalidate();
    },
  });

  function open(record: AdminRecord | undefined, mode: Selection["mode"]) {
    save.reset(); setNotice("");
    setEdits(mode === "create" && resource ? initialValues(resource) : {});
    setSelection({ id: record?.id, mode });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!save.isPending) save.mutate();
  }
  function chooseDelete(record: AdminRecord) {
    remove.reset(); setDeleteRecord(record);
  }

  return <AppShell>
    <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="Esta área é exclusiva do administrador técnico." />}>
      <Link href="/administracao" className="mb-4 inline-block text-sm text-secondary hover:underline">← Administração</Link>
      <PageHeader title={resource?.title ?? "Administração"} description={adminDescriptions[resourceKey] ?? "Consulta administrativa."}
        actions={resource?.canCreate ? <Button onClick={() => open(undefined, "create")}>Novo cadastro</Button> : undefined} />
      {notice ? <p role="status" className="mb-4 rounded-app border border-success/20 bg-success/[0.06] p-3 text-sm font-medium text-success">{notice}</p> : null}
      {resources.isError ? <ErrorState message={resources.error.message} onRetry={() => void resources.refetch()} /> : null}
      {resources.isLoading || list.isLoading ? <LoadingState label="Carregando registros" /> : null}
      {resource ? <AdminResourceBody resource={resource} resourceKey={resourceKey} list={list.data} loading={list.isLoading} fetching={list.isFetching} error={list.error} query={query} search={search} page={page} onSearch={setSearch} onQuery={setQuery} onPage={setPage} onRetry={() => void list.refetch()} onOpen={open} onDelete={chooseDelete} /> : null}
      {resources.isSuccess && !resource ? <EmptyState description="Recurso administrativo não encontrado." /> : null}
      <AdminRecordDialog selection={selection} resource={resource} detail={detail.data} values={values} loading={detail.isFetching} error={detail.error} saving={save.isPending} saveError={save.error} canEdit={selection?.mode === "create" || detail.data?.canEdit} onClose={() => setSelection(undefined)} onEdit={() => setSelection((current) => current ? { ...current, mode: "edit" } : current)} onRetry={() => void detail.refetch()} onChange={(name, value) => setEdits((current) => ({ ...current, [name]: value }))} onSubmit={submit} />
      <AdminDeleteDialog record={deleteRecord} pending={remove.isPending} error={remove.error} onClose={() => setDeleteRecord(undefined)} onConfirm={() => remove.mutate()} />
    </RoleGuard>
  </AppShell>;
}
