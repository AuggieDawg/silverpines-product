"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  ClipboardList,
  Images,
  LayoutDashboard,
  ReceiptText,
  Users,
  Wrench,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/client/overview", icon: LayoutDashboard },
  { label: "Tickets", href: "/client/tickets", icon: ClipboardList },
  { label: "Customers", href: "/client/customers", icon: Users },
  { label: "Inventory", href: "/client/inventory", icon: Boxes },
  { label: "Invoices", href: "/client/invoices", icon: ReceiptText },
  { label: "Photos", href: "/client/photos", icon: Images },
];

export function RepairShell({
  children,
  userLabel,
  userInitials,
}: {
  children: ReactNode;
  userLabel: string;
  userInitials: string;
}) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.14),_transparent_28%),linear-gradient(180deg,_#09090b_0%,_#111113_48%,_#09090b_100%)] text-zinc-100">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="w-full shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl lg:sticky lg:top-24 lg:w-[300px]">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/15">
                <Wrench className="h-5 w-5 text-red-300" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">
                  Client Module
                </p>
                <h2 className="text-lg font-semibold text-white">
                  Repair Operations
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Intake, diagnostics, parts, invoices, and before/after photo
              tracking for computer and cellphone repairs.
            </p>
          </div>

          <nav className="p-3">
            <ul className="grid gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                        active
                          ? "border-red-500/30 bg-red-500/15 text-white shadow-lg shadow-red-900/20"
                          : "border-transparent bg-white/[0.03] text-zinc-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white",
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "h-4 w-4 transition",
                          active
                            ? "text-red-300"
                            : "text-zinc-500 group-hover:text-zinc-200",
                        ].join(" ")}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-white/10 p-5">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white">
                  {userInitials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {userLabel}
                  </p>
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Authenticated client
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">
            <div className="border-b border-white/10 px-5 py-5 sm:px-7">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                Repair Workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {pageTitle}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                This module is now aligned to your real workflow: track devices,
                document repairs, manage parts, and prepare a clean spinoff path
                later if a client wants their own dedicated app.
              </p>
            </div>

            <div className="p-5 sm:p-7">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/client/tickets")) return "Repair Tickets";
  if (pathname.startsWith("/client/customers")) return "Customers";
  if (pathname.startsWith("/client/inventory")) return "Inventory";
  if (pathname.startsWith("/client/invoices")) return "Invoices";
  if (pathname.startsWith("/client/photos")) return "Repair Photos";

  return "Repair Overview";
}