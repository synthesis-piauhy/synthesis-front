"use client";

import { RotateCcw } from "lucide-react";
import type { Area, User } from "@/types";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Input } from "../ui/input";

export type ActivityFilterValue = {
  scope: "todos" | "meus";
  area: string;
  managerId: string;
  startDate: string;
  endDate: string;
  search: string;
};

export const emptyActivityFilters: ActivityFilterValue = {
  scope: "todos",
  area: "",
  managerId: "",
  startDate: "",
  endDate: "",
  search: "",
};

export function filterActivityReports<T extends { title: string; location: string; summary: string; result: string; date: string }>(
  reports: T[],
  filters: ActivityFilterValue,
) {
  const search = filters.search.trim().toLocaleLowerCase("pt-BR");
  return reports.filter((report) => {
    if (filters.startDate && report.date < filters.startDate) return false;
    if (filters.endDate && report.date > filters.endDate) return false;
    if (!search) return true;
    return [report.title, report.location, report.summary, report.result].some((value) =>
      value.toLocaleLowerCase("pt-BR").includes(search),
    );
  });
}

export function ActivityFilters({
  areas,
  users,
  value,
  onChange,
  showScope = true,
}: {
  areas: Area[];
  users: User[];
  value: ActivityFilterValue;
  onChange: (value: ActivityFilterValue) => void;
  showScope?: boolean;
}) {
  const patch = (changes: Partial<ActivityFilterValue>) => onChange({ ...value, ...changes });
  return (
    <section className="mb-5 grid gap-3 rounded-app border border-border bg-white p-4 shadow-subtle md:grid-cols-3 xl:grid-cols-6">
      {showScope ? (
        <label className="text-sm font-medium">
          Escopo
          <Select className="mt-1" value={value.scope} onChange={(event) => patch({ scope: event.target.value as ActivityFilterValue["scope"] })}>
            <option value="todos">Todos os relatos</option>
            <option value="meus">Meus relatos</option>
          </Select>
        </label>
      ) : null}
      <label className="text-sm font-medium">
        Área
        <Select className="mt-1" value={value.area} onChange={(event) => patch({ area: event.target.value })}>
          <option value="">Todas</option>
          {areas.map((area) => <option key={area} value={area}>{area}</option>)}
        </Select>
      </label>
      <label className="text-sm font-medium">
        Gestor
        <Select className="mt-1" value={value.managerId} onChange={(event) => patch({ managerId: event.target.value })}>
          <option value="">Todos</option>
          {users.filter((user) => user.role === "gestor").map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </Select>
      </label>
      <label className="text-sm font-medium">
        Data inicial
        <Input className="mt-1" type="date" value={value.startDate} onChange={(event) => patch({ startDate: event.target.value })} />
      </label>
      <label className="text-sm font-medium">
        Data final
        <Input className="mt-1" type="date" value={value.endDate} onChange={(event) => patch({ endDate: event.target.value })} />
      </label>
      <label className="text-sm font-medium">
        Buscar
        <Input className="mt-1" type="search" placeholder="Título ou local" value={value.search} onChange={(event) => patch({ search: event.target.value })} />
      </label>
      <div className="flex items-end">
        <Button type="button" variant="outline" className="w-full" onClick={() => onChange(emptyActivityFilters)}>
          <RotateCcw size={16} aria-hidden />
          Limpar filtros
        </Button>
      </div>
    </section>
  );
}

