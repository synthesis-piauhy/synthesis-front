"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";
import type { Area } from "@/types";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { activitySchema, type ActivityFormValues } from "./activitySchema";
import { PhotoUploader } from "./PhotoUploader";

export function ActivityForm({ closed = false }: { closed?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [mainFiles, setMainFiles] = useState<File[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const cycle = currentCycle(cycles.data);
  const createMutation = useMutation({
    mutationFn: api.createActivityReport,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["activityReports"] });
      router.push(`/relatos/${created.id}`);
    },
  });
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      date: "",
      location: "",
      summary: "",
      result: "",
      beneficiaries: "",
      area: "",
      managerId: "",
      mainPhoto: undefined,
      additionalPhotos: [],
    },
  });

  useEffect(() => {
    if (!cycle) return;
    const today = new Date().toISOString().slice(0, 10);
    const initialDate = today < cycle.startsAt || today > cycle.endsAt ? cycle.endsAt : today;
    form.setValue("date", initialDate);
  }, [cycle, form]);

  useEffect(() => {
    if (!user) return;
    form.setValue("area", user.area ?? "");
    form.setValue("managerId", user.id);
  }, [form, user]);

  if (closed || (!cycles.isLoading && (!cycle || cycle.status === "encerrada"))) {
    return (
      <div className="rounded-app border border-warning bg-white p-6 text-text shadow-subtle">
        Os relatos desta semana foram encerrados. Entre em contato com a gerência caso seja necessária a reabertura do período.
      </div>
    );
  }

  if (user && !user.area) {
    return <div className="rounded-app border border-danger bg-white p-6 text-danger">Seu usuário precisa estar vinculado a uma área antes de registrar relatos.</div>;
  }

  const error = (field: keyof ActivityFormValues) => form.formState.errors[field]?.message?.toString();

  return (
    <form
      className="space-y-5 rounded-app border border-border bg-white p-5 shadow-subtle"
      onSubmit={form.handleSubmit((values) => {
        if (!cycle || !user?.area) return;
        createMutation.mutate({
          ...values,
          area: user.area as Area,
          managerId: user.id,
          photos: [values.mainPhoto, ...values.additionalPhotos],
          cycleId: cycle.id,
        });
      })}
    >
      {cycle ? (
        <div className="rounded-app border border-border bg-page p-3 text-sm text-muted">
          Período aceito: {new Date(`${cycle.startsAt}T00:00:00`).toLocaleDateString("pt-BR")} a {new Date(`${cycle.endsAt}T00:00:00`).toLocaleDateString("pt-BR")}. A primeira imagem será a foto principal.
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">
          Título da atividade
          <Input className="mt-1" {...form.register("title")} />
          {error("title") ? <span className="text-sm text-danger">{error("title")}</span> : null}
        </label>
        <label className="text-sm font-medium">
          Data
          <Input className="mt-1" type="date" min={cycle?.startsAt} max={cycle?.endsAt} {...form.register("date")} />
          {error("date") ? <span className="text-sm text-danger">{error("date")}</span> : null}
        </label>
        <label className="text-sm font-medium">
          Local
          <Input className="mt-1" {...form.register("location")} />
          {error("location") ? <span className="text-sm text-danger">{error("location")}</span> : null}
        </label>
        <label className="text-sm font-medium">
          Público beneficiado
          <Input className="mt-1" {...form.register("beneficiaries")} />
          {error("beneficiaries") ? <span className="text-sm text-danger">{error("beneficiaries")}</span> : null}
        </label>
        <label className="text-sm font-medium">
          Área
          <Input className="mt-1" value={user?.area ?? ""} disabled />
        </label>
        <label className="text-sm font-medium">
          Gestor responsável
          <Input className="mt-1" value={user?.name ?? ""} disabled />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Descrição resumida
        <Textarea className="mt-1" {...form.register("summary")} />
        {error("summary") ? <span className="text-sm text-danger">{error("summary")}</span> : null}
      </label>
      <label className="block text-sm font-medium">
        Resultado alcançado
        <Textarea className="mt-1" {...form.register("result")} />
        {error("result") ? <span className="text-sm text-danger">{error("result")}</span> : null}
      </label>
      <PhotoUploader
        label="Foto principal"
        files={mainFiles}
        onAdd={(files) => {
          setMainFiles(files.slice(0, 1));
          form.setValue("mainPhoto", files[0], { shouldValidate: true });
        }}
        onRemove={() => {
          setMainFiles([]);
          form.resetField("mainPhoto");
        }}
        error={error("mainPhoto")}
      />
      <PhotoUploader
        label="Fotos adicionais"
        multiple
        files={additionalFiles}
        onAdd={(files) => {
          const next = [...additionalFiles, ...files];
          setAdditionalFiles(next);
          form.setValue("additionalPhotos", next, { shouldValidate: true });
        }}
        onRemove={(index) => {
          const next = additionalFiles.filter((_, itemIndex) => itemIndex !== index);
          setAdditionalFiles(next);
          form.setValue("additionalPhotos", next, { shouldValidate: true });
        }}
        error={error("additionalPhotos")}
      />
      {createMutation.isError ? <p role="alert" className="rounded-app border border-danger p-3 text-sm text-danger">{createMutation.error.message}</p> : null}
      <Button type="submit" disabled={createMutation.isPending || cycles.isLoading || !cycle}>
        <Save size={16} aria-hidden />
        {createMutation.isPending ? "Salvando..." : "Salvar atividade"}
      </Button>
    </form>
  );
}
