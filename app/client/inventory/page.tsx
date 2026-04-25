import {
  adjustInventoryPartAction,
  createInventoryPartAction,
} from "@/lib/repair/actions";
import {
  formatCurrency,
  getRepairWorkspaceForCurrentUser,
} from "@/lib/repair/queries";

export default async function RepairInventoryPage() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const parts = workspace.inventoryParts;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Parts control
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Add inventory part
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Track screens, batteries, charging ports, thermal paste, hinges,
            cables, adapters, and other repair materials.
          </p>
        </div>

        <form action={createInventoryPartAction} className="mt-6 grid gap-4">
          <div className="grid gap-4 lg:grid-cols-4">
            <Field label="Part name" name="name" required />
            <Field label="SKU" name="sku" />
            <Field label="Brand" name="brand" />
            <Field label="Category" name="category" placeholder="Display, Battery, Charging, Consumable" />
            <Field label="Compatible with" name="compatibleWith" />
            <Field label="Supplier" name="supplierName" />
            <Field label="Supplier URL" name="supplierUrl" />
            <Field label="Quantity on hand" name="quantityOnHand" type="number" defaultValue="0" />
            <Field label="Reorder point" name="reorderPoint" type="number" />
            <Field label="Unit cost" name="unitCost" type="number" step="0.01" />
            <Field label="Unit price" name="unitPrice" type="number" step="0.01" />
            <Field label="Notes" name="notes" />
          </div>

          <button
            type="submit"
            className="w-fit rounded-full border border-red-500/30 bg-red-500/15 px-5 py-3 text-sm font-medium text-red-100 transition hover:bg-red-500/25"
          >
            Add part
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Current stock
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Inventory
          </h2>
        </div>

        {parts.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="font-medium text-white">No parts in inventory yet.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Add real parts above. Low-stock alerts will appear once reorder
              points are configured.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {parts.map((part) => (
              <article
                key={part.id}
                className={[
                  "rounded-3xl border p-5",
                  part.isLowStock
                    ? "border-amber-500/20 bg-amber-500/[0.06]"
                    : "border-white/10 bg-black/20",
                ].join(" ")}
              >
                <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {part.isLowStock ? (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">
                          Low stock
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200">
                          Stocked
                        </span>
                      )}
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                        {part.category ?? "Uncategorized"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {part.name}
                    </h3>

                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                      <Info label="SKU" value={part.sku ?? "—"} />
                      <Info label="Compatible" value={part.compatibleWith ?? "—"} />
                      <Info label="Supplier" value={part.supplierName ?? "—"} />
                      <Info label="Unit cost" value={formatCurrency(part.unitCost)} />
                      <Info label="Unit price" value={formatCurrency(part.unitPrice)} />
                      <Info label="Updated" value={part.updatedLabel} />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Quantity
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-white">
                      {part.quantityOnHand}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Reorder at {part.reorderPoint ?? 0}
                    </p>

                    <form action={adjustInventoryPartAction} className="mt-4 flex gap-2">
                      <input type="hidden" name="partId" value={part.id} />
                      <input
                        name="adjustment"
                        type="number"
                        defaultValue="1"
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
                      >
                        Adjust
                      </button>
                    </form>
                  </div>
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
  defaultValue,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
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
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
      />
    </label>
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
