import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "min-h-11 w-full rounded-app border border-border bg-surface px-3.5 py-2 text-sm text-text shadow-sm transition placeholder:text-muted/65 hover:border-secondary/60 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/10 disabled:cursor-not-allowed disabled:bg-page disabled:text-muted",
          className,
        )}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          "min-h-28 w-full resize-y rounded-app border border-border bg-surface px-3.5 py-3 text-sm leading-6 text-text shadow-sm transition placeholder:text-muted/65 hover:border-secondary/60 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/10 disabled:bg-page",
          className,
        )}
      />
    );
  },
);
