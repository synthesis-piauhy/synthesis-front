import Image from "next/image";
import type { ActivityReport, User } from "@/types";
import { formatDate } from "@/lib/utils";

export function EditorialSelectionCard({
  report,
  manager,
  checked,
  disabled = false,
  onToggle,
}: {
  report: ActivityReport;
  manager?: User;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const main = report.photos.find((photo) => photo.isMain) ?? report.photos[0];
  return (
    <label className={`grid gap-3 rounded-app border border-border bg-surface p-3 shadow-subtle sm:grid-cols-[120px_1fr] ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer transition hover:border-secondary"}`}>
      <Image src={main.url} alt={main.alt} width={180} height={120} className="h-40 w-full rounded-app object-cover sm:h-28" unoptimized />
      <span className="space-y-2">
        <span className="flex items-start justify-between gap-3">
          <span className="font-semibold">{report.title}</span>
          <input className="size-5 shrink-0 accent-primary" type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} aria-label={`Selecionar ${report.title}`} />
        </span>
        <span className="block text-sm text-muted">
          {formatDate(report.date)} · {report.location}
        </span>
        <span className="block text-sm text-muted">{manager?.name}</span>
        <span className="block text-sm text-text">{report.result}</span>
      </span>
    </label>
  );
}
