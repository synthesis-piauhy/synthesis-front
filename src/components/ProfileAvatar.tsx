import Image from "next/image";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

export function ProfileAvatar({ user, className }: { user: Pick<User, "name" | "avatarUrl">; className?: string }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent text-primary", className)}>
      {user.avatarUrl ? (
        <Image src={user.avatarUrl} alt={`Foto de perfil de ${user.name}`} fill unoptimized sizes="96px" className="object-cover" />
      ) : <span aria-hidden>{user.name.charAt(0).toUpperCase() || "U"}</span>}
    </span>
  );
}
