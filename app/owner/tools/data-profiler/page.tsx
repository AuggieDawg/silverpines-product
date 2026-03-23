import { DataProfilerPanel } from "@/components/owner/DataProfilerPanel";

export default function DataProfilerPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_32%),linear-gradient(180deg,#07111d_0%,#050b13_100%)] px-6 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[2rem] border border-cyan-200/12 bg-[linear-gradient(180deg,rgba(11,20,35,0.86),rgba(5,10,18,0.92))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
          <div className="mb-3 inline-flex rounded-full border border-cyan-200/15 bg-cyan-400/8 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100/70">
            Business Data Profiler
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Data Profiler
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62 md:text-base">
            Owner-only tool for validating business datasets before forecasting,
            KPI interpretation, recommendations, or automation. Use this to
            inspect completeness, structure, and analytical readiness before you
            trust the dashboard.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
          <DataProfilerPanel />
        </div>
      </div>
    </div>
  );
}