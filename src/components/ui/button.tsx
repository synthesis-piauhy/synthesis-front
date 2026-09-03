import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-app text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white shadow-sm hover:-translate-y-0.5 hover:bg-secondary hover:shadow-md active:translate-y-0",
        secondary: "bg-secondary text-white shadow-sm hover:-translate-y-0.5 hover:bg-primary hover:shadow-md active:translate-y-0",
        outline: "border border-border bg-surface text-text shadow-sm hover:-translate-y-0.5 hover:border-secondary hover:text-secondary",
        ghost: "bg-transparent text-text hover:bg-primary/5 hover:text-primary",
        danger: "bg-danger text-white shadow-sm hover:bg-danger/90",
      },
      size: {
        sm: "min-h-9 px-3 py-1.5 text-xs",
        md: "min-h-10 px-4 py-2",
        lg: "min-h-11 px-5 py-2.5",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & {
  loading?: boolean;
};

export function Button({ className, variant, size, loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle className="animate-spin" size={16} aria-hidden /> : null}
      {children}
    </button>
  );
}
