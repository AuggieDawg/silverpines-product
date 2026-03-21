"use client";

import Link from "next/link";

type Feature = {
  title: string;
  subtitle: string;
};

const FEATURES: Feature[] = [
  {
    title: "Automated MLOps",
    subtitle: "Streamline machine learning workflows across your stack.",
  },
  {
    title: "Data Security & Compliance",
    subtitle: "Build with stronger operational control and cleaner boundaries.",
  },
  {
    title: "Advanced Backup & Recovery",
    subtitle: "Protect critical business and application data.",
  },
  {
    title: "Seamless Integration",
    subtitle: "Unify your app, database, and ML tools into one platform.",
  },
];

function navLinkClasses() {
  return "rounded-xl px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white";
}

function ctaClasses(kind: "primary" | "secondary" | "silver") {
  if (kind === "primary") {
    return "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/12 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/18";
  }

  if (kind === "silver") {
    return "inline-flex items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-400/15 px-5 py-3 text-sm font-extrabold text-sky-100 transition hover:bg-sky-400/20";
  }

  return "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/25 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-black/40";
}

export default function LandingHero() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-8 lg:px-8 lg:pb-24">
      <div className="rounded-[2rem] border border-white/10 bg-black/20 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="flex flex-col gap-8 p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">
                Syndicate Labs
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              <Link href="/" className={navLinkClasses()}>
                Home
              </Link>
              <Link href="/client" className={navLinkClasses()}>
                Client
              </Link>
              <Link href="/workbench" className={navLinkClasses()}>
                Workbench
              </Link>
              <Link href="/owner" className={navLinkClasses()}>
                ML Center
              </Link>
              <Link href="/silverpines" className={navLinkClasses()}>
                SilverPines
              </Link>
              <Link href="/api/auth/signin" className={navLinkClasses()}>
                Sign In
              </Link>
            </nav>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-200/70">
                Admin command centers + client systems + ML tooling
              </p>

              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl xl:text-6xl">
                Build a Stronger Business.
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-7 text-white/70 md:text-lg">
                Customizing polished foundations for client operations, administrative business control,
                ML-centered owner tooling, and now dedicated property operations
                <b> - all inside one system.</b>
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/client" className={ctaClasses("primary")}>
                  Open Client
                </Link>
                <Link href="/workbench" className={ctaClasses("secondary")}>
                  Open Workbench
                </Link>
                <Link href="/owner" className={ctaClasses("secondary")}>
                  Open ML Center
                </Link>
                <Link href="/silverpines" className={ctaClasses("silver")}>
                  SilverPines
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
                    Capability
                  </p>
                  <h2 className="mt-3 text-lg font-semibold text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/65">
                    {feature.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}