"use client";

import type { Area, User } from "@/types";
import { Select } from "../ui/select";
import { Input } from "../ui/input";

export function ActivityFilters({
  areas,
  users,
  scope,
  onScopeChange,
}: {
  areas: Area[];
  users: User[];
  scope: string;
  onScopeChange: (value: string) => void;
}) {
  return (
    <section className="mb-5 grid gap-3 rounded-app border border-border bg-white p-4 shadow-subtle md:grid-cols-5">
      <label className="text-sm font-medium">
        Escopo
        <Select className="mt-1" value={scope} onChange={(event) => onScopeChange(event.target.value)}>
          <option value="todos">Todos os relatos</option>
          <option value="meus">Meus relatos</option>
        </Select>
      </label>
      <label className="text-sm font-medium">
        Área
        <Select className="mt-1">
          <option>Todas</option>
          {areas.map((area) => (
            <option key={area}>{area}</option>
          ))}
        </Select>
      </label>
      <label className="text-sm font-medium">
        Gestor
        <Select className="mt-1">
          <option>Todos</option>
          {users
            .filter((user) => user.role === "gestor")
            .map((user) => (
              <option key={user.id}>{user.name}</option>
            ))}
        </Select>
      </label>
      <label className="text-sm font-medium">
        Data inicial
        <Input className="mt-1" placeholder="dd/mm/aaaa" />
      </label>
      <label className="text-sm font-medium">
        Data final
        <Input className="mt-1" placeholder="dd/mm/aaaa" />
      </label>
    </section>
  );
}
