"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  Database,
  FileBarChart2,
  Gauge,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { DataProfilerPanel } from "@/components/owner/DataProfilerPanel";

type DashboardTab =
  | "overview"
  | "financials"
  | "customers"
  | "operations"
  | "forecasting"
  | "recommendations"
  | "profiler";

type AlertLevel = "info" | "warning" | "critical";

type KPI = {
  label: string;
  value: string;
  delta: string;
  direction: "up" | "down" | "flat";
  helper: string;
};

type DriverRow = {
  name: string;
  impact: string;
  change: string;
  interpretation: string;
};

type AlertItem = {
  title: string;
  body: string;
  level: AlertLevel;
};

type OpportunityItem = {
  title: string;
  impact: string;
  effort: string;
};

type SegmentRow = {
  name: string;
  revenue: string;
  margin: string;
  change: string;
};

type ExpenseRow = {
  name: string;
  cost: string;
  share: string;
  trend: string;
};

type CustomerRow = {
  segment: string;
  retention: string;
  avgValue: string;
  status: string;
};

type OperationRow = {
  area: string;
  metric: string;
  target: string;
  status: string;
};

type RecommendationRow = {
  title: string;
  category: "Revenue" | "Profit" | "Operations" | "Risk";
  impact: string;
  effort: string;
  owner: string;
};

type DatasetHealthRow = {
  dataset: string;
  completeness: string;
  freshness: string;
  anomalies: string;
  readiness: string;
};

type ClientModel = {
  id: string;
  businessName: string;
  industry: string;
  status: "Healthy" | "Watch" | "At Risk";
  headline: string;
  kpis: KPI[];
  trendSeries: {
    revenue: number[];
    expenses: number[];
    forecast: number[];
    labels: string[];
  };
  drivers: DriverRow[];
  alerts: AlertItem[];
  opportunities: OpportunityItem[];
  segments: SegmentRow[];
  expenses: ExpenseRow[];
  customers: CustomerRow[];
  operations: OperationRow[];
  recommendations: RecommendationRow[];
  profiler: {
    score: string;
    summary: string;
    datasets: DatasetHealthRow[];
  };
};

