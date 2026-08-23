"use client";

import Cropper from "react-easy-crop";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

export function CropImageDialog({ open, image, onClose }: { open: boolean; image?: string; onClose: () => void }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)} title="Recorte de imagem">
      <div className="relative h-80 rounded-app border border-border bg-page">
        {image ? <Cropper image={image} crop={crop} zoom={zoom} aspect={4 / 3} onCropChange={setCrop} onZoomChange={setZoom} /> : null}
      </div>
      <label className="mt-4 block text-sm font-medium">
        Aproximação
        <input className="mt-2 w-full" type="range" min={1} max={3} step={0.1} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
      </label>
      <div className="mt-5 flex justify-end">
        <Button onClick={onClose}>Aplicar recorte</Button>
      </div>
    </Dialog>
  );
}
