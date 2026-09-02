import { api } from "@/services/api";

export async function viewReportPdf(versionId: string) {
  const url = await api.getPdfUrl(versionId);
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function downloadReportPdf(versionId: string, filename: string) {
  const url = await api.getPdfUrl(versionId);
  const response = await fetch(url);
  if (!response.ok) throw new Error("Não foi possível baixar o PDF.");
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  link.click();
  URL.revokeObjectURL(objectUrl);
}