const CLIENTS: ClientModel[] = [
  {
    id: "redstone",
    businessName: "Redstone Field Services",
    industry: "Oilfield services",
    status: "Watch",
    headline:
      "Revenue is still climbing, but collections lag and material cost inflation are compressing margin.",
    kpis: [
      {
        label: "Revenue",
        value: "$482K",
        delta: "+8.4% MoM",
        direction: "up",
        helper: "Driven by emergency service work and repeat accounts.",
      },
      {
        label: "Net Profit",
        value: "$96K",
        delta: "-2.1 pts margin",
        direction: "down",
        helper: "Higher materials and subcontractor costs are eating spread.",
      },
      {
        label: "Cash Flow",
        value: "$108K",
        delta: "-9.7% vs prior month",
        direction: "down",
        helper: "AR aging is the main pressure source.",
      },
      {
        label: "Retention",
        value: "87%",
        delta: "+3.2 pts",
        direction: "up",
        helper: "Core service contracts remain sticky.",
      },
      {
        label: "Lead Conversion",
        value: "31%",
        delta: "+4.9 pts",
        direction: "up",
        helper: "Quote follow-up timing improved.",
      },
      {
        label: "Data Health",
        value: "84 / 100",
        delta: "3 alerts open",
        direction: "down",
        helper: "Expense tagging and invoice freshness need attention.",
      },
    ],
    trendSeries: {
      revenue: [38, 42, 44, 48, 51, 55, 59, 62],
      expenses: [24, 25, 27, 28, 31, 34, 37, 39],
      forecast: [62, 64, 67, 69, 72, 74, 77, 80],
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    },
    drivers: [
      {
        name: "Emergency service jobs",
        impact: "+$84K",
        change: "+19%",
        interpretation: "High-demand, high-margin work. Increase promotion carefully.",
      },
      {
        name: "Materials cost",
        impact: "-$31K",
        change: "+18%",
        interpretation: "Main source of margin compression. Vendor review is justified.",
      },
      {
        name: "Repeat service contracts",
        impact: "+$142K",
        change: "+8%",
        interpretation: "Reliable base revenue. Strongest retention anchor.",
      },
      {
        name: "Slow collections",
        impact: "-$24K",
        change: "Worse",
        interpretation: "Cash timing risk. Needs tighter invoice follow-up.",
      },
    ],
    alerts: [
      {
        title: "Accounts receivable aging is worsening",
        body: "Invoices older than 30 days rose 14% over the last cycle.",
        level: "critical",
      },
      {
        title: "Materials category anomaly detected",
        body: "Several expense entries arrived uncategorized or under inconsistent labels.",
        level: "warning",
      },
      {
        title: "Forecast confidence reduced",
        body: "Expense feed freshness dropped to 3 days behind expected cadence.",
        level: "info",
      },
    ],
    opportunities: [
      {
        title: "Raise pricing 3–5% on emergency response package",
        impact: "High impact",
        effort: "Medium effort",
      },
      {
        title: "Reactivate 16 dormant high-value accounts",
        impact: "Medium impact",
        effort: "Low effort",
      },
      {
        title: "Normalize materials vendors and renegotiate top 2 suppliers",
        impact: "High impact",
        effort: "Medium effort",
      },
    ],
    segments: [
      { name: "Emergency Response", revenue: "$184K", margin: "34%", change: "+19%" },
      { name: "Recurring Maintenance", revenue: "$142K", margin: "29%", change: "+8%" },
      { name: "Inspection Work", revenue: "$96K", margin: "22%", change: "+5%" },
      { name: "Special Projects", revenue: "$60K", margin: "18%", change: "-3%" },
    ],
    expenses: [
      { name: "Materials", cost: "$134K", share: "28%", trend: "+18%" },
      { name: "Payroll", cost: "$106K", share: "22%", trend: "+6%" },
      { name: "Subcontractors", cost: "$64K", share: "13%", trend: "+11%" },
      { name: "Fuel & Logistics", cost: "$58K", share: "12%", trend: "+4%" },
    ],
    customers: [
      { segment: "Top 10 accounts", retention: "96%", avgValue: "$18.2K", status: "Stable" },
      { segment: "New customers", retention: "61%", avgValue: "$4.3K", status: "Needs nurture" },
      { segment: "Dormant accounts", retention: "24%", avgValue: "$9.1K", status: "Reactivation target" },
      { segment: "High-margin contracts", retention: "93%", avgValue: "$13.7K", status: "Protect" },
    ],
    operations: [
      { area: "Invoice turnaround", metric: "4.8 days", target: "< 2 days", status: "Off target" },
      { area: "Quote follow-up", metric: "1.1 days", target: "< 1.5 days", status: "On target" },
      { area: "Job backlog", metric: "22 open", target: "< 18", status: "Watch" },
      { area: "Rework rate", metric: "3.9%", target: "< 3%", status: "Watch" },
    ],
    recommendations: [
      {
        title: "Automate invoice reminders at 7/14/21 days and assign manual follow-up to AR owner.",
        category: "Risk",
        impact: "Cash flow protection",
        effort: "Medium",
        owner: "Finance",
      },
      {
        title: "Create canonical material categories and map legacy variants before next report cycle.",
        category: "Profit",
        impact: "Improves margin accuracy",
        effort: "Low",
        owner: "Ops",
      },
      {
        title: "Launch outreach list for dormant high-spend accounts with one service recovery offer.",
        category: "Revenue",
        impact: "Fast reactivation",
        effort: "Low",
        owner: "Sales",
      },
      {
        title: "Compare supplier pricing for top 20 material SKUs and lock preferred vendor list.",
        category: "Profit",
        impact: "Margin expansion",
        effort: "Medium",
        owner: "Procurement",
      },
    ],
    profiler: {
      score: "84 / 100",
      summary:
        "Business metrics are usable, but expense categorization inconsistency and stale invoice snapshots reduce confidence.",
      datasets: [
        {
          dataset: "Invoices",
          completeness: "92%",
          freshness: "3 days old",
          anomalies: "2",
          readiness: "Watch",
        },
        {
          dataset: "Expenses",
          completeness: "88%",
          freshness: "1 day old",
          anomalies: "7",
          readiness: "Needs cleanup",
        },
        {
          dataset: "Customers",
          completeness: "96%",
          freshness: "Current",
          anomalies: "1",
          readiness: "Ready",
        },
        {
          dataset: "Leads",
          completeness: "81%",
          freshness: "2 days old",
          anomalies: "4",
          readiness: "Partial",
        },
      ],
    },
  },
  {
    id: "bluegrove",
    businessName: "BlueGrove Property Group",
    industry: "Property operations",
    status: "Healthy",
    headline:
      "Occupancy and service revenue are improving. Cost control is reasonable and data quality is stronger.",
    kpis: [
      {
        label: "Revenue",
        value: "$318K",
        delta: "+6.1% MoM",
        direction: "up",
        helper: "Occupancy and maintenance upsells are both helping.",
      },
      {
        label: "Net Profit",
        value: "$74K",
        delta: "+2.7 pts margin",
        direction: "up",
        helper: "Cost discipline improved this month.",
      },
      {
        label: "Cash Flow",
        value: "$88K",
        delta: "+5.4% vs prior month",
        direction: "up",
        helper: "Collections are healthier here than baseline.",
      },
      {
        label: "Retention",
        value: "91%",
        delta: "+1.8 pts",
        direction: "up",
        helper: "Tenant renewal and service follow-up are both solid.",
      },
      {
        label: "Lead Conversion",
        value: "28%",
        delta: "+2.2 pts",
        direction: "up",
        helper: "Lead quality is improving from referrals.",
      },
      {
        label: "Data Health",
        value: "91 / 100",
        delta: "1 alert open",
        direction: "up",
        helper: "Cleanest client dataset in the current sample.",
      },
    ],
    trendSeries: {
      revenue: [29, 30, 31, 34, 36, 38, 39, 41],
      expenses: [17, 17, 18, 19, 20, 21, 22, 22],
      forecast: [41, 42, 43, 45, 46, 47, 48, 49],
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    },
    drivers: [
      {
        name: "Occupancy recovery",
        impact: "+$44K",
        change: "+11%",
        interpretation: "Improving stability. Protect renewal workflow.",
      },
      {
        name: "Maintenance upsells",
        impact: "+$18K",
        change: "+13%",
        interpretation: "Good expansion path from existing tenants.",
      },
      {
        name: "Utility cost control",
        impact: "+$9K",
        change: "Improved",
        interpretation: "Operational discipline is working.",
      },
      {
        name: "Lead source tracking gap",
        impact: "Visibility issue",
        change: "Open",
        interpretation: "Marketing attribution still has blind spots.",
      },
    ],
    alerts: [
      {
        title: "Lead-source attribution is incomplete",
        body: "Referral and web inquiry labels need standardization.",
        level: "warning",
      },
      {
        title: "One vacancy cohort underperforming",
        body: "Unit class B is taking longer to refill than target.",
        level: "info",
      },
    ],
    opportunities: [
      {
        title: "Push renewal incentives before 45-day notice window",
        impact: "Medium impact",
        effort: "Low effort",
      },
      {
        title: "Expand maintenance package upsells to class B portfolio",
        impact: "High impact",
        effort: "Medium effort",
      },
    ],
    segments: [
      { name: "Rent revenue", revenue: "$228K", margin: "41%", change: "+7%" },
      { name: "Maintenance services", revenue: "$52K", margin: "33%", change: "+13%" },
      { name: "Late fees", revenue: "$18K", margin: "78%", change: "-4%" },
      { name: "Ancillary services", revenue: "$20K", margin: "37%", change: "+5%" },
    ],
    expenses: [
      { name: "Payroll", cost: "$78K", share: "25%", trend: "+4%" },
      { name: "Utilities", cost: "$40K", share: "13%", trend: "-3%" },
      { name: "Repairs", cost: "$32K", share: "10%", trend: "+2%" },
      { name: "Marketing", cost: "$18K", share: "6%", trend: "+6%" },
    ],
    customers: [
      { segment: "Renewals", retention: "94%", avgValue: "$7.2K", status: "Strong" },
      { segment: "New tenants", retention: "76%", avgValue: "$4.8K", status: "Monitor onboarding" },
      { segment: "Maintenance upsell users", retention: "89%", avgValue: "$2.1K", status: "Expand" },
      { segment: "High-risk churn", retention: "39%", avgValue: "$3.2K", status: "Intervene" },
    ],
    operations: [
      { area: "Turn time", metric: "5.2 days", target: "< 6 days", status: "On target" },
      { area: "Open work orders", metric: "14", target: "< 16", status: "On target" },
      { area: "Vacancy refill", metric: "21 days", target: "< 18 days", status: "Watch" },
      { area: "Tenant response time", metric: "3.4 hrs", target: "< 4 hrs", status: "On target" },
    ],
    recommendations: [
      {
        title: "Standardize lead-source values before scaling marketing spend comparisons.",
        category: "Operations",
        impact: "Better attribution",
        effort: "Low",
        owner: "Admin",
      },
      {
        title: "Deploy renewal outreach 15 days earlier for class B units.",
        category: "Revenue",
        impact: "Retention gain",
        effort: "Low",
        owner: "Leasing",
      },
      {
        title: "Bundle maintenance upsells into renewal offers for higher-value tenants.",
        category: "Revenue",
        impact: "Expansion revenue",
        effort: "Medium",
        owner: "Leasing",
      },
    ],
    profiler: {
      score: "91 / 100",
      summary:
        "Most datasets are analytically ready. Main weakness is lead-source consistency rather than completeness.",
      datasets: [
        {
          dataset: "Leases",
          completeness: "97%",
          freshness: "Current",
          anomalies: "0",
          readiness: "Ready",
        },
        {
          dataset: "Work orders",
          completeness: "94%",
          freshness: "Current",
          anomalies: "1",
          readiness: "Ready",
        },
        {
          dataset: "Payments",
          completeness: "96%",
          freshness: "Current",
          anomalies: "1",
          readiness: "Ready",
        },
        {
          dataset: "Leads",
          completeness: "83%",
          freshness: "1 day old",
          anomalies: "3",
          readiness: "Partial",
        },
      ],
    },
  },
];

