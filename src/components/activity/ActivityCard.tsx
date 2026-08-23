import Image from "next/image";
import Link from "next/link";
import type { ActivityReport, User } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "../ui/badge";

export function ActivityCard({ report, manager }: { report: ActivityReport; manager?: User }) {
  const mainPhoto = report.photos.find((photo) => photo.isMain) ?? report.photos[0];
  return (
    <Link href={`/relatos/${report.id}`} className="block overflow-hidden rounded-app border border-border bg-white shadow-subtle transition hover:border-secondary">
      <Image src={mainPhoto.url} alt={mainPhoto.alt} width={520} height={280} className="h-44 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{report.area}</Badge>
          <Badge>{formatDate(report.date)}</Badge>
        </div>
        <h3 className="text-lg font-semibold text-text">{report.title}</h3>
        <p className="text-sm text-muted">{report.location}</p>
        <p className="text-sm text-text">{manager?.name ?? "Gestor responsável"}</p>
        <p className="line-clamp-3 text-sm text-muted">{report.result}</p>
      </div>
    </Link>
  );
}
