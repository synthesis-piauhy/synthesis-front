"use client";

import { ArrowRight, CheckCircle2, FileText, LogIn, ShieldCheck, Sparkles, Wifi, WifiOff } from "lucide-react";
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
    <main className="grid min-h-screen bg-page lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-primary px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-14">
        <div className="absolute -right-28 -top-28 size-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 size-[32rem] rounded-full bg-secondary/40 blur-3xl" />
        <div className="relative text-2xl font-semibold tracking-tight">synthesis<span className="text-accent">.</span></div>
        <div className="relative max-w-xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/80"><Sparkles size={14} /> Informação que gera ação</span>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.035em] xl:text-6xl">Uma semana inteira de impacto, em uma só visão.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/65">Centralize relatos, organize evidências e transforme o trabalho das equipes em relatórios claros e consistentes.</p>
          <div className="mt-10 grid max-w-lg grid-cols-2 gap-4 text-sm text-white/75">
            <div className="flex items-center gap-2"><CheckCircle2 className="text-accent" size={18} /> Coleta organizada</div>
            <div className="flex items-center gap-2"><FileText className="text-accent" size={18} /> Relatórios prontos</div>
          </div>
        </div>
        <p className="relative text-xs text-white/40">Ambiente seguro para equipes autorizadas</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
      <form onSubmit={submit} className="w-full max-w-md">
        <div className="mb-10 lg:hidden"><div className="text-2xl font-semibold tracking-tight text-primary">synthesis<span className="text-accent">.</span></div><p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">Relatos semanais</p></div>
        <span className="mb-4 inline-flex size-11 items-center justify-center rounded-app bg-primary/10 text-primary"><ShieldCheck size={22} /></span>
        <h2 className="text-3xl font-semibold tracking-tight text-text">Boas-vindas</h2>
        <p className="mt-2 text-base leading-6 text-muted">Entre com suas credenciais para acessar o painel.</p>
        <button
          type="button"
          className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${health.isError ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}
          onClick={() => health.isError && void health.refetch()}
        >
          {health.isError ? <WifiOff size={13} /> : <Wifi size={13} />}{health.isLoading ? "Verificando conexão..." : health.isError ? "API indisponível — tentar novamente" : "Sistema conectado"}
        </button>
        <label className="mt-8 block text-sm font-semibold text-text">
          E-mail
          <Input className="mt-2" type="email" autoComplete="email" placeholder="voce@empresa.com.br" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="mt-5 block text-sm font-semibold text-text">
          Senha
          <Input className="mt-2" type="password" autoComplete="current-password" placeholder="Digite sua senha" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error ? <p role="alert" className="mt-4 rounded-app border border-danger p-3 text-sm text-danger">{error}</p> : null}
        <Button className="mt-6 w-full justify-between px-5" type="submit" disabled={submitting || loading}>
          <LogIn size={18} aria-hidden />
          {submitting ? "Entrando..." : "Entrar"}
          <ArrowRight size={18} aria-hidden />
        </Button>
        <p className="mt-5 text-center text-xs text-muted">Acesso restrito a usuários autorizados.</p>
      </form>
      </section>
    </main>
  );
}