const TABS: { id: DashboardTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "financials", label: "Financials", icon: CircleDollarSign },
  { id: "customers", label: "Customers", icon: Users },
  { id: "operations", label: "Operations", icon: BriefcaseBusiness },
  { id: "forecasting", label: "Forecasting", icon: LineChart },
  { id: "recommendations", label: "Recommendations", icon: Sparkles },
  { id: "profiler", label: "Data Profiler", icon: Database },
];

function trendTone(direction: KPI["direction"]) {
  if (direction === "up") return "text-emerald-300";
  if (direction === "down") return "text-rose-300";
  return "text-white/70";
}

function alertTone(level: AlertLevel) {
  if (level === "critical") {
    return "border-rose-400/30 bg-rose-500/10 text-rose-100";
  }
  if (level === "warning") {
    return "border-amber-300/30 bg-amber-500/10 text-amber-100";
  }
  return "border-sky-300/30 bg-sky-500/10 text-sky-100";
}

function categoryTone(category: RecommendationRow["category"]) {
  switch (category) {
    case "Revenue":
      return "bg-emerald-500/12 text-emerald-200 border border-emerald-400/20";
    case "Profit":
      return "bg-cyan-500/12 text-cyan-200 border border-cyan-400/20";
    case "Operations":
      return "bg-violet-500/12 text-violet-200 border border-violet-400/20";
    case "Risk":
      return "bg-rose-500/12 text-rose-200 border border-rose-400/20";
    default:
      return "bg-white/10 text-white/80 border border-white/10";
  }
}

