import Image from "next/image";
import type { ManagedPhotoRecord } from "@/components/silverpines/types";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatPhotoSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PhotoGridCard({ photo }: { photo: ManagedPhotoRecord }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black/30">
        <Image
          src={photo.storageKey}
          alt={photo.caption ?? photo.originalFileName ?? "SilverPines photo"}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-white">
          {photo.caption ?? photo.originalFileName ?? "Untitled photo"}
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
          {photo.category} • {photo.roomTag}
        </p>
        <p className="text-xs text-neutral-400">
          Uploaded {formatDate(photo.uploadedAt)}
          {photo.uploadedByName ? ` • ${photo.uploadedByName}` : ""}
        </p>
        <p className="text-xs text-neutral-500">
          {formatPhotoSize(photo.fileSizeBytes)}
          {photo.takenAt ? ` • Taken ${formatDate(photo.takenAt)}` : ""}
        </p>
        {photo.inspectionSetCode && (
          <p className="text-xs text-sky-300">
            Inspection set: {photo.inspectionSetCode}
          </p>
        )}
      </div>
    </div>
  );
}