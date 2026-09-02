import { z } from "zod";

const isFile = (value: unknown): value is File => typeof File !== "undefined" && value instanceof File;
const fileSchema = z.custom<File>(isFile, "Informe uma imagem válida.");
const validImage = (file: File) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024;

export const activitySchema = z.object({
  title: z.string().min(3, "Informe o título da atividade."),
  date: z.string().min(1, "Informe a data."),
  location: z.string().min(2, "Informe o local."),
  summary: z.string().min(10, "Descreva a atividade com pelo menos 10 caracteres."),
  result: z.string().min(10, "Informe o resultado alcançado."),
  beneficiaries: z.string().min(2, "Informe o público beneficiado."),
  area: z.string().min(1, "Informe a área."),
  managerId: z.string().min(1, "Informe o gestor responsável."),
  mainPhoto: fileSchema.refine(validImage, "Use imagem PNG, JPG ou WEBP com até 5 MB."),
  additionalPhotos: z.array(fileSchema.refine(validImage, "Use imagem PNG, JPG ou WEBP com até 5 MB.")),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;

export const activityEditSchema = activitySchema.pick({
  title: true,
  date: true,
  location: true,
  summary: true,
  result: true,
  beneficiaries: true,
});

export type ActivityEditValues = z.infer<typeof activityEditSchema>;
