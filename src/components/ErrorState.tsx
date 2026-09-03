import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

export function ErrorState({ onRetry, message = "Não foi possível carregar as informações." }: { onRetry?: () => void; message?: string }) {
  return (
    <div className="rounded-app border border-danger/25 bg-danger/[0.04] p-5 text-sm text-text shadow-subtle">
      <div className="flex items-center gap-2 font-semibold text-danger">
        <AlertTriangle size={18} aria-hidden />
        {message}
      </div>
      {onRetry ? (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
