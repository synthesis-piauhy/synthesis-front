import { z } from "zod";
import { ACTIVITY_LIMITS, ACTIVITY_TEMPLATES } from "./activityTemplates";

const isFile = (value: unknown): value is File => typeof File !== "undefined" && value instanceof File;
const fileSchema = z.custom<File>(isFile, "Informe uma imagem válida.");
const validImage = (file: File) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024;

export const activitySchema = z.object({
  templateKey: z.enum(ACTIVITY_TEMPLATES.map((template) => template.key) as ["acao_evento", "entrega_marco", "atendimento_articulacao"]),
  title: z.string().min(3, "Informe o título da atividade.").max(ACTIVITY_LIMITS.title, `Use no máximo ${ACTIVITY_LIMITS.title} caracteres.`),
  date: z.string().min(1, "Informe a data."),
  location: z.string().min(2, "Informe o local.").max(200, "Use no máximo 200 caracteres."),
  summary: z.string().min(10, "Descreva a atividade com pelo menos 10 caracteres.").max(ACTIVITY_LIMITS.summary, `Use no máximo ${ACTIVITY_LIMITS.summary} caracteres.`),
  result: z.string().min(10, "Informe o resultado alcançado.").max(ACTIVITY_LIMITS.result, `Use no máximo ${ACTIVITY_LIMITS.result} caracteres.`),
  beneficiaries: z.string().min(2, "Informe o público beneficiado.").max(ACTIVITY_LIMITS.beneficiaries, `Use no máximo ${ACTIVITY_LIMITS.beneficiaries} caracteres.`),
  evidence: z.string().max(ACTIVITY_LIMITS.evidence, `Use no máximo ${ACTIVITY_LIMITS.evidence} caracteres.`),
  nextStep: z.string().max(ACTIVITY_LIMITS.nextStep, `Use no máximo ${ACTIVITY_LIMITS.nextStep} caracteres.`),
  internalNotes: z.string().max(ACTIVITY_LIMITS.internalNotes, `Use no máximo ${ACTIVITY_LIMITS.internalNotes} caracteres.`),
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
  evidence: true,
  nextStep: true,
  internalNotes: true,
});

export type ActivityEditValues = z.infer<typeof activityEditSchema>;
