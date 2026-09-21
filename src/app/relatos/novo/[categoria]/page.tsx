"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ActivityForm } from "@/components/activity/ActivityForm";
import { ACTIVITY_TEMPLATES } from "@/components/activity/activityTemplates";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/services/api";
import { buttonVariants } from "@/components/ui/button";

export default function CategoryActivityPage() {
  const { categoria } = useParams<{ categoria: string }>();
  const template = ACTIVITY_TEMPLATES.find((item) => item.key === categoria);
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const open = cycles.data?.some((cycle) => cycle.status === "aberta" || cycle.status === "reaberta");
  return (
    <AppShell>
      <RoleGuard allowed={["gestor"]} fallback={<EmptyState title="Acesso restrito" description="Somente gestores registram atividades." />}>
        {template ? (
          <>
            <Link href="/relatos/novo" aria-label="Voltar às categorias" title="Voltar às categorias" className={`${buttonVariants({ variant: "ghost", size: "icon" })} mb-5`}><ArrowLeft size={20} aria-hidden /></Link>
            <PageHeader title={template.label} description="Responda às perguntas curtas e revise o texto antes de salvar." />
            <ActivityForm templateKey={template.key} closed={!cycles.isLoading && !open} />
          </>
        ) : <EmptyState title="Categoria não encontrada" description="Escolha uma das categorias disponíveis em Nova atividade." />}
      </RoleGuard>
    </AppShell>
  );
}
