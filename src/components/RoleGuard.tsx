"use client";

import type { ReactNode } from "react";
import type { UserRole } from "@/types";
import { useAuth } from "@/app/providers";

export function RoleGuard({ allowed, children, fallback = null }: { allowed: UserRole[]; children: ReactNode; fallback?: ReactNode }) {
  const { role } = useAuth();
  return allowed.includes(role) ? <>{children}</> : <>{fallback}</>;
}
