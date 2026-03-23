"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Home,
  LayoutDashboard,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/client", label: "Client", icon: Building2 },
  { href: "/workbench", label: "Workbench", icon: LayoutDashboard },
  { href: "/owner", label: "Business Intelligence", icon: ShieldCheck },
  { href: "/silverpines", label: "SilverPines", icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#07111d_0%,#050b13_100%)] px-5 py-6 text-white lg:flex lg:flex-col">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
          Operations Platform
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Agustin ML Hub
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/58">
          Business tooling, intelligence systems, and property operations.
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "border-cyan-200/25 bg-cyan-400/10 text-white"
                  : "border-transparent text-white/72 hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-sm font-semibold text-white">Platform note</div>
        <p className="mt-2 text-sm leading-6 text-white/58">
          SilverPines can continue as a separate product line while Business
          Intelligence becomes the reusable owner control surface.
        </p>
      </div>
    </aside>
  );
}