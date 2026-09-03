import Image from "next/image";
import Link from "next/link";
import type { ActivityReport, User } from "@/types";
import { ArrowUpRight, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "../ui/badge";

export function ActivityCard({ report, manager }: { report: ActivityReport; manager?: User }) {
  const mainPhoto = report.photos.find((photo) => photo.isMain) ?? report.photos[0];
  return (
    <Link href={`/relatos/${report.id}`} className="group block overflow-hidden rounded-app border border-border bg-white shadow-subtle transition duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-raised">
      <div className="relative overflow-hidden"><Image src={mainPhoto.url} alt={mainPhoto.alt} width={520} height={280} className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]" unoptimized /><span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-primary opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100"><ArrowUpRight size={17} /></span></div>
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{report.area}</Badge>
          <Badge>{formatDate(report.date)}</Badge>
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-text transition group-hover:text-secondary">{report.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} className="text-secondary" />{report.location}</p>
        <p className="line-clamp-3 text-sm leading-6 text-muted">{report.result}</p>
        <div className="flex items-center gap-2 border-t border-border/70 pt-3"><span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{manager?.name?.charAt(0) ?? "G"}</span><p className="text-xs font-medium text-text">{manager?.name ?? "Gestor responsável"}</p></div>
      </div>
    </Link>
  );
}
