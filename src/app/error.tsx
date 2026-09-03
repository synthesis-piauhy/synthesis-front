"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="w-full max-w-lg">
        <ErrorState message="Não foi possível abrir esta página. Seus dados não foram alterados." onRetry={reset} />
      </div>
    </main>
  );
}
