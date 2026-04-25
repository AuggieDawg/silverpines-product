"use client";

import { useEffect, useState } from "react";
import type {
  WorkbenchGoalDTO,
  WorkbenchGoalStatus,
  WorkbenchTaskPriority,
} from "./types";

const STATUSES: WorkbenchGoalStatus[] = [
  "Planned",
  "Active",
  "AtRisk",
  "Achieved",
  "Paused",
];

const PRIORITIES: WorkbenchTaskPriority[] = ["Low", "Medium", "High"];

export type GoalUpsertPayload = Omit<
  WorkbenchGoalDTO,
  "id" | "mapX" | "mapY"
>;

function errorToMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}

export function GoalEditorModal({
  open,
  mode,
  goal,
  onClose,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  mode: "create" | "edit";
  goal?: WorkbenchGoalDTO;
  onClose: () => void;
  onCreate: (payload: GoalUpsertPayload) => Promise<void>;
  onUpdate: (
    goalId: string,
    patch: Partial<GoalUpsertPayload>
  ) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [successMetric, setSuccessMetric] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<WorkbenchGoalStatus>("Planned");
  const [priority, setPriority] = useState<WorkbenchTaskPriority>("Medium");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setErr(null);

    if (mode === "edit" && goal) {
      setTitle(goal.title);
      setPurpose(goal.purpose);
      setSuccessMetric(goal.successMetric ?? "");
      setTargetDate(goal.targetDate ?? "");
      setStatus(goal.status);
      setPriority(goal.priority);
    } else {
      setTitle("");
      setPurpose("");
      setSuccessMetric("");
      setTargetDate("");
      setStatus("Planned");
      setPriority("Medium");
    }
  }, [open, mode, goal]);

  if (!open) return null;

  const save = async () => {
    setErr(null);

    if (!title.trim()) return setErr("Goal title is required.");
    if (!purpose.trim()) return setErr("Goal purpose is required.");

    setBusy(true);

    try {
      const payload: GoalUpsertPayload = {
        title: title.trim(),
        purpose: purpose.trim(),
        successMetric: successMetric.trim() || null,
        targetDate: targetDate || null,
        status,
        priority,
      };

      if (mode === "create") {
        await onCreate(payload);
      } else if (goal) {
        await onUpdate(goal.id, payload);
      }

      onClose();
    } catch (error: unknown) {
      setErr(errorToMessage(error, "Failed to save goal."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-yellow-300/20 bg-[#070A10] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {mode === "create" ? "Create Goal" : "Edit Goal"}
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Goals are gold parent objects. Attach tasks to them on the map.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {err ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {err}
            </div>
          ) : null}

          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/75">Goal title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-yellow-300/35"
              placeholder="e.g., Launch private Workbench preview"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/75">Purpose</span>
            <textarea
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              className="min-h-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-yellow-300/35"
              placeholder="What business outcome does this goal create?"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/75">Success metric</span>
              <input
                value={successMetric}
                onChange={(event) => setSuccessMetric(event.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-yellow-300/35"
                placeholder="e.g., Vercel preview tested successfully"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/75">Target date</span>
              <input
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-yellow-300/35"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/75">Status</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as WorkbenchGoalStatus)
                }
                className="rounded-xl border border-white/10 bg-[#070A10] px-3 py-2 text-sm text-white outline-none focus:border-yellow-300/35"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/75">Priority</span>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as WorkbenchTaskPriority)
                }
                className="rounded-xl border border-white/10 bg-[#070A10] px-3 py-2 text-sm text-white outline-none focus:border-yellow-300/35"
              >
                {PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="rounded-xl bg-[linear-gradient(135deg,#fde68a,#f59e0b,#92400e)] px-4 py-2 text-sm font-semibold text-black shadow-[0_14px_40px_rgba(245,158,11,0.24)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save Goal"}
          </button>
        </div>
      </div>
    </div>
  );
}
