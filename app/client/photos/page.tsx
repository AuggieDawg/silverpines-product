import { Camera } from "lucide-react";

import { getRepairWorkspaceForCurrentUser } from "@/lib/repair/queries";

export default async function RepairPhotosPage() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const photos = workspace.photos;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Repair evidence
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Photos and documentation
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              This page is ready for real repair photos. The next production
              upgrade should wire file upload storage, image previews, and
              before/during/after tagging.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <Camera className="h-5 w-5 text-zinc-300" />
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="font-medium text-white">No photos uploaded yet.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Good. This means we removed fake gallery data. For production, add
              storage-backed upload to `RepairPhoto` so every repair has a clean
              evidence trail.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo) => (
              <article
                key={photo.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex h-40 items-center justify-center rounded-3xl border border-white/10 bg-[linear-gradient(135deg,_rgba(239,68,68,0.16),_rgba(255,255,255,0.02)_45%,_rgba(59,130,246,0.12))]">
                  <Camera className="h-8 w-8 text-zinc-200/80" />
                </div>

                <div className="mt-4">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                    {photo.category}
                  </span>
                  <h3 className="mt-3 font-semibold text-white">
                    {photo.ticketTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {photo.caption ?? "No caption provided."}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Uploaded {photo.uploadedLabel}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
