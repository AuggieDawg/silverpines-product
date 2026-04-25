import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  FileText,
  MapPinned,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { PageContextBadge } from "@/components/navigation/PageContextBadge";
import {
  adjustFieldInventoryItemAction,
  createFieldDailyReportAction,
  createFieldInventoryItemAction,
  createFieldJobAction,
  createFieldRigAction,
  createFieldWellAction,
  updateFieldJobStatusAction,
  updateFieldRigStatusAction,
} from "@/lib/stone/actions";
import {
  formatDate,
  formatDateTime,
  getStoneWorkspaceForCurrentUser,
  statusLabel,
} from "@/lib/stone/queries";

export const dynamic = "force-dynamic";

const rigStatuses = [
  "Available",
  "Moving",
  "RiggingUp",
  "Working",
  "WaitingOnParts",
  "WaitingOnOperator",
  "DownForRepair",
  "Standby",
  "RiggingDown",
  "Complete",
];

const jobStatuses = [
  "Planned",
  "Active",
  "WaitingOnParts",
  "WaitingOnOperator",
  "DownForRepair",
  "Completed",
  "Cancelled",
];

const priorities = ["Low", "Medium", "High", "Critical"];

export default async function StoneWellServicePage() {
  const workspace = await getStoneWorkspaceForCurrentUser();
  const { metrics, rigs, wells, jobs, dailyReports, inventoryItems } = workspace;

  const inventoryAtRisk = inventoryItems.filter((item) => {
    const reorderPoint = item.reorderPoint ?? 0;
    return reorderPoint > 0 && item.quantityOnHand <= reorderPoint;
  });

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_34%),linear-gradient(180deg,_#030303_0%,_#111111_50%,_#050505_100%)] text-zinc-100">
      <div className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6">
        <section className="overflow-hidden rounded-[34px] border border-orange-500/20 bg-white/[0.035] shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="relative border-b border-white/10 p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
              <div>
                <PageContextBadge
                  kind="COMPANY"
                  label="Company Page · Field Operations"
                />

                <div className="mt-6 flex flex-col gap-5">
                  <img
                    src="/brand/stone-well-service-logo.png"
                    alt="Stone Well Service"
                    className="h-auto w-full max-w-[440px] object-contain drop-shadow-[0_0_34px_rgba(249,115,22,0.22)]"
                  />

                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-orange-200/70">
                      Stone Well Service Command Center
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                      Rig, well, job, inventory, and daily report control.
                    </h1>
                  </div>
                </div>

                <p className="mt-6 max-w-4xl text-sm leading-7 text-zinc-300 sm:text-base">
                  This page is now wired as a field operations module. Create
                  rigs, well files, active jobs, daily reports, and inventory
                  records. The Intelligence Center can analyze this once enough
                  operational history exists.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#rig-board"
                    className="rounded-full border border-orange-500/30 bg-orange-500/15 px-5 py-3 text-sm font-medium text-orange-100 transition hover:bg-orange-500/25"
                  >
                    Rig board
                  </a>

                  <a
                    href="#daily-report"
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Daily report
                  </a>

                  <Link
                    href="/owner/tools/data-profiler"
                    className="rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Analyze later
                  </Link>
                </div>
              </div>

              <div className="rounded-[30px] border border-orange-500/20 bg-black/45 p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  Operational snapshot
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Metric label="Rigs" value={metrics.rigCount.toString()} />
                  <Metric label="Active jobs" value={metrics.activeJobs.toString()} />
                  <Metric label="Wells" value={metrics.wellCount.toString()} />
                  <Metric label="Reports today" value={metrics.reportsToday.toString()} />
                  <Metric label="Rigs down" value={metrics.rigDownCount.toString()} />
                  <Metric label="Inventory risk" value={metrics.inventoryAtRisk.toString()} />
                </div>

                <div className="mt-5 rounded-3xl border border-orange-500/20 bg-orange-500/[0.08] p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                    <p className="text-sm leading-6 text-orange-50/90">
                      The rule: if it happened on the rig, it should be captured
                      in a daily report. Field memory becomes business
                      intelligence only when the data exists.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1.1fr_0.9fr]">
            <section id="rig-board" className="rounded-[30px] border border-white/10 bg-black/35 p-5">
              <Header
                eyebrow="Rig board"
                title="Three-rig operating view"
                icon={<Truck className="h-6 w-6 text-orange-300" />}
              />

              {rigs.length === 0 ? (
                <EmptyState
                  title="No rigs yet"
                  body="Create Rig 1, Rig 2, and Rig 3 below. After that, this board becomes the operating view."
                />
              ) : (
                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  {rigs.map((rig) => (
                    <article
                      key={rig.id}
                      className="rounded-3xl border border-white/10 bg-white/[0.035] p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-white">{rig.name}</h3>
                        <span className={statusPill(rig.status)}>
                          {statusLabel(rig.status)}
                        </span>
                      </div>

                      <div className="mt-5 space-y-3 text-sm">
                        <FieldLine label="Rig #" value={rig.rigNumber ?? "—"} />
                        <FieldLine label="Operator" value={rig.currentOperator ?? "—"} />
                        <FieldLine label="Well" value={rig.currentWell?.wellName ?? "—"} />
                        <FieldLine label="Location" value={rig.locationLabel ?? "—"} />
                      </div>

                      <p className="mt-5 text-sm leading-6 text-zinc-400">
                        {rig.notes ?? "No rig notes yet."}
                      </p>

                      <form action={updateFieldRigStatusAction} className="mt-4 flex gap-2">
                        <input type="hidden" name="rigId" value={rig.id} />
                        <select
                          name="status"
                          defaultValue={rig.status}
                          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                        >
                          {rigStatuses.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel(status)}
                            </option>
                          ))}
                        </select>
                        <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
                          Save
                        </button>
                      </form>
                    </article>
                  ))}
                </div>
              )}

              <form action={createFieldRigAction} className="mt-6 rounded-3xl border border-orange-500/20 bg-orange-500/[0.05] p-5">
                <FormTitle icon={<Plus className="h-4 w-4" />} title="Add rig" />
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Rig name" name="name" placeholder="Rig 1" required />
                  <Field label="Rig number" name="rigNumber" />
                  <Select label="Status" name="status" values={rigStatuses} defaultValue="Standby" />
                  <Field label="Current operator" name="currentOperator" placeholder="KODA Resources" />
                  <Field label="Location" name="locationLabel" />
                  <Field label="Notes" name="notes" />
                </div>
                <Submit label="Create rig" />
              </form>
            </section>

            <section className="rounded-[30px] border border-white/10 bg-black/35 p-5">
              <Header
                eyebrow="Well files"
                title="Operator and well memory"
                icon={<MapPinned className="h-6 w-6 text-orange-300" />}
              />

              <form action={createFieldWellAction} className="mt-5 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Operator" name="operatorName" placeholder="KODA Resources" required />
                  <Field label="Well name" name="wellName" required />
                  <Field label="Well number" name="wellNumber" />
                  <Field label="API number" name="apiNumber" />
                  <Field label="Lease" name="leaseName" />
                  <Field label="Location" name="locationLabel" />
                  <Field label="County" name="county" />
                  <Field label="State" name="state" defaultValue="UT" />
                </div>

                <TextArea label="Directions" name="directions" />
                <TextArea label="Known hazards / conditions" name="hazards" />
                <TextArea label="Well notes" name="notes" />

                <Submit label="Create well file" />
              </form>

              <div className="mt-5 grid gap-3">
                {wells.slice(0, 5).map((well) => (
                  <article key={well.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-medium text-white">{well.wellName}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {well.operatorName} · {well.locationLabel ?? "No location"}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {well._count.jobs} jobs · {well._count.dailyReports} reports
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 border-t border-white/10 p-6 sm:p-8 xl:grid-cols-[1fr_1fr]">
            <section className="rounded-[30px] border border-white/10 bg-black/35 p-5">
              <Header
                eyebrow="Job control"
                title="Active field jobs"
                icon={<ClipboardList className="h-6 w-6 text-orange-300" />}
              />

              <form action={createFieldJobAction} className="mt-5 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectFromRecords label="Rig" name="rigId" records={rigs.map((rig) => ({ id: rig.id, label: rig.name }))} />
                  <SelectFromRecords label="Well" name="wellId" records={wells.map((well) => ({ id: well.id, label: `${well.operatorName} · ${well.wellName}` }))} />
                  <Field label="Operator" name="operatorName" placeholder="KODA Resources" required />
                  <Field label="Job type" name="jobType" placeholder="Maintenance, workover, rig move, inspection" required />
                  <Select label="Status" name="status" values={jobStatuses} defaultValue="Planned" />
                  <Select label="Priority" name="priority" values={priorities} defaultValue="Medium" />
                </div>

                <TextArea label="Objective" name="objective" />
                <TextArea label="Current summary" name="currentSummary" />
                <TextArea label="Blocker" name="blocker" />

                <Submit label="Create job" />
              </form>

              <div className="mt-5 grid gap-4">
                {jobs.length === 0 ? (
                  <EmptyState
                    title="No jobs yet"
                    body="Create a job tied to a rig and well. This becomes the center of daily reporting."
                  />
                ) : (
                  jobs.map((job) => (
                    <article key={job.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={statusPill(job.status)}>
                          {statusLabel(job.status)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                          {job.jobNumber}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-semibold text-white">
                        {job.jobType} · {job.operatorName}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {job.objective ?? "No objective entered."}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                        <FieldLine label="Rig" value={job.rig?.name ?? "—"} />
                        <FieldLine label="Well" value={job.well?.wellName ?? "—"} />
                        <FieldLine label="Updated" value={formatDateTime(job.updatedAt)} />
                      </div>

                      <form action={updateFieldJobStatusAction} className="mt-4 flex gap-2">
                        <input type="hidden" name="jobId" value={job.id} />
                        <select
                          name="status"
                          defaultValue={job.status}
                          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                        >
                          {jobStatuses.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel(status)}
                            </option>
                          ))}
                        </select>
                        <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
                          Save
                        </button>
                      </form>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section id="daily-report" className="rounded-[30px] border border-white/10 bg-black/35 p-5">
              <Header
                eyebrow="Daily report"
                title="End-of-shift field memory"
                icon={<FileText className="h-6 w-6 text-orange-300" />}
              />

              <form action={createFieldDailyReportAction} className="mt-5 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Report date" name="reportDate" type="date" />
                  <SelectFromRecords label="Rig" name="rigId" records={rigs.map((rig) => ({ id: rig.id, label: rig.name }))} />
                  <SelectFromRecords label="Well" name="wellId" records={wells.map((well) => ({ id: well.id, label: `${well.operatorName} · ${well.wellName}` }))} />
                  <SelectFromRecords label="Job" name="jobId" records={jobs.map((job) => ({ id: job.id, label: `${job.jobNumber} · ${job.jobType}` }))} />
                </div>

                <TextArea label="Work performed" name="workPerformed" required={false} />
                <TextArea label="Current status" name="currentStatus" />
                <TextArea label="Downtime / reason" name="downtime" />
                <TextArea label="Safety observations" name="safetyNotes" />
                <TextArea label="Parts used" name="partsUsed" />
                <TextArea label="Parts needed" name="partsNeeded" />
                <TextArea label="Tomorrow’s plan" name="tomorrowPlan" />

                <Submit label="Save daily report" />
              </form>

              <div className="mt-5 grid gap-4">
                {dailyReports.length === 0 ? (
                  <EmptyState
                    title="No daily reports yet"
                    body="This is the most important habit. Daily reports create the history that later powers intelligence."
                  />
                ) : (
                  dailyReports.slice(0, 5).map((report) => (
                    <article key={report.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        {formatDate(report.reportDate)}
                      </p>
                      <h3 className="mt-2 font-semibold text-white">
                        {report.rig?.name ?? "No rig"} · {report.well?.wellName ?? "No well"}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {report.workPerformed ?? "No work summary entered."}
                      </p>
                      {report.safetyNotes ? (
                        <p className="mt-3 rounded-2xl border border-orange-500/20 bg-orange-500/[0.06] p-3 text-sm leading-6 text-orange-100">
                          Safety: {report.safetyNotes}
                        </p>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-6 border-t border-white/10 p-6 sm:p-8 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[30px] border border-white/10 bg-black/35 p-5">
              <Header
                eyebrow="Inventory"
                title="Rig parts and consumables"
                icon={<Boxes className="h-6 w-6 text-orange-300" />}
              />

              <form action={createFieldInventoryItemAction} className="mt-5 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Item name" name="name" required />
                  <Field label="Category" name="category" />
                  <SelectFromRecords label="Assigned rig" name="rigId" records={rigs.map((rig) => ({ id: rig.id, label: rig.name }))} />
                  <Field label="Quantity" name="quantityOnHand" type="number" defaultValue="0" />
                  <Field label="Reorder point" name="reorderPoint" type="number" />
                  <Field label="Unit" name="unit" placeholder="ea, box, gal, set" />
                  <Field label="Supplier" name="supplier" />
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                  <input type="checkbox" name="isCritical" value="true" />
                  Critical item
                </label>

                <TextArea label="Notes" name="notes" />
                <Submit label="Add inventory item" />
              </form>
            </section>

            <section className="rounded-[30px] border border-white/10 bg-black/35 p-5">
              <Header
                eyebrow="Inventory pressure"
                title="Items needing attention"
                icon={<ShieldCheck className="h-6 w-6 text-orange-300" />}
              />

              {inventoryItems.length === 0 ? (
                <EmptyState
                  title="No inventory yet"
                  body="Start with the critical items that can stop a job or keep a rig waiting."
                />
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {inventoryItems.map((item) => {
                    const reorderPoint = item.reorderPoint ?? 0;
                    const isLow = reorderPoint > 0 && item.quantityOnHand <= reorderPoint;

                    return (
                      <article
                        key={item.id}
                        className={[
                          "rounded-3xl border p-5",
                          isLow
                            ? "border-orange-500/25 bg-orange-500/[0.07]"
                            : "border-white/10 bg-white/[0.03]",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="mt-1 text-sm text-zinc-400">
                              {item.rig?.name ?? "Yard/general"} · {item.category ?? "Uncategorized"}
                            </p>
                          </div>

                          {item.isCritical ? (
                            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-200">
                              Critical
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <FieldLine label="On hand" value={`${item.quantityOnHand} ${item.unit ?? ""}`.trim()} />
                          <FieldLine label="Reorder" value={item.reorderPoint?.toString() ?? "—"} />
                        </div>

                        <form action={adjustFieldInventoryItemAction} className="mt-4 flex gap-2">
                          <input type="hidden" name="itemId" value={item.id} />
                          <input
                            name="adjustment"
                            type="number"
                            defaultValue="1"
                            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                          />
                          <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
                            Adjust
                          </button>
                        </form>
                      </article>
                    );
                  })}
                </div>
              )}

              {inventoryAtRisk.length > 0 ? (
                <div className="mt-5 rounded-3xl border border-orange-500/20 bg-orange-500/[0.07] p-4">
                  <p className="font-medium text-orange-100">
                    {inventoryAtRisk.length} item(s) are at or below reorder point.
                  </p>
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Header({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      </div>
      {icon}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
    </div>
  );
}

function FormTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-orange-100">
      {icon}
      {title}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  required = false,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <textarea
        name={name}
        required={required}
        rows={3}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
      />
    </label>
  );
}

function Select({
  label,
  name,
  values,
  defaultValue,
}: {
  label: string;
  name: string;
  values: string[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? values[0]}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
      >
        {values.map((value) => (
          <option key={value} value={value}>
            {statusLabel(value)}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectFromRecords({
  label,
  name,
  records,
}: {
  label: string;
  name: string;
  records: { id: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <select
        name={name}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
      >
        <option value="">Unassigned</option>
        {records.map((record) => (
          <option key={record.id} value={record.id}>
            {record.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Submit({ label }: { label: string }) {
  return (
    <button className="mt-1 w-fit rounded-full border border-orange-500/30 bg-orange-500/15 px-5 py-3 text-sm font-medium text-orange-100 transition hover:bg-orange-500/25">
      {label}
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
      <p className="font-medium text-white">{title}</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{body}</p>
    </div>
  );
}

function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-1 text-zinc-200">{value}</p>
    </div>
  );
}

function statusPill(status: string) {
  switch (status) {
    case "Working":
    case "Active":
    case "Available":
      return "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200";
    case "WaitingOnParts":
    case "WaitingOnOperator":
    case "Moving":
    case "RiggingUp":
    case "RiggingDown":
      return "rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-200";
    case "DownForRepair":
    case "Cancelled":
      return "rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    case "Completed":
    case "Complete":
      return "rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-200";
    default:
      return "rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200";
  }
}
