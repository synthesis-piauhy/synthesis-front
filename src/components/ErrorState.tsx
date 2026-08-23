import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-app border border-danger bg-white p-6 text-sm text-text">
      <div className="flex items-center gap-2 font-semibold text-danger">
        <AlertTriangle size={18} aria-hidden />
        Não foi possível carregar as informações.
      </div>
      {onRetry ? (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
