import { formatCurrency, inventoryParts } from "@/lib/repair/dashboard";

export default function ClientInventoryPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
          Shop inventory
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Parts, consumables, and reorder pressure
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          This gives you a clean visual baseline now, and later it will map
          directly onto your `InventoryPart` and usage models from the new
          schema.
        </p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="grid grid-cols-[1.3fr_0.8fr_0.7fr_0.7fr_0.8fr] gap-4 border-b border-white/10 bg-black/20 px-5 py-4 text-xs uppercase tracking-[0.22em] text-zinc-500">
          <span>Part</span>
          <span>Category</span>
          <span>On hand</span>
          <span>Reorder</span>
          <span>Cost</span>
        </div>

        <div className="divide-y divide-white/10">
          {inventoryParts.map((part) => {
            const lowStock = part.quantity <= part.reorderPoint;

            return (
              <div
                key={part.id}
                className="grid grid-cols-[1.3fr_0.8fr_0.7fr_0.7fr_0.8fr] gap-4 px-5 py-5 text-sm"
              >
                <div>
                  <p className="font-medium text-white">{part.name}</p>
                  <p className="mt-1 text-zinc-400">
                    {part.sku} · {part.supplier}
                  </p>
                </div>

                <div className="text-zinc-300">{part.category}</div>

                <div>
                  <span
                    className={
                      lowStock
                        ? "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200"
                        : "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200"
                    }
                  >
                    {part.quantity}
                  </span>
                </div>

                <div className="text-zinc-300">{part.reorderPoint}</div>

                <div className="text-zinc-200">
                  {formatCurrency(part.unitCost)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}