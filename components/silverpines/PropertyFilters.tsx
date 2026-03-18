"use client";

import type { SilverPinesFilters } from "@/components/silverpines/types";

interface PropertyFiltersProps {
  filters: SilverPinesFilters;
  onChange: (next: SilverPinesFilters) => void;
}

export default function PropertyFilters({
  filters,
  onChange,
}: PropertyFiltersProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="grid gap-4 lg:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Search
          </span>
          <input
            value={filters.query}
            onChange={(event) =>
              onChange({ ...filters, query: event.target.value })
            }
            placeholder="Unit, garage, building, notes..."
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-neutral-500 focus:border-white/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Status
          </span>
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as SilverPinesFilters["status"],
              })
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
          >
            <option value="ALL">All statuses</option>
            <option value="Occupied">Occupied</option>
            <option value="Vacant">Vacant</option>
            <option value="Notice">Notice</option>
            <option value="Turn">Turn</option>
            <option value="Down">Down</option>
            <option value="Model">Model</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Garage flag
          </span>
          <select
            value={filters.garageIndicator}
            onChange={(event) =>
              onChange({
                ...filters,
                garageIndicator:
                  event.target.value as SilverPinesFilters["garageIndicator"],
              })
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
          >
            <option value="ALL">All</option>
            <option value="Y">Y: has garage</option>
            <option value="N">N: no garage</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Asset type
          </span>
          <select
            value={filters.unitKind}
            onChange={(event) =>
              onChange({
                ...filters,
                unitKind: event.target.value as SilverPinesFilters["unitKind"],
              })
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
          >
            <option value="ALL">Apartments + garages</option>
            <option value="APARTMENT">Apartments</option>
            <option value="GARAGE">Garages</option>
          </select>
        </label>
      </div>
    </section>
  );
}