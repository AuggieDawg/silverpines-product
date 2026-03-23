import Link from "next/link";
import {
  Boxes,
  Camera,
  ClipboardList,
  DollarSign,
  ReceiptText,
  Users,
} from "lucide-react";

import {
  formatCurrency,
  getRepairDashboardMetrics,
  inventoryParts,
  repairInvoices,
  repairPhotos,
  repairTickets,
} from "@/lib/repair/dashboard";

const metricCards = [
  {
    title: "Open tickets",
    value: (metrics: ReturnType<typeof getRepairDashboardMetrics>) =>
      metrics.openTickets.toString(),
    icon: ClipboardList,
    tone:
      "border-red-500/20 bg-red-500/10 text-red-100 shadow-red-900/20",
  },
  {
    title: "Customers",
    value: (metrics: ReturnType<typeof getRepairDashboardMetrics>) =>
      metrics.customerCount.toString(),
    icon: Users,
    tone:
      "border-sky-500/20 bg-sky-500/10 text-sky-100 shadow-sky-900/20",
  },
  {
    title: "Parts below reorder",
    value: (metrics: ReturnType<typeof getRepairDashboardMetrics>) =>
      metrics.lowStockParts.toString(),
    icon: Boxes,
    tone:
      "border-amber-500/20 bg-amber-500/10 text-amber-100 shadow-amber-900/20",
  },
  {
    title: "Outstanding invoices",
    value: (metrics: ReturnType<typeof getRepairDashboardMetrics>) =>
      formatCurrency(metrics.outstandingInvoiceValue),
    icon: DollarSign,
    tone:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-100 shadow-emerald-900/20",
  },
];

export default function RepairOverview() {
  const metrics = getRepairDashboardMetrics();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`rounded-3xl border p-5 shadow-xl ${card.tone}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] opacity-70">
                    {card.title}
                  </p>
                  <p className="mt-3 text-2xl font-semibold">
                    {card.value(metrics)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                Active queue
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Tickets moving through the shop
              </h2>
            </div>

            <Link
              href="/client/tickets"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
            >
              Open tickets
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr] gap-4 border-b border-white/10 bg-black/20 px-4 py-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
              <span>Ticket</span>
              <span>Customer</span>
              <span>Status</span>
              <span>Quoted</span>
            </div>

            <div className="divide-y divide-white/10">
              {repairTickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr] gap-4 px-4 py-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-white">{ticket.title}</p>
                    <p className="mt-1 text-zinc-400">{ticket.deviceLabel}</p>
                  </div>

                  <div className="text-zinc-300">{ticket.customerName}</div>

                  <div>
                    <span className={statusPill(ticket.status)}>
                      {ticket.statusLabel}
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
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  Inventory pressure
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Low-stock parts
                </h2>
              </div>

              <Boxes className="h-5 w-5 text-zinc-400" />
            </div>

            <div className="mt-5 space-y-3">
              {inventoryParts
                .filter((part) => part.quantity <= part.reorderPoint)
                .slice(0, 4)
                .map((part) => (
                  <div
                    key={part.id}
                    className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{part.name}</p>
                        <p className="mt-1 text-sm text-amber-100/80">
                          SKU {part.sku}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {part.quantity} left
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
                          Reorder at {part.reorderPoint}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  Billing snapshot
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Invoice status
                </h2>
              </div>

              <ReceiptText className="h-5 w-5 text-zinc-400" />
            </div>

            <div className="mt-5 space-y-3">
              {repairInvoices.slice(0, 4).map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{invoice.number}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {invoice.customerName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(invoice.total)}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                Documentation
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Latest repair photos
              </h2>
            </div>

            <Link
              href="/client/photos"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
            >
              Open gallery
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {repairPhotos.slice(0, 4).map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-black/20"
              >
                <div className="flex h-40 items-center justify-center bg-[linear-gradient(135deg,_rgba(239,68,68,0.16),_rgba(255,255,255,0.02)_45%,_rgba(59,130,246,0.12))]">
                  <Camera className="h-8 w-8 text-zinc-200/80" />
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{photo.ticketTitle}</p>
                    <span className={photoKindPill(photo.kind)}>{photo.kind}</span>
                  </div>

                  <p className="mt-2 text-sm text-zinc-400">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Module direction
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Why this client module now fits your real workflow
          </h2>

          <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-300">
            <p>
              This client area now behaves like an operations dashboard for a
              repair business instead of a camera portal. That gives you a clean
              place to document real jobs, quote work, track parts, and later
              extract this module into a dedicated client spinoff if needed.
            </p>

            <p>
              Right now the pages use structured mock data so the UI can move
              immediately. Once your new Prisma schema is migrated, we swap the
              imports in one place and start reading from the database.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/client/customers"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
            >
              Manage customers
            </Link>

            <Link
              href="/client/inventory"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
            >
              Review parts inventory
            </Link>
          </div>
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

function photoKindPill(kind: string) {
  switch (kind) {
    case "BEFORE":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    case "AFTER":
      return "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200";
    default:
      return "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200";
  }
}