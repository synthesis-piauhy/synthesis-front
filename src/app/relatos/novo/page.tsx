"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ActivityForm } from "@/components/activity/ActivityForm";
import { api } from "@/services/api";

export default function NewActivityPage() {
  const overview = useQuery({ queryKey: ["overview"], queryFn: api.getCollectionOverview });
  return (
    <AppShell>
      <PageHeader title="Nova atividade" description="Registre uma atividade efetivamente realizada durante a semana." />
      <ActivityForm closed={overview.data?.cycle.status === "encerrada"} />
    </AppShell>
  );
}
