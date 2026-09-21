"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Camera, Save, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/providers";
import { api } from "@/services/api";
import type { User } from "@/types";

type SelectedPhoto = { file: File; url: string };

function ProfileEditor({ user }: { user: User }) {
  const { updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [selected, setSelected] = useState<SelectedPhoto | null>(null);
  const [nameError, setNameError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [success, setSuccess] = useState("");
  const nameMutation = useMutation({
    mutationFn: api.updateProfileName,
    onSuccess: (updated) => { updateUser(updated); setName(updated.name); setSuccess("Nome atualizado com sucesso."); },
  });
  const photoMutation = useMutation({
    mutationFn: api.uploadProfileAvatar,
    onSuccess: (updated) => { updateUser(updated); setSelected(null); setSuccess("Foto de perfil atualizada."); },
  });
  const removeMutation = useMutation({
    mutationFn: api.removeProfileAvatar,
    onSuccess: (updated) => { updateUser(updated); setSelected(null); setSuccess("Foto de perfil removida."); },
  });
  useEffect(() => () => { if (selected?.url) URL.revokeObjectURL(selected.url); }, [selected]);

  function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = name.trim().replace(/\s+/g, " ");
    if (normalized.length < 2 || normalized.length > 150) {
      setNameError("Informe um nome entre 2 e 150 caracteres.");
      return;
    }
    setNameError("");
    setSuccess("");
    nameMutation.mutate(normalized);
  }

  function choosePhoto(file?: File) {
    setSuccess("");
    setPhotoError("");
    photoMutation.reset();
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setSelected(null);
      setPhotoError("Escolha uma imagem PNG, JPG ou WebP de até 5 MB.");
      return;
    }
    setSelected({ file, url: URL.createObjectURL(file) });
  }

  const busyPhoto = photoMutation.isPending || removeMutation.isPending;
  return (
    <div className="grid max-w-4xl gap-5 lg:grid-cols-[1fr_1.1fr]">
      <section className="rounded-app border border-border bg-white p-6 shadow-subtle" aria-labelledby="profile-photo-title">
        <h3 id="profile-photo-title" className="text-base font-semibold text-text">Foto de perfil</h3>
        <p className="mt-1 text-sm text-muted">Aparece na sua área de trabalho. PNG, JPG ou WebP, até 5 MB.</p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <ProfileAvatar user={{ name: user.name, avatarUrl: selected?.url ?? user.avatarUrl }} className="size-24 text-3xl font-semibold" />
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-app border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition hover:border-secondary hover:text-secondary">
              <Camera size={16} aria-hidden />Escolher foto
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Escolher foto de perfil" onChange={(event) => { choosePhoto(event.target.files?.[0]); event.target.value = ""; }} />
            </label>
            {selected ? <Button type="button" onClick={() => photoMutation.mutate(selected.file)} loading={photoMutation.isPending} disabled={busyPhoto}><Save size={16} aria-hidden />Salvar foto</Button> : null}
            {selected ? <Button type="button" variant="ghost" onClick={() => setSelected(null)} disabled={busyPhoto}>Cancelar seleção</Button> : null}
            {!selected && user.avatarUrl ? <Button type="button" variant="outline" onClick={() => { setSuccess(""); removeMutation.mutate(); }} loading={removeMutation.isPending} disabled={busyPhoto}><Trash2 size={16} aria-hidden />Remover foto</Button> : null}
          </div>
        </div>
        {photoError || photoMutation.isError || removeMutation.isError ? <p role="alert" className="mt-4 text-sm text-danger">{photoError || photoMutation.error?.message || removeMutation.error?.message}</p> : null}
      </section>

      <section className="rounded-app border border-border bg-white p-6 shadow-subtle" aria-labelledby="profile-data-title">
        <h3 id="profile-data-title" className="text-base font-semibold text-text">Dados do perfil</h3>
        <p className="mt-1 text-sm text-muted">Você pode alterar seu nome. Área e e-mail de login são definidos pela administração.</p>
        <form className="mt-5" onSubmit={saveName}>
          <label htmlFor="profile-name" className="block text-sm font-medium text-text">Nome
            <Input id="profile-name" className="mt-1" autoComplete="name" maxLength={150} value={name} aria-invalid={Boolean(nameError || nameMutation.isError)} onChange={(event) => { setName(event.target.value); setNameError(""); nameMutation.reset(); }} />
          </label>
          {nameError || nameMutation.isError ? <p role="alert" className="mt-1 text-sm text-danger">{nameError || nameMutation.error?.message}</p> : null}
          <Button type="submit" className="mt-3" loading={nameMutation.isPending} disabled={name.trim() === user.name || nameMutation.isPending}><Save size={16} aria-hidden />Salvar nome</Button>
        </form>
        <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Área vigente</dt><dd className="mt-1 break-words text-sm font-medium text-text">{user.area ?? "Nenhuma área vinculada"}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">E-mail de login</dt><dd className="mt-1 break-all text-sm font-medium text-text">{user.email}</dd></div>
        </dl>
      </section>
      {success ? <p role="status" className="rounded-app border border-success/30 bg-success/10 p-3 text-sm font-medium text-success lg:col-span-2">{success}</p> : null}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <AppShell>
      <PageHeader title="Meu perfil" description="Atualize como você aparece na plataforma." />
      {user ? <ProfileEditor key={user.id} user={user} /> : null}
    </AppShell>
  );
}
