"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Home, LayoutDashboard, ShieldCheck, Wrench } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/client", label: "Client", icon: Building2 },
  { href: "/workbench", label: "Workbench", icon: LayoutDashboard },
  { href: "/owner", label: "ML Center", icon: ShieldCheck },
  { href: "/silverpines", label: "SilverPines", icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-white/10 bg-black/30 lg:block">
      <div className="sticky top-0 flex min-h-screen flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Operations Platform
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Agustin ML Hub</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Business tooling, workbench systems, and property operations.
          </p>
        </div>

        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-6 py-5 text-xs text-neutral-500">
          SilverPines can now live as a separate product line inside this forked codebase.
        </div>
      </div>
    </aside>
  );
}