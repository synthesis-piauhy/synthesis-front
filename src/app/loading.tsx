import { LoadingState } from "@/components/LoadingState";

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-[1440px] bg-page px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 h-8 w-64 animate-pulse rounded-app-sm bg-neutral-200" />
      <LoadingState label="Carregando página" />
    </main>
  );
}
