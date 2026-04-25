import Link from "next/link";

import { getRepairWorkspaceForCurrentUser } from "@/lib/repair/queries";

export default async function RepairCustomersPage() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const customers = workspace.customers;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Customer records
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Repair customers
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Customers are created through the intake workflow so every record
              starts connected to a real device and ticket.
            </p>
          </div>

          <Link
            href="/client/tickets#new-intake"
            className="rounded-full border border-red-500/30 bg-red-500/15 px-5 py-3 text-sm text-red-100 transition hover:bg-red-500/25"
          >
            New intake
          </Link>
        </div>

        {customers.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="font-medium text-white">No customers yet.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              This is correct for a clean system. Create the first intake and
              customer data will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {customers.map((customer) => (
              <article
                key={customer.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {customer.displayName}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {customer.companyName ?? "Individual customer"}
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                    {customer.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                  <Row label="Phone" value={customer.phone ?? "—"} />
                  <Row label="Email" value={customer.email ?? "—"} />
                  <Row
                    label="Location"
                    value={[customer.city, customer.state].filter(Boolean).join(", ") || "—"}
                  />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <Count label="Tickets" value={customer.ticketCount} />
                  <Count label="Devices" value={customer.deviceCount} />
                  <Count label="Invoices" value={customer.invoiceCount} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
    </div>
  );
}
