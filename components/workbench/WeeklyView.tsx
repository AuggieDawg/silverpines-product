"use client";

import { useMemo } from "react";
import type { WorkbenchTaskDTO } from "./types";

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

function formatDate(dateString: string | null) {
  if (!dateString) return "Unscheduled";

  return parseDate(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function statusTone(status: WorkbenchTaskDTO["status"]) {
  switch (status) {
    case "Completed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "InProgress":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200";
    case "Review":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "Overdue":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    default:
      return "border-white/10 bg-white/5 text-white/75";
  }
}

type TaskBucket = {
  title: string;
  subtitle: string;
  tasks: WorkbenchTaskDTO[];
};

export function WeeklyView({
  tasks,
  selectedTaskId,
  onSelectTask,
}: {
  tasks: WorkbenchTaskDTO[];
  selectedTaskId?: string;
  onSelectTask?: (taskId: string) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const weekEnd = useMemo(() => addDays(today, 7), [today]);

  const buckets = useMemo<TaskBucket[]>(() => {
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

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            Horizon
          </div>
          <div className="mt-2 text-lg font-semibold text-white">Weekly</div>
          <div className="mt-1 text-sm text-white/55">
            A focused view of what is late, what is imminent, and what still
            needs commitment.
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-rose-200/70">
            Critical
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {buckets[0]?.tasks.length ?? 0}
          </div>
          <div className="mt-1 text-sm text-white/55">Overdue tasks</div>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-sky-200/70">
            Immediate
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {buckets[1]?.tasks.length ?? 0}
          </div>
          <div className="mt-1 text-sm text-white/55">Due within 7 days</div>
        </div>
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
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
                No tasks in this bucket yet. Add due dates and move tasks
                through statuses to make this view useful.
              </div>
            ) : (
              <div className="space-y-2">
                {bucket.tasks.map((task) => {
                  const active = selectedTaskId === task.id;

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
                            statusTone(task.status),
                          ].join(" ")}
                        >
                          {task.status}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-white/55">
                        <span>Due {formatDate(task.dueDate)}</span>
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
