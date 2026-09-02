import Image from "next/image";
import type { ActivityPhoto } from "@/types";

export function PhotoGallery({ photos }: { photos: ActivityPhoto[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo) => (
        <Image key={photo.id} src={photo.url} alt={photo.alt} width={520} height={300} className="h-44 w-full rounded-app border border-border object-cover" unoptimized />
      ))}
    </div>
  );
}