function statusTone(status: ClientModel["status"]) {
  switch (status) {
    case "Healthy":
      return "border-emerald-300/25 bg-emerald-500/10 text-emerald-200";
    case "Watch":
      return "border-amber-300/25 bg-amber-500/10 text-amber-100";
    case "At Risk":
      return "border-rose-300/25 bg-rose-500/10 text-rose-100";
    default:
      return "border-white/10 bg-white/5 text-white/80";
  }
}

function buildPath(values: number[], width = 100, height = 44) {
  if (!values.length) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  return values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const normalized = (value - min) / range;
      const y = height - normalized * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function GlassButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  const className =
    "inline-flex items-center justify-center rounded-[1.1rem] border border-cyan-200/20 bg-[linear-gradient(180deg,rgba(176,238,255,0.22),rgba(90,180,255,0.08))] px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_rgba(4,12,24,0.35)] backdrop-blur-xl transition hover:border-cyan-100/35 hover:bg-[linear-gradient(180deg,rgba(176,238,255,0.26),rgba(90,180,255,0.12))]";
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return <button className={className}>{children}</button>;
}

function FlatPanel({
  title,
  kicker,
  children,
  right,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {kicker ? (
            <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-cyan-200/65">
              {kicker}
            </div>
          ) : null}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function KpiCard({ item }: { item: KPI }) {
  return (
    <div className="rounded-[1.45rem] border border-white/10 bg-slate-950/45 p-4 shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        {item.label}
      </div>
      <div className="mb-2 text-2xl font-semibold text-white">{item.value}</div>
      <div className={`mb-3 text-sm font-medium ${trendTone(item.direction)}`}>
        {item.delta}
      </div>
      <div className="text-sm leading-6 text-white/62">{item.helper}</div>
    </div>
  );
}

function TrendChart({
  revenue,
  expenses,
  forecast,
  labels,
}: ClientModel["trendSeries"]) {
  const revenuePath = buildPath(revenue);
  const expensePath = buildPath(expenses);
  const forecastPath = buildPath(forecast);
  const lastRevenue = revenue[revenue.length - 1] ?? 0;
  const firstRevenue = revenue[0] ?? 0;
  const delta = (((lastRevenue - firstRevenue) / Math.max(1, firstRevenue)) * 100).toFixed(1);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/55">Trend engine</div>
          <div className="mt-1 text-3xl font-semibold text-white">+{delta}%</div>
          <div className="mt-1 text-sm text-white/55">
            Revenue trajectory over the selected operating window.
          </div>
        </div>
        <div className="flex gap-2 text-xs text-white/60">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            Revenue
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-rose-300" />
            Expenses
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Forecast
          </span>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/60 p-4">
        <svg viewBox="0 0 100 44" className="h-56 w-full overflow-visible">
          <defs>
            <linearGradient id="revenueGlow" x1="0%" x2="100%">
              <stop offset="0%" stopColor="rgba(125,211,252,0.35)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.9)" />
            </linearGradient>
            <linearGradient id="expenseGlow" x1="0%" x2="100%">
              <stop offset="0%" stopColor="rgba(253,164,175,0.35)" />
              <stop offset="100%" stopColor="rgba(251,113,133,0.9)" />
            </linearGradient>
            <linearGradient id="forecastGlow" x1="0%" x2="100%">
              <stop offset="0%" stopColor="rgba(134,239,172,0.35)" />
              <stop offset="100%" stopColor="rgba(74,222,128,0.9)" />
            </linearGradient>
          </defs>

          {[8, 16, 24, 32, 40].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.3"
            />
          ))}

          <path d={expensePath} fill="none" stroke="url(#expenseGlow)" strokeWidth="1.8" />
          <path d={revenuePath} fill="none" stroke="url(#revenueGlow)" strokeWidth="2.2" />
          <path
            d={forecastPath}
            fill="none"
            stroke="url(#forecastGlow)"
            strokeDasharray="3 2"
            strokeWidth="1.8"
          />
        </svg>

        <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-white/45 sm:grid-cols-8">
          {labels.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ client }: { client: ClientModel }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr_0.9fr]">
        <FlatPanel
          title="Financial Trend Engine"
          kicker="Core signal"
          right={
            <span className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
              Actual / Forecast
            </span>
          }
        >
          <TrendChart {...client.trendSeries} />
        </FlatPanel>

        <FlatPanel title="Business Drivers" kicker="Why performance moved">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-white/55">
                <tr>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 font-medium">Impact</th>
                  <th className="px-4 py-3 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {client.drivers.map((row) => (
                  <tr key={row.name} className="border-t border-white/8">
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{row.name}</div>
                      <div className="mt-1 text-xs text-white/55">{row.interpretation}</div>
                    </td>
                    <td className="px-4 py-4 text-white/85">{row.impact}</td>
                    <td className="px-4 py-4 text-white/70">{row.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FlatPanel>

        <div className="space-y-6">
          <FlatPanel title="Alerts" kicker="Business + data warnings">
            <div className="space-y-3">
              {client.alerts.map((alert) => (
                <div
                  key={alert.title}
                  className={`rounded-2xl border p-4 ${alertTone(alert.level)}`}
                >
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4" />
                    {alert.title}
                  </div>
                  <div className="text-sm leading-6 opacity-85">{alert.body}</div>
                </div>
              ))}
            </div>
          </FlatPanel>

          <FlatPanel title="Profiler Snapshot" kicker="Analytical trust layer">
            <div className="mb-4 rounded-2xl border border-cyan-300/20 bg-cyan-500/8 p-4">
              <div className="text-sm text-cyan-100/75">Data health score</div>
              <div className="mt-1 text-2xl font-semibold text-white">{client.profiler.score}</div>
              <div className="mt-2 text-sm leading-6 text-white/62">
                {client.profiler.summary}
              </div>
            </div>
            <div className="space-y-2">
              {client.profiler.datasets.slice(0, 3).map((dataset) => (
                <div
                  key={dataset.dataset}
                  className="grid grid-cols-[1.2fr_0.8fr_0.8fr] gap-2 rounded-xl border border-white/8 px-3 py-3 text-sm"
                >
                  <div className="font-medium text-white">{dataset.dataset}</div>
                  <div className="text-white/65">{dataset.completeness}</div>
                  <div className="text-right text-white/65">{dataset.readiness}</div>
                </div>
              ))}
            </div>
          </FlatPanel>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <FlatPanel title="Top Opportunities" kicker="Prescriptive layer">
          <div className="space-y-3">
            {client.opportunities.map((item) => (
              <div
                key={item.title}
                className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4"
              >
                <div>
                  <div className="font-medium text-white">{item.title}</div>
                  <div className="mt-1 text-sm text-white/55">
                    {item.impact} · {item.effort}
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-cyan-200/70" />
              </div>
            ))}
          </div>
        </FlatPanel>

        <FlatPanel title="Dataset Health Matrix" kicker="Less 3D, more analytical">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-white/55">
                <tr>
                  <th className="px-4 py-3 font-medium">Dataset</th>
                  <th className="px-4 py-3 font-medium">Completeness</th>
                  <th className="px-4 py-3 font-medium">Freshness</th>
                  <th className="px-4 py-3 font-medium">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {client.profiler.datasets.map((dataset) => (
                  <tr key={dataset.dataset} className="border-t border-white/8">
                    <td className="px-4 py-4 font-medium text-white">{dataset.dataset}</td>
                    <td className="px-4 py-4 text-white/75">{dataset.completeness}</td>
                    <td className="px-4 py-4 text-white/75">{dataset.freshness}</td>
                    <td className="px-4 py-4 text-white/75">{dataset.readiness}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FlatPanel>
      </div>
    </div>
  );
}

function FinancialsTab({ client }: { client: ClientModel }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <FlatPanel title="Revenue Breakdown" kicker="Segment performance">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-white/55">
              <tr>
                <th className="px-4 py-3 font-medium">Segment</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium">Margin</th>
                <th className="px-4 py-3 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {client.segments.map((row) => (
                <tr key={row.name} className="border-t border-white/8">
                  <td className="px-4 py-4 font-medium text-white">{row.name}</td>
                  <td className="px-4 py-4 text-white/78">{row.revenue}</td>
                  <td className="px-4 py-4 text-white/78">{row.margin}</td>
                  <td className="px-4 py-4 text-emerald-300">{row.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FlatPanel>

      <FlatPanel title="Expense Analysis" kicker="Cost concentration">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-white/55">
              <tr>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Share</th>
                <th className="px-4 py-3 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {client.expenses.map((row) => (
                <tr key={row.name} className="border-t border-white/8">
                  <td className="px-4 py-4 font-medium text-white">{row.name}</td>
                  <td className="px-4 py-4 text-white/78">{row.cost}</td>
                  <td className="px-4 py-4 text-white/78">{row.share}</td>
                  <td className="px-4 py-4 text-rose-300">{row.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FlatPanel>
    </div>
  );
}

function CustomersTab({ client }: { client: ClientModel }) {
  return (
    <FlatPanel title="Customer Intelligence" kicker="Retention + value">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-white/55">
            <tr>
              <th className="px-4 py-3 font-medium">Segment</th>
              <th className="px-4 py-3 font-medium">Retention</th>
              <th className="px-4 py-3 font-medium">Average value</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {client.customers.map((row) => (
              <tr key={row.segment} className="border-t border-white/8">
                <td className="px-4 py-4 font-medium text-white">{row.segment}</td>
                <td className="px-4 py-4 text-white/78">{row.retention}</td>
                <td className="px-4 py-4 text-white/78">{row.avgValue}</td>
                <td className="px-4 py-4 text-white/65">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FlatPanel>
  );
}

function OperationsTab({ client }: { client: ClientModel }) {
  return (
    <FlatPanel title="Operational Bottlenecks" kicker="Execution layer">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-white/55">
            <tr>
              <th className="px-4 py-3 font-medium">Area</th>
              <th className="px-4 py-3 font-medium">Current</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {client.operations.map((row) => (
              <tr key={row.area} className="border-t border-white/8">
                <td className="px-4 py-4 font-medium text-white">{row.area}</td>
                <td className="px-4 py-4 text-white/78">{row.metric}</td>
                <td className="px-4 py-4 text-white/78">{row.target}</td>
                <td className="px-4 py-4 text-white/65">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FlatPanel>
  );
}

function ForecastingTab({ client }: { client: ClientModel }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
      <FlatPanel title="Scenario Outlook" kicker="Predictive layer">
        <TrendChart {...client.trendSeries} />
      </FlatPanel>

      <FlatPanel title="Scenario Controls" kicker="What-if frame">
        <div className="space-y-5">
          {[
            { label: "Price adjustment", value: "3%" },
            { label: "Retention improvement", value: "2 pts" },
            { label: "Expense reduction", value: "5%" },
            { label: "Lead conversion gain", value: "4 pts" },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/72">{row.label}</span>
                <span className="text-white">{row.value}</span>
              </div>
              <div className="h-3 rounded-full bg-white/8">
                <div className="h-3 w-2/3 rounded-full bg-[linear-gradient(90deg,rgba(125,211,252,0.55),rgba(34,211,238,0.9))]" />
              </div>
            </div>
          ))}

          <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-500/8 p-4">
            <div className="text-sm text-emerald-100/70">Projected upside case</div>
            <div className="mt-1 text-2xl font-semibold text-white">+11% profit expansion</div>
            <div className="mt-2 text-sm leading-6 text-white/62">
              Best case comes from combining modest price discipline with retention and collections
              improvement.
            </div>
          </div>
        </div>
      </FlatPanel>
    </div>
  );
}

function RecommendationsTab({ client }: { client: ClientModel }) {
  return (
    <FlatPanel title="Recommendation Engine" kicker="Decision support">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-white/55">
            <tr>
              <th className="px-4 py-3 font-medium">Recommendation</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Impact</th>
              <th className="px-4 py-3 font-medium">Effort</th>
              <th className="px-4 py-3 font-medium">Owner</th>
            </tr>
          </thead>
          <tbody>
            {client.recommendations.map((row) => (
              <tr key={row.title} className="border-t border-white/8">
                <td className="px-4 py-4 font-medium text-white">{row.title}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${categoryTone(row.category)}`}>
                    {row.category}
                  </span>
                </td>
                <td className="px-4 py-4 text-white/78">{row.impact}</td>
                <td className="px-4 py-4 text-white/78">{row.effort}</td>
                <td className="px-4 py-4 text-white/65">{row.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FlatPanel>
  );
}

function ProfilerTab({ client }: { client: ClientModel }) {
  return (
    <div className="space-y-6">
      <FlatPanel
        title="Business Data Profiler"
        kicker="Trust before inference"
        right={<GlassButton href="/owner/tools/data-profiler">Open standalone profiler</GlassButton>}
      >
        <div className="mb-5 rounded-2xl border border-cyan-300/20 bg-cyan-500/8 p-5">
          <div className="text-sm text-cyan-100/70">Analytical readiness</div>
          <div className="mt-1 text-2xl font-semibold text-white">{client.profiler.score}</div>
          <div className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
            {client.profiler.summary}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-white/55">
              <tr>
                <th className="px-4 py-3 font-medium">Dataset</th>
                <th className="px-4 py-3 font-medium">Completeness</th>
                <th className="px-4 py-3 font-medium">Freshness</th>
                <th className="px-4 py-3 font-medium">Anomalies</th>
                <th className="px-4 py-3 font-medium">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {client.profiler.datasets.map((row) => (
                <tr key={row.dataset} className="border-t border-white/8">
                  <td className="px-4 py-4 font-medium text-white">{row.dataset}</td>
                  <td className="px-4 py-4 text-white/78">{row.completeness}</td>
                  <td className="px-4 py-4 text-white/78">{row.freshness}</td>
                  <td className="px-4 py-4 text-white/78">{row.anomalies}</td>
                  <td className="px-4 py-4 text-white/65">{row.readiness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FlatPanel>

      <FlatPanel title="CSV Profiling Tool" kicker="Existing tool preserved">
        <DataProfilerPanel />
      </FlatPanel>
    </div>
  );
}

export default function OwnerDashboard() {
  const [selectedClientId, setSelectedClientId] = useState<string>(CLIENTS[0]?.id ?? "");
  const [tab, setTab] = useState<DashboardTab>("overview");

  const client = useMemo(
    () => CLIENTS.find((item) => item.id === selectedClientId) ?? CLIENTS[0],
    [selectedClientId]
  );

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_34%),linear-gradient(180deg,#07111d_0%,#050b13_100%)] text-white">
      <div className="mx-auto max-w-[1600px] px-6 py-8 md:px-8 xl:px-10">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-cyan-200/12 bg-[linear-gradient(180deg,rgba(11,20,35,0.86),rgba(5,10,18,0.92))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-400/8 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100/70">
                <ShieldCheck className="h-3.5 w-3.5" />
                Business Intelligence
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Client Intelligence Console
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62 md:text-base">
                Premium operator view for business health, forecasting, opportunities, and data
                trust. Buttons stay glossy. Tables stay flatter and more analytical.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <GlassButton href="/owner/tools/data-profiler">Open Profiler</GlassButton>
              <GlassButton>Generate Report</GlassButton>
              <GlassButton>Run Scenario</GlassButton>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Active client
              </div>
              <div className="flex flex-wrap gap-3">
                {CLIENTS.map((item) => {
                  const active = item.id === client.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedClientId(item.id)}
                      className={[
                        "rounded-[1.15rem] border px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_18px_44px_rgba(0,0,0,0.28)] transition",
                        active
                          ? "border-cyan-100/30 bg-[linear-gradient(180deg,rgba(176,238,255,0.22),rgba(90,180,255,0.10))]"
                          : "border-white/10 bg-white/[0.03] hover:border-cyan-100/18 hover:bg-white/[0.06]",
                      ].join(" ")}
                    >
                      <div className="text-sm font-semibold text-white">{item.businessName}</div>
                      <div className="mt-1 text-xs text-white/58">{item.industry}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="mb-1 text-xs uppercase tracking-[0.18em] text-white/45">Status</div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full border px-3 py-1 text-sm ${statusTone(client.status)}`}>
                  {client.status}
                </span>
                <span className="text-sm text-white/58">{client.industry}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/68">
            {client.headline}
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {client.kpis.map((item) => (
            <KpiCard key={item.label} item={item} />
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={[
                  "inline-flex items-center gap-2 rounded-[1rem] border px-4 py-2.5 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_18px_44px_rgba(0,0,0,0.24)] transition",
                  active
                    ? "border-cyan-100/30 bg-[linear-gradient(180deg,rgba(176,238,255,0.22),rgba(90,180,255,0.10))] text-white"
                    : "border-white/10 bg-white/[0.03] text-white/70 hover:border-cyan-100/20 hover:text-white",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && <OverviewTab client={client} />}
        {tab === "financials" && <FinancialsTab client={client} />}
        {tab === "customers" && <CustomersTab client={client} />}
        {tab === "operations" && <OperationsTab client={client} />}
        {tab === "forecasting" && <ForecastingTab client={client} />}
        {tab === "recommendations" && <RecommendationsTab client={client} />}
        {tab === "profiler" && <ProfilerTab client={client} />}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Revenue lens",
              value: "Prescriptive",
              icon: TrendingUp,
            },
            {
              label: "Risk lens",
              value: "Confidence-aware",
              icon: Gauge,
            },
            {
              label: "Data lens",
              value: "Profiler integrated",
              icon: Database,
            },
            {
              label: "Positioning",
              value: "Business intelligence system",
              icon: FileBarChart2,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-[1.4rem] border border-white/10 bg-slate-950/45 p-4"
              >
                <div className="mb-3 inline-flex rounded-full border border-white/10 p-2">
                  <Icon className="h-4 w-4 text-cyan-200" />
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                  {item.label}
                </div>
                <div className="mt-2 text-base font-semibold text-white">{item.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}