"use client";

import type { WorkbenchTaskDTO } from "./types";

function toneForStatus(status: WorkbenchTaskDTO["status"]) {
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

function toneForPriority(priority: WorkbenchTaskDTO["priority"]) {
  switch (priority) {
    case "High":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    case "Medium":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    default:
      return "border-white/10 bg-white/5 text-white/75";
  }
}

function formatDueDate(value: string | null) {
  if (!value) return "Unscheduled";

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function InspectorPanel({ task }: { task?: WorkbenchTaskDTO }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-4">
        <div className="text-sm font-semibold text-white">Inspector</div>
        <div className="mt-1 text-xs text-white/45">
          Live task context for the selected work item.
        </div>
      </div>

      {!task ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/45">
          Select a task to inspect its status, timing, assignment, and launch
          readiness.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 text-sm font-semibold text-white">Summary</div>

            <div className="text-base font-semibold text-white">
              {task.title}
            </div>

            <div className="mt-1 text-sm text-white/55">{task.client}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneForStatus(
                  task.status
                )}`}
              >
                {task.status}
              </span>

              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneForPriority(
                  task.priority
                )}`}
              >
                Priority: {task.priority}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 text-sm font-semibold text-white">
              Execution fields
            </div>

            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-2">
                <span className="text-white/45">Assignee</span>
                <span className="text-right text-white">{task.assignee}</span>
              </div>

              <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-2">
                <span className="text-white/45">Due date</span>
                <span className="text-right text-white">
                  {formatDueDate(task.dueDate)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-2">
                <span className="text-white/45">Map position</span>
                <span className="text-right text-white">
                  {Math.round(task.mapX)}, {Math.round(task.mapY)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 text-sm font-semibold text-white">
              Launch readiness
            </div>

            <div className="space-y-2 text-sm text-white/65">
              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                {task.status === "Completed"
                  ? "Complete: this item is ready to be treated as a finished work unit."
                  : "Active: this item still needs execution before it should be presented as complete."}
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                {task.dueDate
                  ? "Scheduled: this task appears on the weekly and timeline views."
                  : "Unscheduled: add a due date to make timeline planning accurate."}
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                File uploads are intentionally disabled until private object
                storage is implemented.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
