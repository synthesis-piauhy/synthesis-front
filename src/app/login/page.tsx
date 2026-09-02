"use client";

import { LogIn } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const health = useQuery({ queryKey: ["health"], queryFn: api.health, retry: false });

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, router, user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-app border border-border bg-white p-8 shadow-subtle">
        <div className="mb-8 text-2xl font-semibold text-primary">synthesis</div>
        <h1 className="text-3xl font-semibold text-text">Relatos semanais</h1>
        <p className="mt-2 text-base text-muted">Entre com o usuário cadastrado no Django Admin.</p>
        <button
          type="button"
          className={`mt-4 text-sm ${health.isError ? "text-danger" : "text-muted"}`}
          onClick={() => health.isError && void health.refetch()}
        >
          {health.isLoading ? "Verificando conexão com a API..." : health.isError ? "API indisponível — clique para tentar novamente" : "API conectada"}
        </button>
        <label className="mt-8 block text-sm font-medium">
          E-mail
          <Input className="mt-1" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Senha
          <Input className="mt-1" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error ? <p role="alert" className="mt-4 rounded-app border border-danger p-3 text-sm text-danger">{error}</p> : null}
        <Button className="mt-6 w-full" type="submit" disabled={submitting || loading}>
          <LogIn size={18} aria-hidden />
          {submitting ? "Entrando..." : "Entrar"}
        </Button>
        <p className="mt-4 text-sm text-muted">Acesso restrito a usuários autorizados.</p>
      </form>
    </main>
  );
}

