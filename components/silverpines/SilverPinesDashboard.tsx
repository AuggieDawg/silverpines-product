"use client"

import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus, SearchCheck, Wrench } from "lucide-react";
import PropertyFilters from "@/components/silverpines/PropertyFilters";
import SummaryKpiStrip from "@/components/silverpines/SummaryKpiStrip";
import UnitRegistryTable from "@/components/silverpines/UnitRegistryTable";
import type {
  ManagedUnitRecord,
  SilverPinesFilters,
} from "@/components/silverpines/types";

const initialFilters: SilverPinesFilters = {
  query: "",
  status: "ALL",
  garageIndicator: "ALL",
  unitKind: "ALL",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function SilverPinesDashboard({
  initialRows,
}: {
  initialRows: ManagedUnitRecord[];
}) {
  const [filters, setFilters] = useState<SilverPinesFilters>(initialFilters);

  const filteredRows = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return initialRows.filter((unit) => {
      if (filters.status !== "ALL" && unit.status !== filters.status) return false;
      if (filters.unitKind !== "ALL" && unit.unitKind !== filters.unitKind) return false;

      if (
        unit.unitKind === "APARTMENT" &&
        filters.garageIndicator !== "ALL" &&
        unit.garageIndicator !== filters.garageIndicator
      ) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        unit.unitCode,
        unit.propertyCode,
        unit.propertyName,
        unit.buildingLabel,
        unit.unitNumber,
        unit.status,
        unit.linkedGarageCode,
        unit.notesSummary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [filters, initialRows]);

  const totalApartments = initialRows.filter((item) => item.unitKind === "APARTMENT").length;
  const totalGarages = initialRows.filter((item) => item.unitKind === "GARAGE").length;
  const openIssues = initialRows.reduce((sum, item) => sum + item.openIssuesCount, 0);
  const ytdCost = initialRows.reduce((sum, item) => sum + item.ytdRepairCost, 0);

  const dueSoonCount = initialRows.reduce((sum, item) => {
    if (!item.nextScheduledMaintenance) return sum;
    return sum + 1;
  }, 0);

  const recentActivity = [...initialRows]
    .filter((unit) => unit.lastRepairAt)
    .sort((a, b) => {
      const aTime = new Date(a.lastRepairAt ?? 0).getTime();
      const bTime = new Date(b.lastRepairAt ?? 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 5);

  const dueSoonUnits = [...initialRows]
    .filter((unit) => unit.nextScheduledMaintenance)
    .sort((a, b) => {
      const aTime = new Date(a.nextScheduledMaintenance ?? 0).getTime();
      const bTime = new Date(b.nextScheduledMaintenance ?? 0).getTime();
      return aTime - bTime;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Property Operations
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              SilverPines
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
              Repairs, maintenance, key tracking, access records, and document control
              for apartments and garages. Unit codes stay canonical as
              <span className="mx-1 rounded bg-white/10 px-2 py-1 text-neutral-200">
                SILVER-A-101
              </span>
              while garage ownership remains a separate field.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white transition hover:bg-black/50">
              <Plus className="h-4 w-4" />
              Add repair
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white transition hover:bg-black/50">
              <SearchCheck className="h-4 w-4" />
              Schedule maintenance
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white transition hover:bg-black/50">
              <FileSpreadsheet className="h-4 w-4" />
              Upload spreadsheet
            </button>
          </div>
        </div>
      </section>

      <SummaryKpiStrip
        totalRecords={initialRows.length}
        totalApartments={totalApartments}
        totalGarages={totalGarages}
        openIssues={openIssues}
        dueSoonCount={dueSoonCount}
        ytdCost={ytdCost}
      />

      <PropertyFilters filters={filters} onChange={setFilters} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <UnitRegistryTable rows={filteredRows} />

        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-neutral-300">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Recent repair activity</h2>
                <p className="text-sm text-neutral-400">
                  Latest visible repair events across SilverPines.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div
                    key={`${item.unitCode}-${item.lastRepairAt}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.unitCode}</p>
                        <p className="mt-1 text-sm text-neutral-400">
                          {item.notesSummary ?? "No summary yet."}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-neutral-300">
                        {formatDate(item.lastRepairAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-500">
                  No repair activity available yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold text-white">Upcoming maintenance</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Earliest scheduled maintenance targets.
            </p>

            <div className="mt-5 space-y-3">
              {dueSoonUnits.length > 0 ? (
                dueSoonUnits.map((unit) => (
                  <div
                    key={`${unit.unitCode}-${unit.nextScheduledMaintenance}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{unit.unitCode}</p>
                        <p className="mt-1 text-sm text-neutral-400">
                          {unit.notesSummary ?? "No summary yet."}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs text-amber-300">
                        {formatDate(unit.nextScheduledMaintenance)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-500">
                  No scheduled maintenance is currently loaded.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}