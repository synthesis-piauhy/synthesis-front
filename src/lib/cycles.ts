import type { WeeklyCycle } from "@/types";

export function currentCycle(cycles: WeeklyCycle[] | undefined) {
  return cycles?.find((cycle) => cycle.status === "aberta" || cycle.status === "reaberta") ?? cycles?.[0];
}
