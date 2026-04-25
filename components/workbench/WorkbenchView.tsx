"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Network,
  Plus,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import { GoalEditorModal, type GoalUpsertPayload } from "./GoalEditorModal";
import { InspectorPanel } from "./InspectorPanel";
import { RelationshipMap } from "./RelationshipMap";
import { TaskDetail } from "./TaskDetail";
import { TaskEditorModal } from "./TaskEditorModal";
import { TaskTable } from "./TaskTable";
import type {
  WorkbenchGoalDTO,
  WorkbenchGoalStatus,
  WorkbenchGoalTaskDTO,
  WorkbenchTaskDTO,
  WorkbenchTaskLinkDTO,
} from "./types";

type WorkbenchTaskUpsert = Omit<WorkbenchTaskDTO, "id" | "mapX" | "mapY">;

type RawWorkbenchTask = {
  id?: unknown;
  title?: unknown;
  client?: unknown;
  dueDate?: unknown;
  assignee?: unknown;
  status?: unknown;
  priority?: unknown;
  mapX?: unknown;
  mapY?: unknown;
};

type RawWorkbenchTaskLink = {
  id?: unknown;
  sourceTaskId?: unknown;
  targetTaskId?: unknown;
};

type RawWorkbenchGoal = {
  id?: unknown;
  title?: unknown;
  purpose?: unknown;
  successMetric?: unknown;
  targetDate?: unknown;
  status?: unknown;
  priority?: unknown;
  mapX?: unknown;
  mapY?: unknown;
};

type RawWorkbenchGoalTask = {
  id?: unknown;
  goalId?: unknown;
  taskId?: unknown;
};

type TasksResponse = {
  tasks: RawWorkbenchTask[];
  links: RawWorkbenchTaskLink[];
  goals: RawWorkbenchGoal[];
  goalTasks: RawWorkbenchGoalTask[];
};

type SaveState = "idle" | "saving" | "saved" | "error";

const STATUS_FILTERS = [
  "All",
  "Open",
  "InProgress",
  "Review",
  "Completed",
  "Overdue",
] as const;

type ShellTabId =
  | "Workbench"
  | "Weekly"
  | "Timeline"
  | "Milestones"
  | "Notes";

const DEFAULT_SHELL_TABS: ShellTabId[] = [
  "Workbench",
  "Weekly",
  "Timeline",
  "Milestones",
  "Notes",
];

const SHELL_TAB_ORDER_STORAGE_KEY = "workbench:shell-tab-order:v1";
const SHELL_ACTIVE_TAB_STORAGE_KEY = "workbench:shell-active-tab:v1";
const WORKBENCH_MAP_WIDE_STORAGE_KEY = "workbench:map-wide:v1";

const DAY_MS = 24 * 60 * 60 * 1000;

const TAB_DESCRIPTIONS: Record<ShellTabId, string> = {
  Workbench:
    "Map tasks and goals visually, inspect relationships, and manage the core execution surface.",
  Weekly:
    "Prioritize what is late, what is imminent, and what needs a due date.",
  Timeline:
    "Reschedule tasks and inspect due-date flow across the active planning window.",
  Milestones:
    "Track gold goals, execution gates, review states, risk items, and completed proof of progress.",
  Notes:
    "Capture task-level decisions, comments, reminders, and execution context.",
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? `Request failed: ${res.status}`
    );
  }

  return data as T;
}

function isWorkbenchTaskStatus(
  value: unknown
): value is WorkbenchTaskDTO["status"] {
  return (
    value === "Open" ||
    value === "InProgress" ||
    value === "Review" ||
    value === "Completed" ||
    value === "Overdue"
  );
}

function isWorkbenchGoalStatus(value: unknown): value is WorkbenchGoalStatus {
  return (
    value === "Planned" ||
    value === "Active" ||
    value === "AtRisk" ||
    value === "Achieved" ||
    value === "Paused"
  );
}

function isWorkbenchTaskPriority(
  value: unknown
): value is WorkbenchTaskDTO["priority"] {
  return value === "Low" || value === "Medium" || value === "High";
}

function mapTask(task: RawWorkbenchTask): WorkbenchTaskDTO {
  return {
    id: String(task.id ?? ""),
    title: String(task.title ?? ""),
    client: String(task.client ?? ""),
    dueDate: task.dueDate
      ? new Date(String(task.dueDate)).toISOString().slice(0, 10)
      : null,
    assignee: String(task.assignee ?? ""),
    status: isWorkbenchTaskStatus(task.status) ? task.status : "Open",
    priority: isWorkbenchTaskPriority(task.priority) ? task.priority : "Medium",
    mapX: typeof task.mapX === "number" ? task.mapX : 40,
    mapY: typeof task.mapY === "number" ? task.mapY : 40,
  };
}

function mapLink(link: RawWorkbenchTaskLink): WorkbenchTaskLinkDTO {
  return {
    id: String(link.id ?? ""),
    sourceTaskId: String(link.sourceTaskId ?? ""),
    targetTaskId: String(link.targetTaskId ?? ""),
  };
}

function mapGoal(goal: RawWorkbenchGoal): WorkbenchGoalDTO {
  return {
    id: String(goal.id ?? ""),
    title: String(goal.title ?? ""),
    purpose: String(goal.purpose ?? ""),
    successMetric:
      goal.successMetric === null || goal.successMetric === undefined
        ? null
        : String(goal.successMetric),
    targetDate: goal.targetDate
      ? new Date(String(goal.targetDate)).toISOString().slice(0, 10)
      : null,
    status: isWorkbenchGoalStatus(goal.status) ? goal.status : "Planned",
    priority: isWorkbenchTaskPriority(goal.priority) ? goal.priority : "Medium",
    mapX: typeof goal.mapX === "number" ? goal.mapX : 80,
    mapY: typeof goal.mapY === "number" ? goal.mapY : 80,
  };
}

function mapGoalTask(item: RawWorkbenchGoalTask): WorkbenchGoalTaskDTO {
  return {
    id: String(item.id ?? ""),
    goalId: String(item.goalId ?? ""),
    taskId: String(item.taskId ?? ""),
  };
}

function isShellTabId(value: unknown): value is ShellTabId {
  return (
    value === "Workbench" ||
    value === "Weekly" ||
    value === "Timeline" ||
    value === "Milestones" ||
    value === "Notes"
  );
}

function isValidShellTabOrder(value: unknown): value is ShellTabId[] {
  if (!Array.isArray(value)) return false;
  if (value.length !== DEFAULT_SHELL_TABS.length) return false;

  const set = new Set(value);

  if (set.size !== DEFAULT_SHELL_TABS.length) return false;

  return DEFAULT_SHELL_TABS.every((tab) => set.has(tab));
}

function parseDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function diffInDays(start: Date, end: Date) {
  return Math.round(
    (startOfDay(end).getTime() - startOfDay(start).getTime()) / DAY_MS
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatShortDueDate(dateString: string | null) {
  if (!dateString) return "Unscheduled";

  return parseDate(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toneForStatus(status: WorkbenchTaskDTO["status"]) {
  switch (status) {
    case "Completed":
      return {
        pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        dot: "bg-emerald-300 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]",
      };
    case "InProgress":
      return {
        pill: "border-sky-500/30 bg-sky-500/10 text-sky-200",
        dot: "bg-sky-300 shadow-[0_0_0_4px_rgba(56,189,248,0.16)]",
      };
    case "Review":
      return {
        pill: "border-amber-500/30 bg-amber-500/10 text-amber-200",
        dot: "bg-amber-300 shadow-[0_0_0_4px_rgba(245,158,11,0.16)]",
      };
    case "Overdue":
      return {
        pill: "border-rose-500/30 bg-rose-500/10 text-rose-200",
        dot: "bg-rose-300 shadow-[0_0_0_4px_rgba(244,63,94,0.18)]",
      };
    default:
      return {
        pill: "border-white/10 bg-white/5 text-white/75",
        dot: "bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.08)]",
      };
  }
}

function toneForGoalStatus(status: WorkbenchGoalDTO["status"]) {
  switch (status) {
    case "Achieved":
      return "border-emerald-900/30 bg-emerald-200/45 text-black";
    case "AtRisk":
      return "border-rose-950/25 bg-rose-200/50 text-black";
    case "Active":
      return "border-sky-950/25 bg-sky-200/45 text-black";
    case "Paused":
      return "border-zinc-950/25 bg-zinc-200/50 text-black";
    default:
      return "border-black/15 bg-black/10 text-black";
  }
}

function moveTab(order: ShellTabId[], fromId: ShellTabId, toId: ShellTabId) {
  const next = [...order];
  const fromIndex = next.indexOf(fromId);
  const toIndex = next.indexOf(toId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return order;
  }

  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next;
}

function SaveStateBadge({ value }: { value: SaveState }) {
  if (value === "saving") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100">
        <Save className="h-3.5 w-3.5 animate-pulse" />
        Saving
      </span>
    );
  }

  if (value === "error") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-100">
        <AlertCircle className="h-3.5 w-3.5" />
        Save failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Saved
    </span>
  );
}

function ShellTabs({
  value,
  order,
  onChange,
  onReorder,
}: {
  value: ShellTabId;
  order: ShellTabId[];
  onChange: (tab: ShellTabId) => void;
  onReorder: (next: ShellTabId[]) => void;
}) {
  const [draggingId, setDraggingId] = useState<ShellTabId | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {order.map((tab) => {
        const active = value === tab;

        return (
          <button
            key={tab}
            type="button"
            draggable
            onClick={() => onChange(tab)}
            onDragStart={() => setDraggingId(tab)}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(event) => {
              if (!draggingId || draggingId === tab) return;
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (!draggingId || draggingId === tab) return;

              onReorder(moveTab(order, draggingId, tab));
              setDraggingId(null);
            }}
            title="Drag to reorder"
            className={[
              "rounded-xl border px-3 py-2 text-xs font-semibold transition",
              active
                ? "border-white/15 bg-white/10 text-white"
                : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/5 hover:text-white/85",
              draggingId === tab ? "opacity-70" : "",
            ].join(" ")}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5">
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">{body}</p>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function WorkbenchStatCard({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  helper: string;
  tone?: "neutral" | "sky" | "rose" | "amber" | "emerald" | "gold";
}) {
  const toneClass =
    tone === "sky"
      ? "border-sky-500/20 bg-sky-500/5"
      : tone === "rose"
        ? "border-rose-500/20 bg-rose-500/5"
        : tone === "amber"
          ? "border-amber-500/20 bg-amber-500/5"
          : tone === "emerald"
            ? "border-emerald-500/20 bg-emerald-500/5"
            : tone === "gold"
              ? "border-yellow-400/20 bg-yellow-400/8"
              : "border-white/10 bg-white/[0.03]";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/55">{helper}</div>
    </div>
  );
}

function GoldButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-300/30 bg-[linear-gradient(135deg,#fde68a,#f59e0b,#92400e)] px-3 py-2 text-sm font-black text-black shadow-[0_14px_40px_rgba(245,158,11,0.22)] transition hover:brightness-110"
    >
      {children}
    </button>
  );
}

function GoalCard({
  goal,
  attachedTasks,
  active,
  onSelect,
  onEdit,
  onDelete,
}: {
  goal: WorkbenchGoalDTO;
  attachedTasks: WorkbenchTaskDTO[];
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const completedCount = attachedTasks.filter(
    (task) => task.status === "Completed"
  ).length;
  const progress =
    attachedTasks.length === 0
      ? 0
      : Math.round((completedCount / attachedTasks.length) * 100);

  return (
    <div
      className={[
        "rounded-2xl border p-4 text-black shadow-[0_18px_45px_rgba(245,158,11,0.18)]",
        "bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.75),rgba(255,255,255,0)_32%),linear-gradient(135deg,#fde68a_0%,#f59e0b_52%,#92400e_100%)]",
        active ? "ring-2 ring-yellow-100" : "",
      ].join(" ")}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] opacity-70">
              Goal
            </div>
            <div className="mt-1 text-base font-black leading-5">
              {goal.title}
            </div>
          </div>

          <span
            className={[
              "rounded-full border px-2 py-0.5 text-[10px] font-black",
              toneForGoalStatus(goal.status),
            ].join(" ")}
          >
            {goal.status}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-xs font-semibold opacity-75">
          {goal.purpose}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-black">
          <div className="rounded-xl border border-black/10 bg-black/8 px-2 py-2">
            <div>{attachedTasks.length}</div>
            <div className="opacity-65">tasks</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-black/8 px-2 py-2">
            <div>{progress}%</div>
            <div className="opacity-65">done</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-black/8 px-2 py-2">
            <div>{goal.targetDate ? formatShortDueDate(goal.targetDate) : "—"}</div>
            <div className="opacity-65">target</div>
          </div>
        </div>
      </button>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl border border-black/10 bg-black/10 px-3 py-1.5 text-xs font-black text-black hover:bg-black/15"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl border border-black/10 bg-black/10 px-3 py-1.5 text-xs font-black text-black hover:bg-black/15"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function WeeklyView({
  tasks,
  selectedTaskId,
  onSelectTask,
  onCreateTask,
}: {
  tasks: WorkbenchTaskDTO[];
  selectedTaskId?: string;
  onSelectTask?: (taskId: string) => void;
  onCreateTask?: () => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const weekEnd = useMemo(() => addDays(today, 7), [today]);

  const buckets = useMemo(() => {
    const overdue: WorkbenchTaskDTO[] = [];
    const next7: WorkbenchTaskDTO[] = [];
    const later: WorkbenchTaskDTO[] = [];
    const unscheduled: WorkbenchTaskDTO[] = [];

    for (const task of tasks) {
      if (!task.dueDate) {
        unscheduled.push(task);
        continue;
      }

      const due = startOfDay(parseDate(task.dueDate));

      if (due < today && task.status !== "Completed") {
        overdue.push(task);
        continue;
      }

      if (due <= weekEnd) {
        next7.push(task);
        continue;
      }

      later.push(task);
    }

    const byDueDate = (a: WorkbenchTaskDTO, b: WorkbenchTaskDTO) => {
      if (!a.dueDate && !b.dueDate) return a.title.localeCompare(b.title);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime();
    };

    overdue.sort(byDueDate);
    next7.sort(byDueDate);
    later.sort(byDueDate);
    unscheduled.sort((a, b) => a.title.localeCompare(b.title));

    return [
      {
        title: "Overdue",
        subtitle: "Past due and still open",
        tasks: overdue,
      },
      {
        title: "Next 7 days",
        subtitle: "The immediate execution horizon",
        tasks: next7,
      },
      {
        title: "Beyond this week",
        subtitle: "Scheduled, but not urgent yet",
        tasks: later,
      },
      {
        title: "Unscheduled",
        subtitle: "Needs a due date before planning is trustworthy",
        tasks: unscheduled,
      },
    ];
  }, [tasks, today, weekEnd]);

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No weekly plan yet"
        body="Create tasks and assign due dates. The weekly view will automatically separate overdue work, near-term work, future work, and unscheduled items."
        actionLabel="Create first task"
        onAction={onCreateTask}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <WorkbenchStatCard
          label="Horizon"
          value="Weekly"
          helper="Focused execution view"
        />
        <WorkbenchStatCard
          label="Critical"
          value={buckets[0]?.tasks.length ?? 0}
          helper="Overdue tasks"
          tone="rose"
        />
        <WorkbenchStatCard
          label="Immediate"
          value={buckets[1]?.tasks.length ?? 0}
          helper="Due within 7 days"
          tone="sky"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {buckets.map((bucket) => (
          <section
            key={bucket.title}
            className="rounded-3xl border border-white/10 bg-[#070A10] p-4"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {bucket.title}
                </h3>
                <p className="mt-1 text-xs text-white/45">{bucket.subtitle}</p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                {bucket.tasks.length}
              </div>
            </div>

            {bucket.tasks.length === 0 ? (
              <EmptyState
                title="No tasks in this bucket"
                body="As tasks get dates and status updates, this section will populate automatically."
              />
            ) : (
              <div className="space-y-2">
                {bucket.tasks.map((task) => {
                  const active = selectedTaskId === task.id;
                  const tone = toneForStatus(task.status);

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onSelectTask?.(task.id)}
                      className={[
                        "w-full rounded-2xl border p-3 text-left transition",
                        active
                          ? "border-sky-300/45 bg-sky-300/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">
                            {task.title}
                          </div>
                          <div className="mt-1 text-xs text-white/50">
                            {task.client} • {task.assignee}
                          </div>
                        </div>

                        <div
                          className={[
                            "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            tone.pill,
                          ].join(" ")}
                        >
                          {task.status}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-white/55">
                        <span>Due {formatShortDueDate(task.dueDate)}</span>
                        <span>Priority {task.priority}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function LinearTimelineView({
  tasks,
  selectedTaskId,
  onSelectTask,
  onUpdateTask,
  onCreateTask,
}: {
  tasks: WorkbenchTaskDTO[];
  selectedTaskId?: string;
  onSelectTask?: (taskId: string) => void;
  onUpdateTask?: (
    taskId: string,
    patch: Partial<WorkbenchTaskUpsert>
  ) => Promise<void>;
  onCreateTask?: () => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);

  const scheduled = useMemo(() => {
    return tasks
      .filter((task) => Boolean(task.dueDate))
      .map((task) => ({
        task,
        due: parseDate(task.dueDate as string),
      }))
      .sort((a, b) => a.due.getTime() - b.due.getTime());
  }, [tasks]);

  const unscheduled = useMemo(
    () => tasks.filter((task) => !task.dueDate),
    [tasks]
  );

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  const windowStart = useMemo(() => {
    const first = scheduled[0];

    if (!first) return addDays(today, -7);

    const paddedEarliest = addDays(first.due, -5);

    return paddedEarliest < addDays(today, -7)
      ? paddedEarliest
      : addDays(today, -7);
  }, [scheduled, today]);

  const windowEnd = useMemo(() => {
    const last = scheduled[scheduled.length - 1];

    if (!last) return addDays(today, 21);

    const paddedLatest = addDays(last.due, 10);

    return paddedLatest > addDays(today, 21)
      ? paddedLatest
      : addDays(today, 21);
  }, [scheduled, today]);

  const totalDays = useMemo(
    () => Math.max(1, diffInDays(windowStart, windowEnd)),
    [windowStart, windowEnd]
  );

  const todayPercent = useMemo(() => {
    const days = diffInDays(windowStart, today);
    return Math.min(100, Math.max(0, (days / totalDays) * 100));
  }, [windowStart, today, totalDays]);

  const ticks = useMemo(() => {
    const values: Date[] = [];

    for (let offset = 0; offset <= totalDays; offset += 7) {
      values.push(addDays(windowStart, offset));
    }

    const lastTick = values[values.length - 1];

    if (!lastTick || diffInDays(lastTick, windowEnd) > 0) {
      values.push(windowEnd);
    }

    return values;
  }, [windowStart, windowEnd, totalDays]);

  const dueThisWeek = useMemo(() => {
    const sevenDaysOut = addDays(today, 7);

    return scheduled.filter(
      ({ due, task }) =>
        due >= today && due <= sevenDaysOut && task.status !== "Completed"
    ).length;
  }, [scheduled, today]);

  const overdueCount = useMemo(() => {
    return scheduled.filter(
      ({ due, task }) => due < today && task.status !== "Completed"
    ).length;
  }, [scheduled, today]);

  const positionForDate = (date: Date) => {
    const days = diffInDays(windowStart, date);
    return Math.min(100, Math.max(0, (days / totalDays) * 100));
  };

  const rescheduleSelectedTask = async (dueDate: string | null) => {
    if (!selectedTask || !onUpdateTask) return;

    await onUpdateTask(selectedTask.id, { dueDate });
  };

  const shiftSelectedTask = async (days: number) => {
    if (!selectedTask || !onUpdateTask) return;

    const base = selectedTask.dueDate ? parseDate(selectedTask.dueDate) : today;
    const next = addDays(base, days);

    await onUpdateTask(selectedTask.id, { dueDate: toInputDate(next) });
  };

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No timeline yet"
        body="Create tasks and assign due dates. The timeline becomes useful once tasks have a committed schedule."
        actionLabel="Create first task"
        onAction={onCreateTask}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <WorkbenchStatCard
          label="View"
          value="Timeline"
          helper="Due-date driven planning"
        />
        <WorkbenchStatCard
          label="Risk"
          value={overdueCount}
          helper="Overdue tasks"
          tone="rose"
        />
        <WorkbenchStatCard
          label="Near-term"
          value={dueThisWeek}
          helper="Due within 7 days"
          tone="sky"
        />
        <WorkbenchStatCard
          label="Unscheduled"
          value={unscheduled.length}
          helper="Needs commitment"
        />
      </div>

      <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                Timeline control
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                {selectedTask ? selectedTask.title : "No task selected"}
              </div>
              <div className="mt-1 text-xs text-white/50">
                Select a task, then reschedule it here. This writes back to the
                task record.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={selectedTask?.dueDate ?? ""}
                disabled={!selectedTask || !onUpdateTask}
                onChange={(event) => {
                  void rescheduleSelectedTask(event.target.value || null);
                }}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />

              <button
                type="button"
                disabled={!selectedTask || !onUpdateTask}
                onClick={() => {
                  void shiftSelectedTask(1);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +1 day
              </button>

              <button
                type="button"
                disabled={!selectedTask || !onUpdateTask}
                onClick={() => {
                  void shiftSelectedTask(7);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +1 week
              </button>

              <button
                type="button"
                disabled={!selectedTask || !onUpdateTask}
                onClick={() => {
                  void rescheduleSelectedTask(null);
                }}
                className="rounded-xl border border-rose-500/20 bg-rose-500/8 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/14 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear date
              </button>
            </div>
          </div>
        </div>

        {!scheduled.length ? (
          <EmptyState
            title="No scheduled tasks yet"
            body="Add due dates and the timeline becomes useful. Unscheduled tasks are still visible below."
          />
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_1fr_110px] md:items-end">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Scheduled tasks
                </h3>
                <p className="mt-1 text-xs text-white/45">
                  Click any row to sync task selection.
                </p>
              </div>

              <div className="relative h-8">
                {ticks.map((tick) => {
                  const left = positionForDate(tick);

                  return (
                    <div
                      key={tick.toISOString()}
                      className="absolute bottom-0 top-0"
                      style={{ left: `${left}%` }}
                    >
                      <div className="h-full w-px bg-white/10" />
                      <div className="mt-1 -translate-x-1/2 text-[10px] uppercase tracking-[0.14em] text-white/35">
                        {formatDate(tick)}
                      </div>
                    </div>
                  );
                })}

                <div
                  className="absolute bottom-0 top-0"
                  style={{ left: `${todayPercent}%` }}
                >
                  <div className="h-full w-px bg-sky-300/60" />
                  <div className="mt-1 -translate-x-1/2 rounded-full border border-sky-300/20 bg-sky-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100">
                    Today
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] uppercase tracking-[0.18em] text-white/40">
                Due date
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {scheduled.map(({ task, due }) => {
                const left = positionForDate(due);
                const active = selectedTaskId === task.id;
                const tone = toneForStatus(task.status);

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onSelectTask?.(task.id)}
                    className={[
                      "grid w-full gap-3 rounded-2xl border p-3 text-left transition md:grid-cols-[minmax(0,220px)_1fr_110px] md:items-center",
                      active
                        ? "border-sky-300/45 bg-sky-300/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        {task.title}
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        {task.client} • {task.assignee}
                      </div>
                      <div
                        className={[
                          "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                          tone.pill,
                        ].join(" ")}
                      >
                        {task.status}
                      </div>
                    </div>

                    <div className="relative h-10">
                      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />

                      {ticks.map((tick) => (
                        <div
                          key={`${task.id}-${tick.toISOString()}`}
                          className="absolute bottom-0 top-0 w-px bg-white/5"
                          style={{ left: `${positionForDate(tick)}%` }}
                        />
                      ))}

                      <div
                        className="absolute bottom-0 top-0 w-px bg-sky-300/25"
                        style={{ left: `${todayPercent}%` }}
                      />

                      <div
                        className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-white/8"
                        style={{ width: `${left}%` }}
                      />

                      <div
                        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/30"
                        style={{ left: `${left}%` }}
                      >
                        <div
                          className={[
                            "h-full w-full rounded-full",
                            tone.dot,
                          ].join(" ")}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {formatDate(due)}
                      </div>
                      <div className="mt-1 text-xs text-white/45">
                        Priority {task.priority}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function MilestonesView({
  tasks,
  goals,
  goalTasks,
  selectedTaskId,
  selectedGoalId,
  onSelectTask,
  onSelectGoal,
  onEditTask,
  onEditGoal,
  onCreateTask,
  onCreateGoal,
}: {
  tasks: WorkbenchTaskDTO[];
  goals: WorkbenchGoalDTO[];
  goalTasks: WorkbenchGoalTaskDTO[];
  selectedTaskId?: string;
  selectedGoalId?: string;
  onSelectTask?: (taskId: string) => void;
  onSelectGoal?: (goalId: string) => void;
  onEditTask?: (taskId: string) => void;
  onEditGoal?: (goalId: string) => void;
  onCreateTask?: () => void;
  onCreateGoal?: () => void;
}) {
  const taskById = useMemo(() => {
    return new Map(tasks.map((task) => [task.id, task]));
  }, [tasks]);

  const tasksByGoal = useMemo(() => {
    const map = new Map<string, WorkbenchTaskDTO[]>();

    for (const link of goalTasks) {
      const task = taskById.get(link.taskId);
      if (!task) continue;

      const existing = map.get(link.goalId) ?? [];
      existing.push(task);
      map.set(link.goalId, existing);
    }

    return map;
  }, [goalTasks, taskById]);

  const completed = tasks.filter((task) => task.status === "Completed");
  const inProgress = tasks.filter((task) => task.status === "InProgress");
  const review = tasks.filter((task) => task.status === "Review");
  const overdue = tasks.filter((task) => task.status === "Overdue");
  const highPriority = tasks.filter((task) => task.priority === "High");

  const completionRate =
    tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100);

  const riskTasks = [
    ...new Map(
      [...overdue, ...highPriority].map((task) => [task.id, task])
    ).values(),
  ];

  const milestoneGroups = [
    {
      title: "Execution",
      subtitle: "Open or in-progress work that still needs movement",
      tasks: tasks.filter(
        (task) => task.status === "Open" || task.status === "InProgress"
      ),
    },
    {
      title: "Review gate",
      subtitle: "Items waiting for decision, QA, or owner approval",
      tasks: review,
    },
    {
      title: "Risk gate",
      subtitle: "Overdue or high-priority work that can block demos",
      tasks: riskTasks,
    },
    {
      title: "Completed",
      subtitle: "Finished work that can be used as proof of progress",
      tasks: completed,
    },
  ];

  if (tasks.length === 0 && goals.length === 0) {
    return (
      <EmptyState
        title="No milestones or goals yet"
        body="Create a gold goal and attach tasks to it. Goals become the parent objects for major outcomes, while tasks remain the execution units."
        actionLabel="Create first goal"
        onAction={onCreateGoal}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-5">
        <WorkbenchStatCard
          label="Goals"
          value={goals.length}
          helper="Gold parent objects"
          tone="gold"
        />
        <WorkbenchStatCard
          label="Completion"
          value={`${completionRate}%`}
          helper={`${completed.length} of ${tasks.length} tasks`}
          tone="emerald"
        />
        <WorkbenchStatCard
          label="In progress"
          value={inProgress.length}
          helper="Active execution"
          tone="sky"
        />
        <WorkbenchStatCard
          label="Review"
          value={review.length}
          helper="Decision gate"
          tone="amber"
        />
        <WorkbenchStatCard
          label="Risk"
          value={overdue.length}
          helper="Overdue tasks"
          tone="rose"
        />
      </div>

      <section className="rounded-3xl border border-yellow-300/15 bg-[#070A10] p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-200/65">
              Gold goals
            </div>
            <h3 className="mt-1 text-sm font-semibold text-white">
              Major outcomes
            </h3>
            <p className="mt-1 text-xs text-white/45">
              Goals are shiny gold map objects. Attach many tasks to a goal by
              dragging a connection between them on the map.
            </p>
          </div>

          {onCreateGoal ? (
            <GoldButton onClick={onCreateGoal}>
              <Plus className="h-4 w-4" />
              Create Goal
            </GoldButton>
          ) : null}
        </div>

        {goals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            body="Create a goal to define a bigger outcome, then attach tasks to it on the map."
            actionLabel="Create goal"
            onAction={onCreateGoal}
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                attachedTasks={tasksByGoal.get(goal.id) ?? []}
                active={selectedGoalId === goal.id}
                onSelect={() => onSelectGoal?.(goal.id)}
                onEdit={() => onEditGoal?.(goal.id)}
                onDelete={() => onEditGoal?.(goal.id)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {milestoneGroups.map((group) => (
          <section
            key={group.title}
            className="rounded-3xl border border-white/10 bg-[#070A10] p-4"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {group.title}
                </h3>
                <p className="mt-1 text-xs text-white/45">{group.subtitle}</p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                {group.tasks.length}
              </div>
            </div>

            {group.tasks.length === 0 ? (
              <EmptyState
                title="No tasks in this milestone group"
                body="This section fills automatically as tasks change status and priority."
              />
            ) : (
              <div className="space-y-2">
                {group.tasks.map((task) => {
                  const active = selectedTaskId === task.id;
                  const tone = toneForStatus(task.status);

                  return (
                    <div
                      key={`${group.title}-${task.id}`}
                      className={[
                        "rounded-2xl border p-3 transition",
                        active
                          ? "border-sky-300/45 bg-sky-300/10"
                          : "border-white/10 bg-white/[0.03]",
                      ].join(" ")}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectTask?.(task.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">
                              {task.title}
                            </div>
                            <div className="mt-1 text-xs text-white/50">
                              {task.client} • {task.assignee}
                            </div>
                          </div>

                          <span
                            className={[
                              "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                              tone.pill,
                            ].join(" ")}
                          >
                            {task.status}
                          </span>
                        </div>
                      </button>

                      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-white/55">
                        <span>Due {formatShortDueDate(task.dueDate)}</span>
                        <button
                          type="button"
                          onClick={() => onEditTask?.(task.id)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/75 hover:bg-white/10"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function NotesView({
  tasks,
  selectedTask,
  selectedTaskId,
  onSelectTask,
  onEditTask,
  onCreateTask,
}: {
  tasks: WorkbenchTaskDTO[];
  selectedTask?: WorkbenchTaskDTO;
  selectedTaskId?: string;
  onSelectTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onCreateTask?: () => void;
}) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return a.title.localeCompare(b.title);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime();
    });
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No notes yet"
        body="Create a task first. Each task gets its own persistent conversation log through the comments system."
        actionLabel="Create first task"
        onAction={onCreateTask}
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white">Task notes</h3>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Select a task to open its conversation log. Notes are stored as
            Workbench comments, so they persist through reloads.
          </p>
        </div>

        <div className="max-h-[720px] space-y-2 overflow-y-auto pr-1">
          {sortedTasks.map((task) => {
            const active = task.id === selectedTaskId;
            const tone = toneForStatus(task.status);

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelectTask?.(task.id)}
                className={[
                  "w-full rounded-2xl border p-3 text-left transition",
                  active
                    ? "border-sky-300/45 bg-sky-300/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                ].join(" ")}
              >
                <div className="truncate text-sm font-semibold text-white">
                  {task.title}
                </div>

                <div className="mt-1 text-xs text-white/50">
                  {task.client} • Due {formatShortDueDate(task.dueDate)}
                </div>

                <div
                  className={[
                    "mt-3 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                    tone.pill,
                  ].join(" ")}
                >
                  {task.status}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Conversation log
            </h3>
            <p className="mt-1 text-xs text-white/45">
              Notes, decisions, and task comments for the selected work item.
            </p>
          </div>

          {selectedTask ? (
            <button
              type="button"
              onClick={() => onEditTask?.(selectedTask.id)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Edit task
            </button>
          ) : null}
        </div>

        <TaskDetail
          task={selectedTask}
          onEdit={
            selectedTask ? () => onEditTask?.(selectedTask.id) : undefined
          }
        />
      </section>
    </div>
  );
}

export default function WorkbenchView() {
  const [loading, setLoading] = useState(true);
  const [tasksRaw, setTasksRaw] = useState<WorkbenchTaskDTO[]>([]);
  const [linksRaw, setLinksRaw] = useState<WorkbenchTaskLinkDTO[]>([]);
  const [goalsRaw, setGoalsRaw] = useState<WorkbenchGoalDTO[]>([]);
  const [goalTasksRaw, setGoalTasksRaw] = useState<WorkbenchGoalTaskDTO[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("All");
  const [selectedId, setSelectedId] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [shellTab, setShellTab] = useState<ShellTabId>("Workbench");
  const [shellTabOrder, setShellTabOrder] =
    useState<ShellTabId[]>(DEFAULT_SHELL_TABS);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [goalEditorOpen, setGoalEditorOpen] = useState(false);
  const [goalEditorMode, setGoalEditorMode] =
    useState<"create" | "edit">("create");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [mapWide, setMapWide] = useState(false);

  const markSaved = useCallback(() => {
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 1600);
  }, []);

  const markSaveError = useCallback(() => {
    setSaveState("error");
  }, []);

  const loadWorkbench = useCallback(async () => {
    const { tasks, links, goals, goalTasks } =
      await api<TasksResponse>("/api/workbench/tasks");

    const mappedTasks = tasks.map(mapTask);
    const mappedLinks = links.map(mapLink);
    const mappedGoals = goals.map(mapGoal);
    const mappedGoalTasks = goalTasks.map(mapGoalTask);

    setTasksRaw(mappedTasks);
    setLinksRaw(mappedLinks);
    setGoalsRaw(mappedGoals);
    setGoalTasksRaw(mappedGoalTasks);
    setSelectedId((prev) => prev || mappedTasks[0]?.id || "");
    setSelectedGoalId((prev) => prev || mappedGoals[0]?.id || "");
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const { tasks, links, goals, goalTasks } =
          await api<TasksResponse>("/api/workbench/tasks");

        if (!mounted) return;

        const mappedTasks = tasks.map(mapTask);
        const mappedLinks = links.map(mapLink);
        const mappedGoals = goals.map(mapGoal);
        const mappedGoalTasks = goalTasks.map(mapGoalTask);

        setTasksRaw(mappedTasks);
        setLinksRaw(mappedLinks);
        setGoalsRaw(mappedGoals);
        setGoalTasksRaw(mappedGoalTasks);
        setSelectedId((prev) => prev || mappedTasks[0]?.id || "");
        setSelectedGoalId((prev) => prev || mappedGoals[0]?.id || "");
      } catch (error) {
        console.error("Failed to load workbench", error);
        markSaveError();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [markSaveError]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawOrder = window.localStorage.getItem(SHELL_TAB_ORDER_STORAGE_KEY);
      const rawActive = window.localStorage.getItem(SHELL_ACTIVE_TAB_STORAGE_KEY);

      if (rawOrder) {
        const parsed = JSON.parse(rawOrder) as unknown;

        if (isValidShellTabOrder(parsed)) {
          setShellTabOrder(parsed);
        }
      }

      if (rawActive && isShellTabId(rawActive)) {
        setShellTab(rawActive);
      }
    } catch (error) {
      console.error("Failed to restore workbench shell tabs", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(WORKBENCH_MAP_WIDE_STORAGE_KEY);
    setMapWide(stored === "true");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      SHELL_TAB_ORDER_STORAGE_KEY,
      JSON.stringify(shellTabOrder)
    );
  }, [shellTabOrder]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(SHELL_ACTIVE_TAB_STORAGE_KEY, shellTab);
  }, [shellTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(WORKBENCH_MAP_WIDE_STORAGE_KEY, String(mapWide));
  }, [mapWide]);



  const selected = useMemo(
    () => tasksRaw.find((task) => task.id === selectedId) ?? tasksRaw[0],
    [tasksRaw, selectedId]
  );

  const selectedGoal = useMemo(
    () => goalsRaw.find((goal) => goal.id === selectedGoalId) ?? goalsRaw[0],
    [goalsRaw, selectedGoalId]
  );

  const tasks = useMemo(() => {
    return tasksRaw
      .filter((task) =>
        statusFilter === "All" ? true : task.status === statusFilter
      )
      .filter((task) => {
        if (!query.trim()) return true;

        const q = query.toLowerCase();

        return (
          task.title.toLowerCase().includes(q) ||
          task.client.toLowerCase().includes(q) ||
          task.assignee.toLowerCase().includes(q)
        );
      });
  }, [tasksRaw, query, statusFilter]);

  const goals = useMemo(() => {
    return goalsRaw.filter((goal) => {
      if (!query.trim()) return true;

      const q = query.toLowerCase();

      return (
        goal.title.toLowerCase().includes(q) ||
        goal.purpose.toLowerCase().includes(q) ||
        (goal.successMetric ?? "").toLowerCase().includes(q)
      );
    });
  }, [goalsRaw, query]);

  const visibleTaskIds = useMemo(
    () => new Set(tasks.map((task) => task.id)),
    [tasks]
  );

  const visibleGoalIds = useMemo(
    () => new Set(goals.map((goal) => goal.id)),
    [goals]
  );

  const visibleLinks = useMemo(() => {
    return linksRaw.filter(
      (link) =>
        visibleTaskIds.has(link.sourceTaskId) &&
        visibleTaskIds.has(link.targetTaskId)
    );
  }, [linksRaw, visibleTaskIds]);

  const visibleGoalTasks = useMemo(() => {
    return goalTasksRaw.filter(
      (item) => visibleGoalIds.has(item.goalId) && visibleTaskIds.has(item.taskId)
    );
  }, [goalTasksRaw, visibleGoalIds, visibleTaskIds]);

  const taskById = useMemo(() => {
    return new Map(tasksRaw.map((task) => [task.id, task]));
  }, [tasksRaw]);

  const tasksByGoal = useMemo(() => {
    const map = new Map<string, WorkbenchTaskDTO[]>();

    for (const item of goalTasksRaw) {
      const task = taskById.get(item.taskId);
      if (!task) continue;

      const existing = map.get(item.goalId) ?? [];
      existing.push(task);
      map.set(item.goalId, existing);
    }

    return map;
  }, [goalTasksRaw, taskById]);

  const summary = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, 7);

    const overdue = tasksRaw.filter((task) => {
      if (!task.dueDate || task.status === "Completed") return false;
      return startOfDay(parseDate(task.dueDate)) < today;
    }).length;

    const dueThisWeek = tasksRaw.filter((task) => {
      if (!task.dueDate || task.status === "Completed") return false;

      const due = startOfDay(parseDate(task.dueDate));
      return due >= today && due <= weekEnd;
    }).length;

    return {
      total: tasksRaw.length,
      goals: goalsRaw.length,
      overdue,
      dueThisWeek,
      review: tasksRaw.filter((task) => task.status === "Review").length,
      completed: tasksRaw.filter((task) => task.status === "Completed").length,
    };
  }, [goalsRaw.length, tasksRaw]);

  const openCreate = () => {
    setEditorMode("create");
    setEditorOpen(true);
  };

  const openEdit = (taskId: string) => {
    setSelectedId(taskId);
    setEditorMode("edit");
    setEditorOpen(true);
  };

  const openCreateGoal = () => {
    setGoalEditorMode("create");
    setGoalEditorOpen(true);
  };

  const openEditGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setGoalEditorMode("edit");
    setGoalEditorOpen(true);
  };

  const createTask = async (payload: WorkbenchTaskUpsert) => {
    setSaveState("saving");

    try {
      const { task } = await api<{ task: RawWorkbenchTask }>(
        "/api/workbench/tasks",
        {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            dueDate: payload.dueDate ? payload.dueDate : null,
          }),
        }
      );

      const mapped = mapTask(task);

      setTasksRaw((prev) => [mapped, ...prev]);
      setSelectedId(mapped.id);
      markSaved();
    } catch (error) {
      markSaveError();
      throw error;
    }
  };

  const updateTask = async (
    taskId: string,
    patch: Partial<WorkbenchTaskUpsert>
  ) => {
    setSaveState("saving");

    try {
      const { task } = await api<{ task: RawWorkbenchTask }>(
        `/api/workbench/tasks/${taskId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...patch,
            dueDate:
              patch.dueDate !== undefined
                ? patch.dueDate
                  ? patch.dueDate
                  : null
                : undefined,
          }),
        }
      );

      const mapped = mapTask(task);

      setTasksRaw((prev) =>
        prev.map((existing) => (existing.id === taskId ? mapped : existing))
      );

      markSaved();
    } catch (error) {
      markSaveError();
      throw error;
    }
  };

  const createGoal = async (payload: GoalUpsertPayload) => {
    setSaveState("saving");

    try {
      const { goal } = await api<{ goal: RawWorkbenchGoal }>(
        "/api/workbench/goals",
        {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            targetDate: payload.targetDate ? payload.targetDate : null,
          }),
        }
      );

      const mapped = mapGoal(goal);

      setGoalsRaw((prev) => [mapped, ...prev]);
      setSelectedGoalId(mapped.id);
      markSaved();
    } catch (error) {
      markSaveError();
      throw error;
    }
  };

  const updateGoal = async (
    goalId: string,
    patch: Partial<GoalUpsertPayload>
  ) => {
    setSaveState("saving");

    try {
      const { goal } = await api<{ goal: RawWorkbenchGoal }>(
        `/api/workbench/goals/${goalId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...patch,
            targetDate:
              patch.targetDate !== undefined
                ? patch.targetDate
                  ? patch.targetDate
                  : null
                : undefined,
          }),
        }
      );

      const mapped = mapGoal(goal);

      setGoalsRaw((prev) =>
        prev.map((existing) => (existing.id === goalId ? mapped : existing))
      );

      markSaved();
    } catch (error) {
      markSaveError();
      throw error;
    }
  };

  const updateTaskPosition = async (
    taskId: string,
    mapX: number,
    mapY: number
  ) => {
    setTasksRaw((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, mapX, mapY } : task
      )
    );

    setSaveState("saving");

    try {
      await api<{ task: RawWorkbenchTask }>(`/api/workbench/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ mapX, mapY }),
      });

      markSaved();
    } catch (error) {
      console.error("Failed to persist task position", error);
      markSaveError();
      await loadWorkbench();
    }
  };

  const updateGoalPosition = async (
    goalId: string,
    mapX: number,
    mapY: number
  ) => {
    setGoalsRaw((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, mapX, mapY } : goal
      )
    );

    setSaveState("saving");

    try {
      await api<{ goal: RawWorkbenchGoal }>(`/api/workbench/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify({ mapX, mapY }),
      });

      markSaved();
    } catch (error) {
      console.error("Failed to persist goal position", error);
      markSaveError();
      await loadWorkbench();
    }
  };

  const createLink = async (sourceTaskId: string, targetTaskId: string) => {
    setSaveState("saving");

    try {
      const { link } = await api<{ link: RawWorkbenchTaskLink }>(
        "/api/workbench/task-links",
        {
          method: "POST",
          body: JSON.stringify({ sourceTaskId, targetTaskId }),
        }
      );

      const mapped = mapLink(link);

      setLinksRaw((prev) => {
        const exists = prev.some(
          (existing) =>
            existing.id === mapped.id ||
            (existing.sourceTaskId === mapped.sourceTaskId &&
              existing.targetTaskId === mapped.targetTaskId)
        );

        return exists ? prev : [...prev, mapped];
      });

      markSaved();
    } catch (error) {
      markSaveError();
      throw error;
    }
  };

  const createGoalTask = async (goalId: string, taskId: string) => {
    setSaveState("saving");

    try {
      const { goalTask } = await api<{ goalTask: RawWorkbenchGoalTask }>(
        "/api/workbench/goal-tasks",
        {
          method: "POST",
          body: JSON.stringify({ goalId, taskId }),
        }
      );

      const mapped = mapGoalTask(goalTask);

      setGoalTasksRaw((prev) => {
        const exists = prev.some(
          (existing) =>
            existing.id === mapped.id ||
            (existing.goalId === mapped.goalId &&
              existing.taskId === mapped.taskId)
        );

        return exists ? prev : [...prev, mapped];
      });

      markSaved();
    } catch (error) {
      markSaveError();
      throw error;
    }
  };

  const deleteLink = async (linkId: string) => {
    const previous = linksRaw;

    setLinksRaw((prev) => prev.filter((link) => link.id !== linkId));
    setSaveState("saving");

    try {
      await api(`/api/workbench/task-links/${linkId}`, {
        method: "DELETE",
      });

      markSaved();
    } catch (error) {
      console.error("Failed to delete link", error);
      setLinksRaw(previous);
      markSaveError();
    }
  };

  const deleteGoalTask = async (goalTaskId: string) => {
    const previous = goalTasksRaw;

    setGoalTasksRaw((prev) => prev.filter((item) => item.id !== goalTaskId));
    setSaveState("saving");

    try {
      await api(`/api/workbench/goal-tasks/${goalTaskId}`, {
        method: "DELETE",
      });

      markSaved();
    } catch (error) {
      console.error("Failed to delete goal attachment", error);
      setGoalTasksRaw(previous);
      markSaveError();
    }
  };

  const deleteTask = async (taskId: string) => {
    const task = tasksRaw.find((item) => item.id === taskId);
    const label = task?.title ? `"${task.title}"` : "this task";

    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete ${label}? This also removes its links and comments.`)
    ) {
      return;
    }

    setSaveState("saving");

    try {
      await api(`/api/workbench/tasks/${taskId}`, {
        method: "DELETE",
      });

      setTasksRaw((prev) => prev.filter((task) => task.id !== taskId));
      setLinksRaw((prev) =>
        prev.filter(
          (link) =>
            link.sourceTaskId !== taskId && link.targetTaskId !== taskId
        )
      );
      setGoalTasksRaw((prev) => prev.filter((item) => item.taskId !== taskId));
      setSelectedId((prev) => (prev === taskId ? "" : prev));
      markSaved();
    } catch (error) {
      markSaveError();
      throw error;
    }
  };

  const deleteGoal = async (goalId: string) => {
    const goal = goalsRaw.find((item) => item.id === goalId);
    const label = goal?.title ? `"${goal.title}"` : "this goal";

    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete ${label}? This removes its goal-task attachments.`)
    ) {
      return;
    }

    setSaveState("saving");

    try {
      await api(`/api/workbench/goals/${goalId}`, {
        method: "DELETE",
      });

      setGoalsRaw((prev) => prev.filter((goal) => goal.id !== goalId));
      setGoalTasksRaw((prev) => prev.filter((item) => item.goalId !== goalId));
      setSelectedGoalId((prev) => (prev === goalId ? "" : prev));
      markSaved();
    } catch (error) {
      markSaveError();
      throw error;
    }
  };

  const renderGoalPanel = () => {
    return (
      <section className="rounded-3xl border border-yellow-300/15 bg-[#070A10] p-4">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-yellow-300/10 pb-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200/65">
              Goals
            </div>
            <div className="mt-1 text-sm font-semibold text-white">
              Gold Outcomes
            </div>
          </div>

          <GoldButton onClick={openCreateGoal}>
            <Plus className="h-4 w-4" />
            Create Goal
          </GoldButton>
        </div>

        {goals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            body="Create a gold goal, then connect it to tasks on the map. A goal can own many tasks."
            actionLabel="Create goal"
            onAction={openCreateGoal}
          />
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                attachedTasks={tasksByGoal.get(goal.id) ?? []}
                active={selectedGoal?.id === goal.id}
                onSelect={() => setSelectedGoalId(goal.id)}
                onEdit={() => openEditGoal(goal.id)}
                onDelete={() => {
                  void deleteGoal(goal.id);
                }}
              />
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderWorkbenchPane = () => {
    if (!tasksRaw.length && !loading) {
      return (
        <EmptyState
          title="No Workbench tasks yet"
          body="Create your first task to activate the table, map, weekly planning, timeline, milestones, and notes surfaces."
          actionLabel="Create first task"
          onAction={openCreate}
        />
      );
    }

    return (
      <div
        className={
          mapWide
            ? "grid gap-5"
            : "grid gap-6 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]"
        }
      >
        <div
          className={
            mapWide
              ? "order-2 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.65fr)]"
              : "order-1 grid min-w-0 gap-4"
          }
        >
          <section
            className={
              mapWide
                ? "min-w-0 rounded-3xl border border-white/10 bg-[#070A10] p-4 xl:row-span-2"
                : "min-w-0 rounded-3xl border border-white/10 bg-[#070A10] p-4"
            }
          >
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Tasks
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  Workbench Tasks
                </div>
              </div>

              <div className="text-xs text-white/50">
                {loading ? "Loading..." : `${tasks.length} shown`}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/10">
              <TaskTable
                tasks={tasks}
                selectedId={selected?.id ?? ""}
                onSelect={setSelectedId}
                onEdit={openEdit}
                onDelete={deleteTask}
              />
            </div>
          </section>

          <section className="min-w-0 rounded-3xl border border-white/10 bg-[#070A10] p-4">
            <TaskDetail
              task={selected}
              onEdit={selected ? () => openEdit(selected.id) : undefined}
            />
          </section>

          <section className="min-w-0 rounded-3xl border border-white/10 bg-[#070A10] p-4">
            <InspectorPanel task={selected} />
          </section>
        </div>

        <section
          className={
            mapWide
              ? "order-1 min-w-0 rounded-3xl border border-sky-300/20 bg-[#070A10] p-4 shadow-[0_24px_90px_rgba(14,165,233,0.08)]"
              : "order-2 min-w-0 rounded-3xl border border-white/10 bg-[#070A10] p-4"
          }
        >
          <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                Map
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                Relationship Map
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-white/45">
                Drag nodes to organize work visually
              </div>

              <button
                type="button"
                onClick={() => setMapWide((value) => !value)}
                className={[
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  mapWide
                    ? "border-sky-300/30 bg-sky-300/10 text-sky-100 hover:bg-sky-300/15"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {mapWide ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
                {mapWide ? "Exit widescreen" : "Widescreen"}
              </button>
            </div>
          </div>

          <div className={mapWide ? "h-[860px] min-w-0" : "h-[760px] min-w-0"}>
            <RelationshipMap
              tasks={tasks}
              links={visibleLinks}
              goals={goalsRaw}
              goalTasks={visibleGoalTasks}
              selectedTaskId={selected?.id ?? ""}
              selectedGoalId={selectedGoalId}
              onSelectTask={setSelectedId}
              onSelectGoal={setSelectedGoalId}
              onMoveTask={updateTaskPosition}
              onMoveGoal={updateGoalPosition}
              onCreateLink={createLink}
              onDeleteLink={deleteLink}
              onCreateGoalTask={createGoalTask}
              onDeleteGoalTask={deleteGoalTask}
            />
          </div>
        </section>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (shellTab) {
      case "Workbench":
        return renderWorkbenchPane();

      case "Weekly":
        return (
          <WeeklyView
            tasks={tasks}
            selectedTaskId={selected?.id}
            onSelectTask={setSelectedId}
            onCreateTask={openCreate}
          />
        );

      case "Timeline":
        return (
          <LinearTimelineView
            tasks={tasks}
            selectedTaskId={selected?.id}
            onSelectTask={setSelectedId}
            onUpdateTask={updateTask}
            onCreateTask={openCreate}
          />
        );

      case "Milestones":
        return (
          <MilestonesView
            tasks={tasks}
            goals={goals}
            goalTasks={visibleGoalTasks}
            selectedTaskId={selected?.id}
            selectedGoalId={selectedGoal?.id}
            onSelectTask={setSelectedId}
            onSelectGoal={setSelectedGoalId}
            onEditTask={openEdit}
            onEditGoal={openEditGoal}
            onCreateTask={openCreate}
            onCreateGoal={openCreateGoal}
          />
        );

      case "Notes":
        return (
          <NotesView
            tasks={tasks}
            selectedTask={selected}
            selectedTaskId={selected?.id}
            onSelectTask={setSelectedId}
            onEditTask={openEdit}
            onCreateTask={openCreate}
          />
        );

      default:
        return renderWorkbenchPane();
    }
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#070A10] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Private Preview
              </span>
              <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-100">
                Gold Goals Enabled
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                Owner Only
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Workbench Command Surface
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Plan, connect, schedule, review, and document work from one
              operator view. Gold goals now define the larger outcomes that
              many tasks can attach to.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SaveStateBadge value={saveState} />
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>
            <GoldButton onClick={openCreateGoal}>
              <Plus className="h-4 w-4" />
              Create Goal
            </GoldButton>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-6">
          <WorkbenchStatCard
            label="Goals"
            value={summary.goals}
            helper="Gold outcomes"
            tone="gold"
          />
          <WorkbenchStatCard
            label="Total"
            value={summary.total}
            helper="Tasks in system"
          />
          <WorkbenchStatCard
            label="Overdue"
            value={summary.overdue}
            helper="Needs attention"
            tone="rose"
          />
          <WorkbenchStatCard
            label="This week"
            value={summary.dueThisWeek}
            helper="Due within 7 days"
            tone="sky"
          />
          <WorkbenchStatCard
            label="Review"
            value={summary.review}
            helper="Decision gate"
            tone="amber"
          />
          <WorkbenchStatCard
            label="Completed"
            value={summary.completed}
            helper="Proof of progress"
            tone="emerald"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <ShellTabs
            value={shellTab}
            order={shellTabOrder}
            onChange={setShellTab}
            onReorder={setShellTabOrder}
          />

          <div className="text-[11px] text-white/35">
            Drag tabs to reorder. Order persists in this browser.
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-white/50">
          {TAB_DESCRIPTIONS[shellTab]}
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#070A10] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks, goals, clients, assignees..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-9 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
            <GoldButton onClick={openCreateGoal}>
              <Plus className="h-4 w-4" />
              Goal
            </GoldButton>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => {
              const active = statusFilter === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs transition",
                    active
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/10 bg-transparent text-white/60 hover:bg-white/5",
                  ].join(" ")}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/45">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            <LayoutGrid className="h-3.5 w-3.5" />
            Table workflow
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            <Network className="h-3.5 w-3.5" />
            Full map canvas
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-2.5 py-1 text-yellow-100">
            {goals.length} gold goals
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            {loading ? "Loading..." : `${tasks.length} visible`}
          </span>
        </div>
      </section>

      {renderActiveTab()}

      <TaskEditorModal
        open={editorOpen}
        mode={editorMode}
        task={selected}
        onClose={() => setEditorOpen(false)}
        onCreate={createTask}
        onUpdate={updateTask}
      />

      <GoalEditorModal
        open={goalEditorOpen}
        mode={goalEditorMode}
        goal={selectedGoal}
        onClose={() => setGoalEditorOpen(false)}
        onCreate={createGoal}
        onUpdate={updateGoal}
      />
    </div>
  );
}
