import { CheckCircle2, Loader2 } from "lucide-react";

export function SaveStatus({ saving }: { saving: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      {saving ? <Loader2 className="animate-spin" size={16} aria-hidden /> : <CheckCircle2 className="text-success" size={16} aria-hidden />}
      {saving ? "Salvando alterações" : "Alterações salvas"}
    </span>
  );
}
