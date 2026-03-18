import {
  Building2,
  ClipboardCheck,
  DollarSign,
  Warehouse,
  Wrench,
} from "lucide-react";

interface SummaryKpiStripProps {
  totalRecords: number;
  totalApartments: number;
  totalGarages: number;
  openIssues: number;
  dueSoonCount: number;
  ytdCost: number;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function SummaryKpiStrip({
  totalRecords,
  totalApartments,
  totalGarages,
  openIssues,
  dueSoonCount,
  ytdCost,
}: SummaryKpiStripProps) {
  const items = [
    {
      label: "Tracked assets",
      value: totalRecords.toString(),
      hint: `${totalApartments} apartments`,
      icon: Building2,
    },
    {
      label: "Garages",
      value: totalGarages.toString(),
      hint: "separate garage records",
      icon: Warehouse,
    },
    {
      label: "Open issues",
      value: openIssues.toString(),
      hint: "repairs or overdue work",
      icon: Wrench,
    },
    {
      label: "Due soon",
      value: dueSoonCount.toString(),
      hint: "scheduled maintenance",
      icon: ClipboardCheck,
    },
    {
      label: "YTD repair cost",
      value: currency.format(ytdCost),
      hint: "visible sample records",
      icon: DollarSign,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                  {item.hint}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-neutral-300">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}