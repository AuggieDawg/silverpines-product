import { formatCurrency, repairInvoices } from "@/lib/repair/dashboard";

export default function ClientInvoicesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
          Billing
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Quotes, balances, and payment state
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Later this can split into quotes versus invoices if you want tighter
          accounting structure. For now it gives you the exact operational
          visibility you need.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {repairInvoices.map((invoice) => (
          <article
            key={invoice.id}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">
                  {invoice.number}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {invoice.customerName}
                </p>
              </div>

              <span className={invoiceStatusPill(invoice.status)}>
                {invoice.status}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Total
                </p>
                <p className="mt-2 text-sm text-white">
                  {formatCurrency(invoice.total)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Deposit
                </p>
                <p className="mt-2 text-sm text-white">
                  {formatCurrency(invoice.deposit)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Balance
                </p>
                <p className="mt-2 text-sm text-white">
                  {formatCurrency(invoice.balance)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-400">
              Issued: {invoice.issuedLabel}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

function invoiceStatusPill(status: string) {
  switch (status) {
    case "PAID":
      return "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200";
    case "SENT":
      return "inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200";
    case "OVERDUE":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    default:
      return "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200";
  }
}