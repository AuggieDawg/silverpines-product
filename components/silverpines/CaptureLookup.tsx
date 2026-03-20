"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Search } from "lucide-react";

export default function CaptureLookup() {
  const router = useRouter();
  const [assetCode, setAssetCode] = useState("");

  function submit() {
    const normalized = assetCode.trim().toUpperCase();
    if (!normalized) return;
    router.push(`/silverpines/units/${encodeURIComponent(normalized)}/capture`);
  }

  return (
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-neutral-300">
          <Camera className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Field Capture</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Enter an apartment or garage code to open the mobile upload screen.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={assetCode}
          onChange={(event) => setAssetCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="SILVER-A-101 or SILVER-G-03"
          className="flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
        />
        <button
          onClick={submit}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-300/20 bg-sky-400/15 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
        >
          <Search className="h-4 w-4" />
          Open Capture
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-400">
        Best workflow on iPhone: save this page to the home screen, enter the code, take the
        photo, add the caption and room tag, and save it directly to the correct apartment.
      </div>
    </section>
  );
}