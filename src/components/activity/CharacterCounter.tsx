import { cn } from "@/lib/utils";

export function CharacterCounter({ value = "", limit }: { value?: string; limit: number }) {
  const length = value.length;
  const nearLimit = length >= limit * 0.8;
  const exceeded = length > limit;

  return (
    <span
      aria-live="polite"
      className={cn(
        "mt-1 block text-right text-xs text-muted",
        nearLimit && "text-warning",
        exceeded && "font-semibold text-danger",
      )}
    >
      {length}/{limit} caracteres
    </span>
  );
}
