"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ActivityForm } from "@/components/activity/ActivityForm";
import { api } from "@/services/api";

export default function NewActivityPage() {
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const open = cycles.data?.some((cycle) => cycle.status === "aberta" || cycle.status === "reaberta");
  return (
    <AppShell>
      <PageHeader title="Nova atividade" description="Registre uma atividade efetivamente realizada durante a semana." />
      <ActivityForm closed={!cycles.isLoading && !open} />
    </AppShell>
  );
}
