"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "../ui/button";

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
      <label className="block text-sm font-medium text-text">
        {label}
        <input
          className="mt-1 block w-full rounded-app border border-border bg-white px-3 py-2 text-sm"
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
              <Image src={URL.createObjectURL(file)} alt={file.name} width={240} height={140} className="h-28 w-full object-cover" unoptimized />
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
