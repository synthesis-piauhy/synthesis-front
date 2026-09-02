"use client";

import { useParams } from "next/navigation";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { adminRoutes } from "@/services/administration";

export default function Page() {
  const { resource } = useParams<{ resource: string }>();
  const key = Object.entries(adminRoutes).find(([, route]) => route === resource)?.[0] ?? "unknown";
  return <AdminResourcePage key={key} resourceKey={key} />;
}
