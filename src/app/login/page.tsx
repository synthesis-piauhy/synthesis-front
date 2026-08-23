"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export default function LoginPage() {
  const router = useRouter();
  const { role, setRole } = useAuth();
  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6">
      <section className="w-full max-w-md rounded-app border border-border bg-white p-8 shadow-subtle">
        <div className="mb-8 text-2xl font-semibold text-primary">synthesis</div>
        <h1 className="text-3xl font-semibold text-text">Relatos semanais</h1>
        <p className="mt-2 text-base text-muted">Registre atividades e transforme resultados em relatórios visuais</p>
        <Button className="mt-8 w-full" onClick={() => router.push("/")}>
          <LogIn size={18} aria-hidden />
          Entrar com conta corporativa
        </Button>
        <p className="mt-4 text-sm text-muted">Acesso restrito a usuários autorizados.</p>
        {process.env.NODE_ENV === "development" ? (
          <label className="mt-6 block text-sm font-medium">
            Perfil de desenvolvimento
            <Select className="mt-1" value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
              <option value="gestor">Gestor</option>
              <option value="gerente">Gerente</option>
              <option value="admin">Administrador</option>
            </Select>
          </label>
        ) : null}
      </section>
    </main>
  );
}
