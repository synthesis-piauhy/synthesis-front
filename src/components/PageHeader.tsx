import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-[28px]">{title}</h2>
        {description ? <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">{actions}</div> : null}
    </div>
  );
}
