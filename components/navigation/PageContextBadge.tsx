import type { PageContextKind } from "@/lib/business-contexts/registry";

type PageContextBadgeProps = {
  kind: PageContextKind;
  label: string;
  className?: string;
};

const badgeStyles: Record<PageContextKind, string> = {
  COMPANY:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 shadow-emerald-950/20",
  PERSONAL:
    "border-sky-500/30 bg-sky-500/10 text-sky-200 shadow-sky-950/20",
  OWNER:
    "border-red-500/30 bg-red-500/10 text-red-200 shadow-red-950/20",
  PORTAL:
    "border-violet-500/30 bg-violet-500/10 text-violet-200 shadow-violet-950/20",
  EXPERIMENTAL:
    "border-amber-500/30 bg-amber-500/10 text-amber-200 shadow-amber-950/20",
};

export function PageContextBadge({
  kind,
  label,
  className = "",
}: PageContextBadgeProps) {
  return (
    <span
      className={[
        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] shadow-sm",
        badgeStyles[kind],
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
