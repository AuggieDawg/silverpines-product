import { Camera } from "lucide-react";

import { repairPhotos } from "@/lib/repair/dashboard";

export default function ClientPhotosPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
          Visual documentation
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Before, during, and after repair photos
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          This page gives you the documentation habit you already know is
          valuable. Once wired to storage later, these cards can become uploaded
          image records instead of placeholders.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {repairPhotos.map((photo) => (
          <article
            key={photo.id}
            className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
          >
            <div className="flex h-56 items-center justify-center bg-[linear-gradient(135deg,_rgba(239,68,68,0.16),_rgba(255,255,255,0.02)_45%,_rgba(59,130,246,0.12))]">
              <Camera className="h-10 w-10 text-zinc-200/80" />
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-white">{photo.ticketTitle}</p>
                <span className={photoKindPill(photo.kind)}>{photo.kind}</span>
              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {photo.caption}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function photoKindPill(kind: string) {
  switch (kind) {
    case "BEFORE":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    case "AFTER":
      return "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200";
    default:
      return "inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200";
  }
}