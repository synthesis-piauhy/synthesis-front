"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Handshake } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { ACTIVITY_TEMPLATES } from "@/components/activity/activityTemplates";
import { buttonVariants } from "@/components/ui/button";

const icons = [CalendarDays, CheckCircle2, Handshake];

export default function NewActivityPage() {
  return (
    <AppShell>
      <RoleGuard allowed={["gestor"]} fallback={<EmptyState title="Acesso restrito" description="Somente gestores registram atividades." />}>
        <Link href="/relatos" aria-label="Voltar aos relatos" title="Voltar aos relatos" className={`${buttonVariants({ variant: "ghost", size: "icon" })} mb-5`}><ArrowLeft size={20} aria-hidden /></Link>
        <PageHeader title="Nova atividade" description="O que você quer registrar nesta semana? Escolha a categoria para responder apenas às perguntas relevantes." />
        <section aria-label="Escolha uma categoria" className="grid gap-4 md:grid-cols-3">
          {ACTIVITY_TEMPLATES.map((template, index) => {
            const Icon = icons[index];
            return (
              <Link key={template.key} href={`/relatos/novo/${template.key}`} className="group flex min-h-56 flex-col rounded-app border border-border bg-white p-6 shadow-subtle transition hover:-translate-y-0.5 hover:border-secondary hover:shadow-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                <span className="grid size-11 place-items-center rounded-app bg-secondary/10 text-secondary"><Icon size={22} aria-hidden /></span>
                <h2 className="mt-5 text-lg font-semibold text-text">{template.label}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">{template.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary">Escolher categoria <ArrowRight size={16} aria-hidden className="transition group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </section>
      </RoleGuard>
    </AppShell>
  );
}
