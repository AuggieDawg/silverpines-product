"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  KeyRound,
  ShieldCheck,
  Wrench,
  ClipboardList,
} from "lucide-react";
import type { ManagedUnitRecord } from "@/components/silverpines/types";

type TabKey = "overview" | "repairs" | "maintenance" | "access" | "files";

interface UnitHistoryPageProps {
  unit: ManagedUnitRecord;
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatCurrency(value?: number) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function UnitHistoryPage({ unit }: UnitHistoryPageProps) {
  const [tab, setTab] = useState<TabKey>("overview");

  const tabs = useMemo(
    () => [
      { key: "overview" as const, label: "Overview", icon: ClipboardList },
      { key: "repairs" as const, label: "Repairs", icon: Wrench },
      { key: "maintenance" as const, label: "Maintenance", icon: ShieldCheck },
      { key: "access" as const, label: "Access", icon: KeyRound },
      { key: "files" as const, label: "Files", icon: FileText },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/silverpines"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-neutral-200 transition hover:bg-black/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to registry
        </Link>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
              {unit.propertyName} • Unit History
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {unit.unitCode}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
              Full operational history for this {unit.unitKind.toLowerCase()} record,
              including repairs, preventive maintenance, access controls, key tracking,
              and uploaded documents.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Status</p>
              <p className="mt-2 font-semibold text-white">{unit.status}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Garage</p>
              <p className="mt-2 font-semibold text-white">
                {unit.unitKind === "GARAGE"
                  ? "Garage record"
                  : `${unit.garageIndicator}${unit.linkedGarageCode ? ` • ${unit.linkedGarageCode}` : ""}`}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Open issues</p>
              <p className="mt-2 font-semibold text-white">{unit.openIssuesCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">YTD cost</p>
              <p className="mt-2 font-semibold text-white">{formatCurrency(unit.ytdRepairCost)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-white/10 text-white"
                    : "bg-black/20 text-neutral-400 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {tab === "overview" && (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-semibold text-white">Unit summary</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard label="Property" value={unit.propertyName} />
              <InfoCard label="Building" value={unit.buildingLabel} />
              <InfoCard label="Unit number" value={unit.unitNumber} />
              <InfoCard label="Asset type" value={unit.unitKind} />
              <InfoCard label="Last repair" value={formatDate(unit.lastRepairAt)} />
              <InfoCard
                label="Last maintenance"
                value={formatDate(unit.lastMaintenanceAt)}
              />
              <InfoCard
                label="Next maintenance"
                value={formatDate(unit.nextScheduledMaintenance)}
              />
              <InfoCard
                label="Linked garage"
                value={unit.linkedGarageCode ?? "No linked garage"}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Operational summary
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                {unit.notesSummary ?? "No summary has been added yet."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-semibold text-white">Notes</h2>
            <div className="mt-5 space-y-3">
              {unit.notes.length > 0 ? (
                unit.notes.map((note, index) => (
                  <div
                    key={`${unit.unitCode}-note-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-300"
                  >
                    {note}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No notes recorded yet.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === "repairs" && (
        <section className="space-y-4">
          {unit.repairs.length > 0 ? (
            unit.repairs.map((repair) => (
              <div
                key={repair.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{repair.title}</h2>
                    <p className="mt-2 text-sm text-neutral-400">
                      {repair.category} • {repair.priority} priority
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-300">
                    {repair.status}
                  </span>
                </div>

                {repair.description && (
                  <p className="mt-4 text-sm leading-6 text-neutral-300">
                    {repair.description}
                  </p>
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <InfoCard label="Opened" value={formatDate(repair.openedAt)} />
                  <InfoCard label="Scheduled" value={formatDate(repair.scheduledFor)} />
                  <InfoCard label="Completed" value={formatDate(repair.completedAt)} />
                  <InfoCard label="Vendor" value={repair.vendorName ?? "—"} />
                  <InfoCard
                    label="Estimated cost"
                    value={formatCurrency(repair.estimatedCost)}
                  />
                  <InfoCard label="Actual cost" value={formatCurrency(repair.actualCost)} />
                </div>
              </div>
            ))
          ) : (
            <EmptyPanel text="No repair history recorded yet." />
          )}
        </section>
      )}

      {tab === "maintenance" && (
        <section className="space-y-4">
          {unit.maintenance.length > 0 ? (
            unit.maintenance.map((event) => (
              <div
                key={event.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{event.title}</h2>
                    <p className="mt-2 text-sm text-neutral-400">{event.category}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-300">
                    {event.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <InfoCard label="Due" value={formatDate(event.dueAt)} />
                  <InfoCard label="Completed" value={formatDate(event.completedAt)} />
                  <InfoCard label="Vendor" value={event.vendorName ?? "—"} />
                  <InfoCard
                    label="Estimated cost"
                    value={formatCurrency(event.estimatedCost)}
                  />
                  <InfoCard label="Actual cost" value={formatCurrency(event.actualCost)} />
                  <InfoCard label="Notes" value={event.notes ?? "—"} />
                </div>
              </div>
            ))
          ) : (
            <EmptyPanel text="No preventive maintenance history recorded yet." />
          )}
        </section>
      )}

      {tab === "access" && (
        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-semibold text-white">Access codes</h2>
            <div className="mt-5 space-y-3">
              {unit.accessCodes.length > 0 ? (
                unit.accessCodes.map((code) => (
                  <div
                    key={code.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{code.label}</p>
                        <p className="mt-1 text-sm text-neutral-400">
                          {code.accessType} • last4 {code.codeLast4 ?? "—"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          code.isActive
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-neutral-500/15 text-neutral-300"
                        }`}
                      >
                        {code.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Effective {formatDate(code.effectiveFrom)}
                      {code.effectiveTo ? ` → ${formatDate(code.effectiveTo)}` : ""}
                    </p>
                    {code.notes && (
                      <p className="mt-3 text-sm text-neutral-300">{code.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No access codes logged yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-semibold text-white">Keys</h2>
            <div className="mt-5 space-y-3">
              {unit.keys.length > 0 ? (
                unit.keys.map((key) => (
                  <div
                    key={key.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{key.keyLabel}</p>
                        <p className="mt-1 text-sm text-neutral-400">
                          {key.keyType}
                          {key.serialNumber ? ` • ${key.serialNumber}` : ""}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          key.isActive
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-neutral-500/15 text-neutral-300"
                        }`}
                      >
                        {key.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <InfoCard label="Assigned to" value={key.assignedTo ?? "—"} />
                      <InfoCard label="Issued" value={formatDate(key.issuedAt)} />
                      <InfoCard label="Returned" value={formatDate(key.returnedAt)} />
                      <InfoCard label="Notes" value={key.notes ?? "—"} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No key records logged yet.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === "files" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">Documents</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Excel spreadsheets, invoices, inspections, and repair attachments.
          </p>

          <div className="mt-5 space-y-3">
            {unit.documents.length > 0 ? (
              unit.documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{document.name}</p>
                      <p className="mt-1 text-sm text-neutral-400">
                        {document.category} • {document.mimeType}
                      </p>
                    </div>
                    <div className="text-right text-xs uppercase tracking-[0.2em] text-neutral-500">
                      <p>{formatDate(document.uploadedAt)}</p>
                      <p className="mt-1">{document.sizeLabel}</p>
                    </div>
                  </div>
                  {document.summary && (
                    <p className="mt-3 text-sm text-neutral-300">{document.summary}</p>
                  )}
                </div>
              ))
            ) : (
              <EmptyPanel text="No documents uploaded yet." />
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-neutral-500">
      {text}
    </div>
  );
}