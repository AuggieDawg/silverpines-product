import { repairCustomers } from "@/lib/repair/dashboard";

export default function ClientCustomersPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
          Customer records
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Repair customers and device history
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          This page is where you will eventually store client contact details,
          intake history, consent, repeat repairs, and communication notes.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {repairCustomers.map((customer) => (
          <article
            key={customer.id}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">
                  {customer.name}
                </p>
                <p className="mt-1 text-sm text-zinc-400">{customer.city}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.22em] text-zinc-400">
                {customer.activeTickets} active
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Phone
                </p>
                <p className="mt-2 text-sm text-zinc-200">{customer.phone}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Email
                </p>
                <p className="mt-2 text-sm text-zinc-200">{customer.email}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Completed repairs
                </p>
                <p className="mt-2 text-sm text-zinc-200">
                  {customer.completedRepairs}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Last device
                </p>
                <p className="mt-2 text-sm text-zinc-200">
                  {customer.lastDevice}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}