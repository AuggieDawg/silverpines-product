"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save } from "lucide-react";
import type { InspectionSetRecord, UnitKind } from "@/components/silverpines/types";

const PHOTO_CATEGORIES = [
  "General",
  "Inspection",
  "Before",
  "After",
  "Damage",
  "Turnover",
  "Appliance",
  "Exterior",
  "Safety",
  "Receipt",
  "Other",
] as const;

const ROOM_TAGS = [
  "Unknown",
  "Exterior",
  "Entry",
  "LivingRoom",
  "Kitchen",
  "DiningRoom",
  "Hallway",
  "Bathroom",
  "Bedroom",
  "Laundry",
  "Utility",
  "Garage",
  "Balcony",
  "Patio",
  "Closet",
  "Mechanical",
  "Other",
] as const;

type Props = {
  assetCode: string;
  propertyName: string;
  unitKind: UnitKind;
  inspectionSets: InspectionSetRecord[];
};

async function readResponseSafely(response: Response) {
  const text = await response.text();

  try {
    return {
      ok: response.ok,
      status: response.status,
      data: JSON.parse(text),
      rawText: text,
    };
  } catch {
    return {
      ok: response.ok,
      status: response.status,
      data: null,
      rawText: text,
    };
  }
}

export default function MobilePhotoCaptureForm({
  assetCode,
  propertyName,
  unitKind,
  inspectionSets,
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createNewInspectionSet, setCreateNewInspectionSet] = useState(false);

  const sortedInspectionSets = useMemo(
    () =>
      [...inspectionSets].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      ),
    [inspectionSets]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const rawData = new FormData(form);

      const file = rawData.get("file");
      if (!(file instanceof File) || file.size === 0) {
        setMessage("Choose a photo before saving.");
        setIsSubmitting(false);
        return;
      }

      let inspectionSetId =
        typeof rawData.get("inspectionSetId") === "string"
          ? String(rawData.get("inspectionSetId")).trim()
          : "";

      const newInspectionTitle =
        typeof rawData.get("newInspectionTitle") === "string"
          ? String(rawData.get("newInspectionTitle")).trim()
          : "";

      const newInspectionDescription =
        typeof rawData.get("newInspectionDescription") === "string"
          ? String(rawData.get("newInspectionDescription")).trim()
          : "";

      if (createNewInspectionSet && newInspectionTitle) {
        const createInspectionResponse = await fetch("/api/silverpines/inspection-sets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assetCode,
            title: newInspectionTitle,
            description: newInspectionDescription || undefined,
          }),
        });

        const inspectionPayload = await readResponseSafely(createInspectionResponse);

        if (!inspectionPayload.ok) {
          throw new Error(
            inspectionPayload.data?.error ||
              inspectionPayload.rawText ||
              "Failed to create inspection set"
          );
        }

        inspectionSetId = inspectionPayload.data.inspectionSet.id;
      }

      const uploadData = new FormData();
      uploadData.set("assetCode", assetCode);
      uploadData.set("file", file);
      uploadData.set("caption", String(rawData.get("caption") ?? ""));
      uploadData.set("category", String(rawData.get("category") ?? "General"));
      uploadData.set("roomTag", String(rawData.get("roomTag") ?? "Unknown"));

      if (inspectionSetId) {
        uploadData.set("inspectionSetId", inspectionSetId);
      }

      const uploadResponse = await fetch("/api/silverpines/photos", {
        method: "POST",
        body: uploadData,
      });

      const uploadPayload = await readResponseSafely(uploadResponse);

      if (!uploadPayload.ok) {
        throw new Error(
          uploadPayload.data?.error ||
            uploadPayload.rawText ||
            "Failed to upload photo"
        );
      }

      setMessage("Photo saved successfully.");
      form.reset();
      setCreateNewInspectionSet(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
            {propertyName} • Mobile Capture
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {assetCode}
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Fast photo capture for this {unitKind.toLowerCase()} record.
          </p>
        </div>

        <Link
          href={`/silverpines/units/${encodeURIComponent(assetCode)}`}
          className="inline-flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/40"
        >
          Back to Asset
        </Link>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Photo
            </span>
            <input
              name="file"
              type="file"
              accept="image/*"
              capture="environment"
              className="block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-300 file:mr-4 file:rounded-xl file:border-0 file:bg-sky-400/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-100"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Category
            </span>
            <select
              name="category"
              defaultValue="Inspection"
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            >
              {PHOTO_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Room Tag
            </span>
            <select
              name="roomTag"
              defaultValue={unitKind === "GARAGE" ? "Garage" : "Unknown"}
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            >
              {ROOM_TAGS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Caption
          </span>
          <textarea
            name="caption"
            rows={3}
            placeholder="Example: Kitchen under-sink leak area after cleanup."
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
          />
        </label>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Inspection Set</p>
              <p className="mt-1 text-sm text-neutral-400">
                Attach the photo to an existing inspection set or create a new one.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={createNewInspectionSet}
                onChange={(event) => setCreateNewInspectionSet(event.target.checked)}
              />
              Create new
            </label>
          </div>

          {!createNewInspectionSet ? (
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Existing Set
              </span>
              <select
                name="inspectionSetId"
                defaultValue=""
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              >
                <option value="">None</option>
                {sortedInspectionSets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.code} — {set.title}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                  New Inspection Title
                </span>
                <input
                  name="newInspectionTitle"
                  placeholder="Example: A101 kitchen inspection"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                  Description
                </span>
                <textarea
                  name="newInspectionDescription"
                  rows={2}
                  placeholder="Optional inspection notes"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
                />
              </label>
            </div>
          )}
        </div>

        {message && (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-300">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-300/20 bg-sky-400/15 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Photo
            </>
          )}
        </button>
      </form>
    </section>
  );
}