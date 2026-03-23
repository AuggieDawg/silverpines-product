"use client";

import Link from "next/link";

type Feature = {
  title: string;
  subtitle: string;
  label: string;
  href: string;
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/client", label: "Client" },
  { href: "/workbench", label: "Workbench" },
  { href: "/owner", label: "ML Center" },
  { href: "/silverpines", label: "SilverPines" },
  { href: "/api/auth/signin", label: "Sign In" },
];

const ACTIONS = [
  { href: "/client", label: "Open Client", kind: "primary" as const },
  { href: "/workbench", label: "Open Workbench", kind: "secondary" as const },
  { href: "/owner", label: "Open ML Center", kind: "accent" as const },
  { href: "/silverpines", label: "SilverPines", kind: "secondary" as const },
];

const FEATURES: Feature[] = [
  {
    title: "Automated MLOps",
    subtitle: "Streamline machine-learning workflows across your stack with cleaner operational boundaries.",
    label: "Machine Learning",
    href: "/owner",
  },
  {
    title: "Data Security & Compliance",
    subtitle: "Build with stronger control, clearer system boundaries, and a more professional operating surface.",
    label: "Controls",
    href: "/client",
  },
  {
    title: "Advanced Backup & Recovery",
    subtitle: "Protect critical business and property data with calmer, more deliberate workflow design.",
    label: "Reliability",
    href: "/silverpines",
  },
  {
    title: "Seamless Integration",
    subtitle: "Unify client systems, owner tooling, and property operations inside one premium interface.",
    label: "Platform",
    href: "/workbench",
  },
];

const METRICS = [
  { value: "4", label: "core portals" },
  { value: "1", label: "shared system surface" },
  { value: "∞", label: "future polish headroom" },
];

function buttonClasses(kind: "primary" | "secondary" | "accent") {
  if (kind === "primary") return "glass-button glass-button-primary";
  if (kind === "accent") return "glass-button glass-button-accent";
  return "glass-button glass-button-secondary";
}

export default function LandingHero() {
  return (
    <section className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="glass-shell rounded-[32px] px-5 py-6 sm:px-7 sm:py-7 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-80" />
            <div className="absolute -right-24 top-10 h-56 w-56 rounded-full bg-sky-300/10 blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sm font-black tracking-[0.34em] text-white shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
                  SL
                </span>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/55">
                    Syndicate Labs
                  </p>
                  <p className="mt-1 text-sm text-white/72">
                    Premium control surfaces for business, property, and machine-learning operations
                  </p>
                </div>
              </div>

              <nav className="flex flex-wrap gap-2">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href + link.label} href={link.href} className="glass-nav-pill">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(340px,0.82fr)] lg:items-start">
              <div className="space-y-5">
                <div className="glass-panel rounded-[28px] p-6 sm:p-8">
                  <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-200/72">
                    Admin command centers + client systems + ML tooling
                  </p>

                  <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl xl:text-6xl">
                    Build a stronger business surface.
                  </h1>

                  <p className="mt-6 max-w-3xl text-base leading-7 text-white/72 md:text-lg">
                    Keep your background. Upgrade the behavior. This treatment turns your homepage
                    into a calmer, more premium interface by making the cards and buttons feel like
                    layered glass instead of flat blocks.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {ACTIONS.map((action) => (
                      <Link
                        key={action.href + action.label}
                        href={action.href}
                        className={buttonClasses(action.kind)}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {METRICS.map((metric) => (
                      <div key={metric.label} className="glass-panel-soft rounded-2xl p-4">
                        <p className="text-2xl font-semibold tracking-tight text-white">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-sm uppercase tracking-[0.18em] text-white/52">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="glass-panel-soft rounded-[24px] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                      Hover language
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-white">
                      Gentle lift, brighter edge, softer glow.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-white/68">
                      Cards rise slightly on hover. Buttons wake up with a restrained sheen. Press
                      states compress instead of flashing.
                    </p>
                  </div>

                  <div className="glass-panel-soft rounded-[24px] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                      App-wide continuity
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-white">
                      Same atmosphere, separate intensity.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-white/68">
                      The homepage keeps the stronger cinematic background. Internal pages get the
                      lighter overlay-only particle field so their layouts stay readable.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {FEATURES.map((feature) => (
                  <article key={feature.title} className="glass-panel rounded-[26px] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-100/70">
                          {feature.label}
                        </p>
                        <h2 className="mt-3 text-xl font-semibold text-white">{feature.title}</h2>
                      </div>

                      <span className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                        Active
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/68">{feature.subtitle}</p>

                    <div className="mt-5">
                      <Link href={feature.href} className="glass-button glass-button-secondary">
                        Open feature
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}