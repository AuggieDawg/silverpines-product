"use client";

import { useRouter } from "next/navigation";
import type { ManagedUnitRecord } from "@/components/silverpines/types";

interface UnitRegistryTableProps {
  rows: ManagedUnitRecord[];
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusClasses(status: ManagedUnitRecord["status"]) {
  switch (status) {
    case "Occupied":
      return "bg-emerald-500/15 text-emerald-300";
    case "Vacant":
      return "bg-sky-500/15 text-sky-300";
    case "Turn":
      return "bg-amber-500/15 text-amber-300";
    case "Down":
      return "bg-rose-500/15 text-rose-300";
    case "Notice":
      return "bg-orange-500/15 text-orange-300";
    default:
      return "bg-neutral-500/15 text-neutral-300";
  }
}

export default function UnitRegistryTable({ rows }: UnitRegistryTableProps) {
  const router = useRouter();

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">Asset registry</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Click any apartment or garage record to open full operations history.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-black/20 text-neutral-400">
            <tr>
              <th className="px-5 py-3 font-medium">Unit code</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Garage</th>
              <th className="px-5 py-3 font-medium">Open issues</th>
              <th className="px-5 py-3 font-medium">Last repair</th>
              <th className="px-5 py-3 font-medium">Next maintenance</th>
              <th className="px-5 py-3 font-medium">YTD cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((unit) => (
              <tr
                key={unit.unitCode}
                onClick={() =>
                  router.push(`/silverpines/units/${encodeURIComponent(unit.unitCode)}`)
                }
                className="cursor-pointer border-t border-white/5 text-neutral-200 transition hover:bg-white/[0.04]"
              >
                <td className="px-5 py-4">
                  <div className="font-semibold text-white">{unit.unitCode}</div>
                  <div className="text-xs text-neutral-500">
                    {unit.unitKind === "APARTMENT"
                      ? `${unit.propertyName} • Building ${unit.buildingLabel}`
                      : `${unit.propertyName} • Garage record`}
                  </div>
                </td>
                <td className="px-5 py-4 text-neutral-300">{unit.unitKind}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      unit.status
                    )}`}
                  >
                    {unit.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {unit.unitKind === "GARAGE" ? (
                    <span className="text-neutral-500">—</span>
                  ) : (
                    <div>
                      <div className="font-medium text-white">{unit.garageIndicator}</div>
                      <div className="text-xs text-neutral-500">
                        {unit.linkedGarageCode ?? "No linked garage"}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-5 py-4">{unit.openIssuesCount}</td>
                <td className="px-5 py-4 text-neutral-300">{formatDate(unit.lastRepairAt)}</td>
                <td className="px-5 py-4 text-neutral-300">
                  {formatDate(unit.nextScheduledMaintenance)}
                </td>
                <td className="px-5 py-4 text-neutral-300">
                  {formatCurrency(unit.ytdRepairCost)}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-neutral-500">
                  No units matched the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}