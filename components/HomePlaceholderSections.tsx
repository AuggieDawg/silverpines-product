import Link from "next/link";

const PLATFORM_CARDS = [
  {
    kicker: "Client operations",
    title: "Run the client side with calmer, clearer surfaces.",
    body:
      "Use dark glass cards for dashboards, requests, summaries, and action areas so the page feels professional without becoming visually heavy.",
    href: "/client",
    cta: "Open client",
    points: ["Softer box edges", "Consistent hover response", "Cleaner CTA hierarchy"],
  },
  {
    kicker: "Workbench",
    title: "Keep the task and execution side structured.",
    body:
      "The workbench can keep its current layout while gaining a more atmospheric background treatment behind it. That adds polish without disrupting density.",
    href: "/workbench",
    cta: "Open workbench",
    points: ["Overlay particles only", "Preserved page structure", "Sharper focus on task content"],
  },
  {
    kicker: "SilverPines",
    title: "Property operations deserve the same premium surface language.",
    body:
      "Inspection workflows, apartment photos, and property controls become stronger when the interactive panels feel deliberate and tactile instead of generic.",
    href: "/silverpines",
    cta: "Open SilverPines",
    points: ["Glass inspection cards", "Subtle button compression", "More premium workflow feel"],
  },
];

const SURFACE_DETAILS = [
  {
    title: "Glass cards",
    copy: "Use for major homepage boxes, feature blocks, and spotlight sections.",
  },
  {
    title: "Glass buttons",
    copy: "Use for primary and secondary calls to action with a low-noise sheen.",
  },
  {
    title: "Overlay particles",
    copy: "Use behind internal pages only, with lower density and almost no wash.",
  },
  {
    title: "Gentle motion",
    copy: "Prefer 1px–2px lift, border wake-up, and tight press states over flashy animation.",
  },
];

export function HomePlaceholderSections() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="glass-panel rounded-[30px] p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/52">
            Homepage surface direction
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything on the homepage should feel like one family.
          </h2>

          <p className="mt-4 max-w-3xl text-base leading-7 text-white/68">
            The homepage is where you can afford the strongest visual statement. That means glass
            shells, softer reflections, and more tactile buttons. Internal pages should inherit the
            atmosphere, not the full visual weight.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {SURFACE_DETAILS.map((detail) => (
              <div key={detail.title} className="glass-panel-soft rounded-[22px] p-5">
                <h3 className="text-lg font-semibold text-white">{detail.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/66">{detail.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[30px] p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/52">
            Motion rules
          </p>

          <div className="mt-4 space-y-4">
            <div className="glass-panel-soft rounded-[22px] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/46">
                Hover
              </p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Rise by 1px to 2px, brighten the border, and let a faint sheen travel across the
                button.
              </p>
            </div>

            <div className="glass-panel-soft rounded-[22px] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/46">
                Press
              </p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Remove the lift, tighten the shadow, and let the button feel slightly compressed.
              </p>
            </div>

            <div className="glass-panel-soft rounded-[22px] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/46">
                Ambient motion
              </p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Background particles should drift slowly enough that users notice the polish, not
                the mechanism.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/owner" className="glass-button glass-button-accent">
              Open ML Center
            </Link>
            <Link href="/client" className="glass-button glass-button-secondary">
              Review client UI
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        {PLATFORM_CARDS.map((card) => (
          <article key={card.title} className="glass-panel rounded-[28px] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
              {card.kicker}
            </p>

            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{card.title}</h3>

            <p className="mt-4 text-sm leading-6 text-white/68">{card.body}</p>

            <div className="glass-divider mt-6" />

            <div className="mt-6 space-y-3">
              {card.points.map((point) => (
                <div key={point} className="glass-panel-soft rounded-2xl px-4 py-3">
                  <p className="text-sm font-medium text-white/82">{point}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link href={card.href} className="glass-button glass-button-primary">
                {card.cta}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6">
        <div className="glass-shell rounded-[32px] px-6 py-7 sm:px-8 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/52">
                Next polish pass
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                First make the homepage feel expensive. Then spread the atmosphere through the app.
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-7 text-white/68">
                This batch gives you the glass behavior on the homepage and a lighter particle
                presence behind the rest of the product. That is the cleanest way to get something
                new without destabilizing the current pages.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/" className="glass-button glass-button-primary">
                Review homepage
              </Link>
              <Link href="/silverpines" className="glass-button glass-button-secondary">
                Review property flow
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}