"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";
import { Select } from "./ui/select";

export function WeekSelector({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const selected = value ?? currentCycle(cycles.data)?.id ?? "";
  return (
    <label className="block text-sm font-medium text-text">
      Semana
      <Select className="mt-1" value={selected} onChange={(event) => onChange?.(event.target.value)} disabled={cycles.isLoading}>
        {cycles.data?.map((cycle) => (
          <option key={cycle.id} value={cycle.id}>
            {cycle.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
