"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/providers";
import { api } from "@/services/api";
import { currentCycle } from "@/lib/cycles";
import type { Area } from "@/types";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { Select } from "../ui/select";
import { activitySchema, type ActivityFormValues } from "./activitySchema";
import { PhotoUploader } from "./PhotoUploader";

export function ActivityForm({ closed = false }: { closed?: boolean }) {
  const { user, role } = useAuth();
  const [mainFiles, setMainFiles] = useState<File[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const areas = useQuery({ queryKey: ["areas"], queryFn: api.listAreas });
  const users = useQuery({ queryKey: ["users"], queryFn: api.listUsers });
  const cycles = useQuery({ queryKey: ["cycles"], queryFn: api.listWeeklyCycles });
  const createMutation = useMutation({ mutationFn: api.createActivityReport });
  const cycle = currentCycle(cycles.data);
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    values: {
      title: "",
      date: new Date().toISOString().slice(0, 10),
      location: "",
      summary: "",
      result: "",
      beneficiaries: "",
      area: user?.area ?? "Agro",
      managerId: user?.id ?? "",
      mainPhoto: mainFiles[0] as File,
      additionalPhotos: additionalFiles,
    },
  });

  if (closed || (!cycles.isLoading && (!cycle || cycle.status === "encerrada"))) {
    return (
      <div className="rounded-app border border-warning bg-white p-6 text-text shadow-subtle">
        Os relatos desta semana foram encerrados. Entre em contato com a gerência caso seja necessária a reabertura do período.
      </div>
    );
  }

  const error = (field: keyof ActivityFormValues) => form.formState.errors[field]?.message?.toString();

  return (
    <form
      className="space-y-5 rounded-app border border-border bg-white p-5 shadow-subtle"
      onSubmit={form.handleSubmit((values) => {
        if (!cycle) return;
        createMutation.mutate({
          ...values,
          area: values.area as Area,
          photos: [values.mainPhoto, ...values.additionalPhotos],
          cycleId: cycle.id,
        });
      })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">
          Título da atividade
          <Input className="mt-1" {...form.register("title")} />
          {error("title") ? <span className="text-sm text-danger">{error("title")}</span> : null}
        </label>
        <label className="text-sm font-medium">
          Data
          <Input className="mt-1" type="date" {...form.register("date")} />
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
          <Select className="mt-1" {...form.register("area")} disabled={role === "gestor"}>
            {areas.data?.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </Select>
        </label>
        <label className="text-sm font-medium">
          Gestor responsável
          <Select className="mt-1" {...form.register("managerId")} disabled={role === "gestor"}>
            {users.data
              ?.filter((item) => item.role === "gestor")
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </Select>
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
      />
      {createMutation.isSuccess ? <p className="rounded-app border border-success p-3 text-sm text-success">Relato salvo com confirmação.</p> : null}
      {createMutation.isError ? <p className="rounded-app border border-danger p-3 text-sm text-danger">Não foi possível salvar. Tente novamente.</p> : null}
      <Button type="submit" disabled={createMutation.isPending || cycles.isLoading || !cycle}>
        <Save size={16} aria-hidden />
        {createMutation.isPending ? "Salvando" : "Salvar atividade"}
      </Button>
    </form>
  );
}
