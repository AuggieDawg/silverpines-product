import {
  createInvoiceFromTicketAction,
  createRepairIntakeAction,
  saveTicketDiagnosisAction,
  updateTicketStatusAction,
} from "@/lib/repair/actions";
import {
  formatCurrency,
  getRepairWorkspaceForCurrentUser,
  statusLabel,
} from "@/lib/repair/queries";

const deviceTypes = [
  "Phone",
  "Tablet",
  "Laptop",
  "Desktop",
  "AllInOne",
  "CustomBuild",
  "Monitor",
  "GameConsole",
  "Smartwatch",
  "Printer",
  "Other",
];

const priorities = ["Low", "Medium", "High", "Urgent"];
const intakeChannels = [
  "WalkIn",
  "Phone",
  "Text",
  "WhatsApp",
  "Facebook",
  "Website",
  "Referral",
  "Other",
];

const statuses = [
  "Reported",
  "Approved",
  "Scheduled",
  "InProgress",
  "WaitingOnParts",
  "Completed",
  "Closed",
  "Cancelled",
];

export default async function RepairTicketsPage() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const tickets = workspace.tickets;

  return (
    <div className="space-y-6">
      <section
        id="new-intake"
        className="rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-5"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-red-200/70">
            New intake
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Create a real customer, device, and repair ticket
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
            This is the beginning of the workflow. No demo data. Every intake
            creates real database records tied to your authenticated user.
          </p>
        </div>

        <form action={createRepairIntakeAction} className="mt-6 grid gap-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Customer name" name="customerName" required />
            <Field label="Phone" name="phone" />
            <Field label="Email" name="email" type="email" />
            <Field label="Company" name="companyName" />
            <Field label="City" name="city" defaultValue="Vernal" />
            <Field label="State" name="state" defaultValue="UT" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Device label" name="deviceLabel" placeholder="iPhone 13 Pro, Dell Inspiron, Custom PC" required />

            <Select label="Device type" name="deviceType" values={deviceTypes} />
            <Select label="Priority" name="priority" values={priorities} defaultValue="Medium" />

            <Field label="Brand" name="brand" placeholder="Apple, Samsung, Dell, HP" />
            <Field label="Model" name="model" />
            <Field label="Serial number" name="serialNumber" />
            <Field label="IMEI" name="imei" />
            <Field label="Operating system" name="operatingSystem" placeholder="iOS, Android, Windows 11" />
            <Select label="Intake channel" name="intakeChannel" values={intakeChannels} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TextArea
              label="Reported issue"
              name="reportedIssue"
              placeholder="Describe the failure, customer complaint, symptoms, and urgency."
              required
            />
            <TextArea
              label="Cosmetic condition"
              name="cosmeticCondition"
              placeholder="Cracks, dents, missing screws, liquid indicators, frame damage, screen condition."
            />
            <TextArea
              label="Accessories included"
              name="accessoriesIncluded"
              placeholder="Charger, case, SIM tray, power cable, bag, external drive."
            />
            <TextArea
              label="Customer notes"
              name="customerNotes"
              placeholder="Anything useful about customer expectations, communication, or warranty terms."
            />
          </div>

          <div className="grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 md:grid-cols-2 xl:grid-cols-4">
            <Checkbox label="Powers on" name="powersOn" />
            <Checkbox label="Liquid damage suspected" name="liquidDamageSuspected" />
            <Checkbox label="Data backup requested" name="dataBackupRequested" />
            <Checkbox label="Customer accepted data privacy terms" name="dataPrivacyAccepted" />
          </div>

          <div>
            <button
              type="submit"
              className="rounded-full border border-red-500/30 bg-red-500/20 px-5 py-3 text-sm font-medium text-red-100 transition hover:bg-red-500/30"
            >
              Create intake ticket
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Repair queue
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Work tickets
          </h2>
        </div>

        {tickets.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="font-medium text-white">No tickets yet.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Create your first intake above. This page intentionally stays
              empty until you enter real repair work.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={statusPill(ticket.status)}>
                        {statusLabel(ticket.status)}
                      </span>
                      <span className={priorityPill(ticket.priority)}>
                        {ticket.priority}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                        {ticket.ticketNumber}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {ticket.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {ticket.reportedIssue ?? "No issue summary provided."}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                      <Info label="Customer" value={ticket.customerName} />
                      <Info label="Phone" value={ticket.customerPhone ?? "—"} />
                      <Info label="Device" value={ticket.deviceLabel} />
                      <Info
                        label="Quote"
                        value={
                          ticket.quotedAmount
                            ? formatCurrency(ticket.quotedAmount)
                            : "Pending"
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <form action={updateTicketStatusAction} className="space-y-3">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <label className="block text-xs uppercase tracking-[0.22em] text-zinc-500">
                        Update status
                      </label>
                      <select
                        name="status"
                        defaultValue={ticket.status}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
                      >
                        Save status
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.45fr]">
                  <form
                    action={saveTicketDiagnosisAction}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <input type="hidden" name="ticketId" value={ticket.id} />

                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Diagnosis and quote
                    </p>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <TextArea
                        label="Diagnostic summary"
                        name="diagnosticSummary"
                        defaultValue={ticket.diagnosticSummary ?? ""}
                      />
                      <TextArea
                        label="Internal notes"
                        name="internalNotes"
                        placeholder="Private shop notes, risk, part notes, customer concerns."
                      />

                      <Field
                        label="Parts estimate"
                        name="estimatedPartsCost"
                        type="number"
                        step="0.01"
                        defaultValue={ticket.estimatedPartsCost?.toString() ?? ""}
                      />

                      <Field
                        label="Labor estimate"
                        name="estimatedLaborCost"
                        type="number"
                        step="0.01"
                        defaultValue={ticket.estimatedLaborCost?.toString() ?? ""}
                      />

                      <Field
                        label="Quoted amount"
                        name="quotedAmount"
                        type="number"
                        step="0.01"
                        defaultValue={ticket.quotedAmount?.toString() ?? ""}
                      />

                      <Field
                        label="Final amount"
                        name="finalAmount"
                        type="number"
                        step="0.01"
                        defaultValue={ticket.finalAmount?.toString() ?? ""}
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
                    >
                      Save diagnosis / quote
                    </button>
                  </form>

                  <form
                    action={createInvoiceFromTicketAction}
                    className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4"
                  >
                    <input type="hidden" name="ticketId" value={ticket.id} />

                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">
                      Invoice
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      Create an invoice from the final amount, or the quoted
                      amount if no final amount has been entered.
                    </p>

                    <button
                      type="submit"
                      className="mt-4 w-full rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/25"
                    >
                      {ticket.invoiceCount > 0
                        ? "Open existing invoice"
                        : "Create invoice"}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
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
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  step?: string;
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
        step={step}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  required = false,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={4}
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

function Checkbox({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-zinc-300">
      <input name={name} type="checkbox" value="true" className="h-4 w-4" />
      {label}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value}</p>
    </div>
  );
}

function statusPill(status: string) {
  switch (status) {
    case "Reported":
      return "inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200";
    case "Approved":
      return "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200";
    case "InProgress":
      return "inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200";
    case "WaitingOnParts":
      return "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200";
    case "Completed":
    case "Closed":
      return "inline-flex rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-200";
    case "Cancelled":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    default:
      return "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200";
  }
}

function priorityPill(priority: string) {
  switch (priority) {
    case "Urgent":
    case "High":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    case "Medium":
      return "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200";
    default:
      return "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200";
  }
}
