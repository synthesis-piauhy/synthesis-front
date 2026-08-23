import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DeadlinesAdminPage() {
  return (
    <AppShell>
      <RoleGuard allowed={["admin"]} fallback={<EmptyState title="Acesso restrito" description="Somente o administrador técnico pode configurar prazos." />}>
        <PageHeader title="Prazos" description="Configuração de encerramento, alertas e reabertura excepcional." />
        <form className="grid gap-4 rounded-app border border-border bg-white p-5 shadow-subtle md:grid-cols-2">
          <label className="text-sm font-medium">Dia de encerramento<Input className="mt-1" defaultValue="sexta-feira" /></label>
          <label className="text-sm font-medium">Horário de encerramento<Input className="mt-1" type="time" defaultValue="18:00" /></label>
          <label className="text-sm font-medium">Antecedência do alerta<Input className="mt-1" defaultValue="24 horas" /></label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" defaultChecked /> Envio de alerta no sistema</label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" defaultChecked /> Envio de alerta por e-mail</label>
          <div className="md:col-span-2 border-t border-border pt-4">
            <h2 className="text-lg font-semibold">Reabertura excepcional</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium">Justificativa<Input className="mt-1" /></label>
              <label className="text-sm font-medium">Novo prazo<Input className="mt-1" type="datetime-local" /></label>
            </div>
            <Button className="mt-4" type="button">Confirmar configuração</Button>
          </div>
        </form>
      </RoleGuard>
    </AppShell>
  );
}
