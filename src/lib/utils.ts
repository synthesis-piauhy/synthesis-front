import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  if (year && month && day) return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

export function reportStatusLabel(status: string) {
  const labels: Record<string, string> = {
    nao_iniciado: "não iniciado",
    em_selecao: "em seleção",
    rascunho: "rascunho",
    em_edicao: "em edição",
    pdf_gerado: "PDF gerado",
  };
  return labels[status] ?? status;
}
