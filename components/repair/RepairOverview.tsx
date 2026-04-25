import Link from "next/link";
import {
  Boxes,
  Camera,
  ClipboardList,
  DollarSign,
  Plus,
  ReceiptText,
  Users,
} from "lucide-react";

import {
  formatCurrency,
  getRepairWorkspaceForCurrentUser,
  statusLabel,
} from "@/lib/repair/queries";

export default async function RepairOverview() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const { metrics, tickets, inventoryParts, invoices, photos } = workspace;

  const lowStockParts = inventoryParts.filter((part) => part.isLowStock);
  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.status !== "Paid" && invoice.status !== "Void",
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Open tickets"
          value={metrics.openTickets.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="border-red-500/20 bg-red-500/10 text-red-100 shadow-red-900/20"
        />

        <MetricCard
          title="Customers"
          value={metrics.customerCount.toString()}
          icon={<Users className="h-5 w-5" />}
          tone="border-sky-500/20 bg-sky-500/10 text-sky-100 shadow-sky-900/20"
        />

        <MetricCard
          title="Parts below reorder"
          value={metrics.lowStockParts.toString()}
          icon={<Boxes className="h-5 w-5" />}
          tone="border-amber-500/20 bg-amber-500/10 text-amber-100 shadow-amber-900/20"
        />

        <MetricCard
          title="Unpaid invoices"
          value={formatCurrency(metrics.unpaidInvoiceValue)}
          icon={<DollarSign className="h-5 w-5" />}
          tone="border-emerald-500/20 bg-emerald-500/10 text-emerald-100 shadow-emerald-900/20"
        />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              End-to-end workflow
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Intake → diagnosis → quote → invoice → payment
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              This client module is now pointed at your real repair schema. Start
              with a customer/device intake, move the ticket through the shop,
              create an invoice, and mark it paid.
            </p>
          </div>

          <Link
            href="/client/tickets#new-intake"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/15 px-5 py-3 text-sm font-medium text-red-100 transition hover:bg-red-500/25"
          >
            <Plus className="h-4 w-4" />
            New repair intake
          </Link>
        </div>
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

          {tickets.length === 0 ? (
            <EmptyState
              title="No repair tickets yet"
              body="Create your first real repair intake. The dashboard will stay clean instead of pretending fake demo work exists."
              href="/client/tickets#new-intake"
              action="Create intake"
            />
          ) : (
            <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
              <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr] gap-4 border-b border-white/10 bg-black/20 px-4 py-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
                <span>Ticket</span>
                <span>Customer</span>
                <span>Status</span>
                <span>Quoted</span>
              </div>

              <div className="divide-y divide-white/10">
                {tickets.slice(0, 6).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr] gap-4 px-4 py-4 text-sm"
                  >
                    <div>
                      <p className="font-medium text-white">{ticket.title}</p>
                      <p className="mt-1 text-zinc-400">
                        {ticket.ticketNumber} · {ticket.deviceLabel}
                      </p>
                    </div>

                    <div className="text-zinc-300">{ticket.customerName}</div>

                    <div>
                      <span className={statusPill(ticket.status)}>
                        {statusLabel(ticket.status)}
                      </span>
                    </div>

                    <div className="text-zinc-200">
                      {ticket.quotedAmount
                        ? formatCurrency(ticket.quotedAmount)
                        : "Pending"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

            {lowStockParts.length === 0 ? (
              <EmptyState
                title="No low-stock parts"
                body="Once parts are added with reorder points, parts below threshold will appear here."
                href="/client/inventory"
                action="Manage inventory"
              />
            ) : (
              <div className="mt-5 space-y-3">
                {lowStockParts.slice(0, 4).map((part) => (
                  <div
                    key={part.id}
                    className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{part.name}</p>
                        <p className="mt-1 text-sm text-amber-100/80">
                          {part.sku ? `SKU ${part.sku}` : "No SKU yet"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {part.quantityOnHand} left
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
                          Reorder at {part.reorderPoint ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

            {unpaidInvoices.length === 0 ? (
              <EmptyState
                title="No unpaid invoices"
                body="Invoices generated from tickets will appear here until they are paid."
                href="/client/invoices"
                action="Open invoices"
              />
            ) : (
              <div className="mt-5 space-y-3">
                {unpaidInvoices.slice(0, 4).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {invoice.customerName}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(invoice.balance)}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          {invoice.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Documentation
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Repair photo/document trail
            </h2>
          </div>

          <Camera className="h-5 w-5 text-zinc-400" />
        </div>

        {photos.length === 0 ? (
          <EmptyState
            title="No repair photos yet"
            body="Photo upload/storage is the next serious upgrade. For now, this page is ready to show real uploaded evidence once storage is wired."
            href="/client/photos"
            action="Open photos"
          />
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {photos.slice(0, 4).map((photo) => (
              <div
                key={photo.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-4"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  {photo.category}
                </p>
                <p className="mt-2 font-medium text-white">{photo.ticketTitle}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {photo.caption ?? "No caption provided."}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className={`rounded-3xl border p-5 shadow-xl ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] opacity-70">
            {title}
          </p>
          <p className="mt-3 text-2xl font-semibold">{value}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
      <p className="font-medium text-white">{title}</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
      >
        {action}
      </Link>
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
