import { markInvoicePaidAction } from "@/lib/repair/actions";
import {
  formatCurrency,
  getRepairWorkspaceForCurrentUser,
} from "@/lib/repair/queries";

const paymentMethods = ["Cash", "Card", "Transfer", "Zelle", "CashApp", "Other"];

export default async function RepairInvoicesPage() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const invoices = workspace.invoices;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Billing
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Repair invoices
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Invoices are created from repair tickets after a quote or final
            amount is entered.
          </p>
        </div>

        {invoices.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="font-medium text-white">No invoices yet.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Finish a diagnosis and quote on a ticket, then create the invoice
              from the ticket page.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {invoices.map((invoice) => (
              <article
                key={invoice.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={invoicePill(invoice.status)}>
                        {invoice.status}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                        {invoice.invoiceNumber}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {invoice.customerName}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      {invoice.ticketTitle ?? "General invoice"}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                      <Info label="Subtotal" value={formatCurrency(invoice.subtotal)} />
                      <Info label="Total" value={formatCurrency(invoice.totalAmount)} />
                      <Info label="Paid" value={formatCurrency(invoice.amountPaid)} />
                      <Info label="Balance" value={formatCurrency(invoice.balance)} />
                      <Info label="Issued" value={invoice.issuedLabel} />
                      <Info label="Due" value={invoice.dueLabel} />
                      <Info label="Paid date" value={invoice.paidLabel} />
                      <Info label="Method" value={invoice.paymentMethod ?? "—"} />
                    </div>
                  </div>

                  <form
                    action={markInvoicePaidAction}
                    className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4"
                  >
                    <input type="hidden" name="invoiceId" value={invoice.id} />

                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">
                      Payment
                    </p>

                    <label className="mt-4 block">
                      <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Amount paid
                      </span>
                      <input
                        name="amountPaid"
                        type="number"
                        step="0.01"
                        defaultValue={invoice.totalAmount.toString()}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>

                    <label className="mt-4 block">
                      <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Method
                      </span>
                      <select
                        name="paymentMethod"
                        defaultValue="Cash"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      >
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="submit"
                      className="mt-4 w-full rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/25"
                    >
                      Mark paid
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value}</p>
    </div>
  );
}

function invoicePill(status: string) {
  switch (status) {
    case "Paid":
      return "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200";
    case "Overdue":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    case "Open":
      return "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200";
    default:
      return "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200";
  }
}
