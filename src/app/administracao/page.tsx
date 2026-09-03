"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  ChevronDown,
  FileStack,
  FileText,
  FolderKanban,
  Images,
  Layers3,
  LockKeyhole,
  ScrollText,
  Search,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/app/providers";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Input } from "@/components/ui/input";
import { administration, adminDescriptions, adminRoutes, type AdminResource } from "@/services/administration";

const priorityKeys = ["users", "areas", "cycles", "reports"];
const operationKeys = ["activities", "versions", "audit"];
const advancedKeys = ["photos", "sections", "cards", "groups", "permissions"];

const resourceMeta: Record<string, { label?: string; eyebrow?: string; icon: typeof Users }> = {
  users: { icon: Users, eyebrow: "Acessos" },
  areas: { icon: FolderKanban, eyebrow: "Estrutura" },
  cycles: { icon: CalendarClock, eyebrow: "Calendário" },
  reports: { icon: FileStack, label: "Relatório mosaico", eyebrow: "Entrega consolidada" },
  activities: { icon: Activity },
  versions: { icon: FileText },
  audit: { icon: ScrollText },
  photos: { icon: Images },
  sections: { icon: Layers3 },
  cards: { icon: FileText },
  groups: { icon: ShieldCheck },
  permissions: { icon: LockKeyhole },
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function resourceLabel(resource: AdminResource) {
  return resourceMeta[resource.key]?.label ?? resource.title;
}

function AdminResourceLink({ resource, prominent = false }: { resource: AdminResource; prominent?: boolean }) {
  const meta = resourceMeta[resource.key];
  const Icon = meta?.icon ?? Settings2;
  return (
    <Link
      href={`/administracao/${adminRoutes[resource.key]}`}
      className={prominent
        ? "group flex min-h-56 flex-col rounded-app-lg border border-border bg-surface p-6 shadow-subtle transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-raised"
        : "group flex items-center gap-4 rounded-app border border-border bg-surface p-4 transition duration-200 hover:border-neutral-300 hover:shadow-subtle"}
    >
      <span className={`grid shrink-0 place-items-center bg-neutral-100 text-primary transition group-hover:bg-primary group-hover:text-white ${prominent ? "size-11 rounded-app" : "size-10 rounded-app-sm"}`}>
        <Icon size={prominent ? 21 : 19} aria-hidden />
      </span>
      {prominent ? (
        <>
          <div className="mt-7">
            <p className="text-caption font-semibold uppercase tracking-[0.13em] text-muted">{meta?.eyebrow ?? "Administração"}</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-text">{resourceLabel(resource)}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{adminDescriptions[resource.key]}</p>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-4 text-sm">
            <span className="text-muted">{resource.count} {resource.count === 1 ? "registro" : "registros"}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary">{resource.canCreate ? "Gerenciar" : "Consultar"}<ArrowRight className="transition group-hover:translate-x-0.5" size={15} /></span>
          </div>
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1"><span className="block font-semibold text-text">{resourceLabel(resource)}</span><span className="mt-0.5 block truncate text-sm text-muted">{adminDescriptions[resource.key]}</span></span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-muted">{resource.count}</span>
          <ArrowRight className="text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-primary" size={17} />
        </>
      )}
    </Link>
  );
}

export default function AdminPage() {
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  const resources = useQuery({ queryKey: ["administration", "resources"], queryFn: administration.resources, enabled: role === "admin" });
  const byKeys = (keys: string[]) => keys.flatMap((key) => resources.data?.find((item) => item.key === key) ?? []);
  const results = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return [];
    return (resources.data ?? []).filter((resource) => normalize(`${resourceLabel(resource)} ${adminDescriptions[resource.key] ?? ""}`).includes(term));
  }, [resources.data, search]);

  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="A administração é exclusiva do administrador técnico." />}>
        <PageHeader title="Administração" description="Gerencie a operação diária e consulte os recursos técnicos quando necessário." />
        <div className="relative mb-8 max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden />
          <Input className="pl-10" type="search" aria-label="Buscar na administração" placeholder="Buscar usuários, relatórios ou ferramentas..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        {resources.isLoading ? <LoadingState cards={4} label="Carregando recursos administrativos" /> : null}
        {resources.isError ? <ErrorState message={resources.error.message} onRetry={() => void resources.refetch()} /> : null}
        {search.trim() ? (
          <section aria-labelledby="resultados-administracao">
            <div className="mb-4 flex items-end justify-between"><div><p className="text-caption font-semibold uppercase tracking-[0.13em] text-muted">Busca</p><h2 id="resultados-administracao" className="mt-1 text-section-title font-semibold text-text">Resultados</h2></div><span className="text-sm text-muted">{results.length} encontrado{results.length === 1 ? "" : "s"}</span></div>
            {results.length ? <div className="grid gap-3 lg:grid-cols-2">{results.map((resource) => <AdminResourceLink key={resource.key} resource={resource} />)}</div> : <EmptyState title="Nenhum recurso encontrado" description="Tente buscar por outro nome ou pela atividade que deseja realizar." />}
          </section>
        ) : resources.data ? (
          <div className="space-y-10">
            <section aria-labelledby="rotina-administrativa">
              <div className="mb-5"><p className="text-caption font-semibold uppercase tracking-[0.13em] text-muted">Maior frequência de uso</p><h2 id="rotina-administrativa" className="mt-1 text-section-title font-semibold text-text">Rotina administrativa</h2><p className="mt-1 text-sm text-muted">Cadastros, prazos e a entrega que consolida os relatos da semana.</p></div>
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">{byKeys(priorityKeys).map((resource) => <AdminResourceLink key={resource.key} resource={resource} prominent />)}</div>
            </section>

            <section aria-labelledby="acompanhamento-operacao">
              <div className="mb-4"><h2 id="acompanhamento-operacao" className="text-xl font-semibold tracking-tight text-text">Acompanhamento e histórico</h2><p className="mt-1 text-sm text-muted">Consultas de apoio para acompanhar o conteúdo e a rastreabilidade.</p></div>
              <div className="grid gap-3 lg:grid-cols-2">{byKeys(operationKeys).map((resource) => <AdminResourceLink key={resource.key} resource={resource} />)}</div>
            </section>

            {byKeys(advancedKeys).length ? (
              <details className="group rounded-app-lg border border-border bg-surface">
                <summary className="flex cursor-pointer list-none items-center gap-4 p-5 marker:content-none">
                  <span className="grid size-10 place-items-center rounded-app-sm bg-neutral-100 text-muted"><Settings2 size={19} /></span>
                  <span className="flex-1"><span className="block font-semibold text-text">Ferramentas avançadas</span><span className="mt-0.5 block text-sm text-muted">Estruturas internas, permissões e recursos de diagnóstico.</span></span>
                  <span className="hidden text-xs font-medium text-muted sm:block">{byKeys(advancedKeys).length} recursos</span>
                  <ChevronDown className="text-muted transition group-open:rotate-180" size={19} />
                </summary>
                <div className="grid gap-3 border-t border-border p-4 lg:grid-cols-2">{byKeys(advancedKeys).map((resource) => <AdminResourceLink key={resource.key} resource={resource} />)}</div>
              </details>
            ) : null}
          </div>
        ) : null}
      </RoleGuard>
    </AppShell>
  );
}
