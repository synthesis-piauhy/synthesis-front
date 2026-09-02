import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function SaveStatus({ saving, error }: { saving: boolean; error?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      {saving ? <Loader2 className="animate-spin" size={16} aria-hidden /> : error ? <AlertCircle className="text-danger" size={16} aria-hidden /> : <CheckCircle2 className="text-success" size={16} aria-hidden />}
      {saving ? "Salvando alterações" : error ? "Falha ao salvar" : "Alterações salvas"}
    </span>
  );
}
