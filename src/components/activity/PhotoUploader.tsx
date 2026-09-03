"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

function FilePreview({ file }: { file: File }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return src ? <Image src={src} alt={file.name} width={240} height={140} className="h-28 w-full object-cover" unoptimized /> : <div className="h-28 animate-pulse bg-neutral-100" />;
}

export function PhotoUploader({
  label,
  files,
  multiple,
  onAdd,
  onRemove,
  error,
}: {
  label: string;
  files: File[];
  multiple?: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text">
        <span>{label}</span>
        <span className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-app border border-dashed border-secondary/40 bg-secondary/[0.035] px-4 text-center transition hover:border-accent hover:bg-accent/[0.05]"><ImagePlus className="mb-2 text-secondary" size={24} /><span className="text-sm font-medium text-secondary">Clique para selecionar {multiple ? "imagens" : "uma imagem"}</span><span className="mt-1 text-xs font-normal text-muted">PNG, JPG ou WebP</span></span>
        <input
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple={multiple}
          onChange={(event) => onAdd(Array.from(event.target.files ?? []))}
        />
      </label>
      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
      {files.length ? (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-app border border-border bg-white">
              <FilePreview file={file} />
              <Button aria-label={`Remover ${file.name}`} type="button" variant="danger" className="absolute right-2 top-2 h-8 w-8 px-0" onClick={() => onRemove(index)}>
                <X size={15} />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
