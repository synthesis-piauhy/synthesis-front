import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "min-h-10 w-full rounded-app border border-border bg-white px-3 py-2 text-sm",
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
          "min-h-24 w-full rounded-app border border-border bg-white px-3 py-2 text-sm",
          className,
        )}
      />
    );
  },
);
