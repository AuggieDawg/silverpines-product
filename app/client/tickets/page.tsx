import { formatCurrency, repairTickets } from "@/lib/repair/dashboard";

export default function ClientTicketsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
          Ticket board
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Active repair work
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          This is the operational queue for devices in intake, diagnosis, parts
          waiting, ready for pickup, and completed states.
        </p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="grid grid-cols-[1.3fr_1fr_0.8fr_0.7fr_0.8fr] gap-4 border-b border-white/10 bg-black/20 px-5 py-4 text-xs uppercase tracking-[0.22em] text-zinc-500">
          <span>Repair</span>
          <span>Customer</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Quote</span>
        </div>

        <div className="divide-y divide-white/10">
          {repairTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="grid grid-cols-[1.3fr_1fr_0.8fr_0.7fr_0.8fr] gap-4 px-5 py-5 text-sm"
            >
              <div>
                <p className="font-medium text-white">{ticket.title}</p>
                <p className="mt-1 text-zinc-400">{ticket.deviceLabel}</p>
                <p className="mt-2 text-xs text-zinc-500">{ticket.symptom}</p>
              </div>

              <div>
                <p className="text-zinc-200">{ticket.customerName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {ticket.brand}
                </p>
              </div>

              <div>
                <span className={statusPill(ticket.status)}>
                  {ticket.statusLabel}
                </span>
                <p className="mt-2 text-xs text-zinc-500">{ticket.dueLabel}</p>
              </div>

              <div>
                <span className={priorityPill(ticket.priority)}>
                  {ticket.priority}
                </span>
              </div>

              <div className="text-zinc-200">
                {ticket.quoteAmount
                  ? formatCurrency(ticket.quoteAmount)
                  : "Pending"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function statusPill(status: string) {
  switch (status) {
    case "NEW":
      return "inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200";
    case "DIAGNOSING":
      return "inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200";
    case "WAITING_PARTS":
      return "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200";
    case "READY":
      return "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200";
    case "COMPLETED":
      return "inline-flex rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-200";
    default:
      return "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200";
  }
}

function priorityPill(priority: string) {
  switch (priority) {
    case "HIGH":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    case "MEDIUM":
      return "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200";
    default:
      return "inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200";
  }
}