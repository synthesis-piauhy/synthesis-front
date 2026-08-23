import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-primary text-white hover:bg-secondary",
    secondary: "bg-secondary text-white hover:bg-primary",
    outline: "border border-border bg-white text-text hover:border-secondary",
    ghost: "bg-transparent text-text hover:bg-white",
    danger: "bg-danger text-white hover:bg-[#A83232]",
  };
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-app px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
