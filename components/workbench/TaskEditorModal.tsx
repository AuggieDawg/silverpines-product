"use client";

import { useEffect, useState } from "react";
import type {
  WorkbenchTaskDTO,
  WorkbenchTaskPriority,
  WorkbenchTaskStatus,
} from "./types";

const STATUSES: WorkbenchTaskStatus[] = [
  "Open",
  "InProgress",
  "Review",
  "Completed",
  "Overdue",
];

const PRIORITIES: WorkbenchTaskPriority[] = ["Low", "Medium", "High"];

type TaskUpsertPayload = Omit<WorkbenchTaskDTO, "id" | "mapX" | "mapY">;

function errorToMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;

  if (typeof error === "string") return error;

  return fallback;
}

export function TaskEditorModal({
  open,
  mode,
  task,
  onClose,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  mode: "create" | "edit";
  task?: WorkbenchTaskDTO;
  onClose: () => void;
  onCreate: (payload: TaskUpsertPayload) => Promise<void>;
  onUpdate: (
    taskId: string,
    patch: Partial<TaskUpsertPayload>
  ) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState<WorkbenchTaskStatus>("Open");
  const [priority, setPriority] = useState<WorkbenchTaskPriority>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setErr(null);

    if (mode === "edit" && task) {
      setTitle(task.title);
      setClient(task.client);
      setAssignee(task.assignee);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ?? "");
    } else {
      setTitle("");
      setClient("");
      setAssignee("");
      setStatus("Open");
      setPriority("Medium");
      setDueDate("");
    }
  }, [open, mode, task]);

  if (!open) return null;

  const save = async () => {
    setErr(null);

    if (!title.trim()) return setErr("Title is required.");
    if (!client.trim()) return setErr("Client is required.");
    if (!assignee.trim()) return setErr("Assignee is required.");

    setBusy(true);

    try {
      const payload: TaskUpsertPayload = {
        title: title.trim(),
        client: client.trim(),
        assignee: assignee.trim(),
        status,
        priority,
        dueDate: dueDate ? dueDate : null,
      };

      if (mode === "create") {
        await onCreate(payload);
      } else if (task) {
        await onUpdate(task.id, payload);
      }

      onClose();
    } catch (error: unknown) {
      setErr(errorToMessage(error, "Failed to save."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#070A10] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {mode === "create" ? "Create Workbench Task" : "Edit Workbench Task"}
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Define the task record that also becomes a map box.
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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/75">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                placeholder="e.g., Finalize proposal"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/75">Client</span>
              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                placeholder="e.g., Acme Corp"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/75">Assignee</span>
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                placeholder="e.g., You"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/75">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/75">Status</span>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as WorkbenchTaskStatus)
                }
                className="rounded-xl border border-white/10 bg-[#070A10] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/75">Priority</span>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as WorkbenchTaskPriority)
                }
                className="rounded-xl border border-white/10 bg-[#070A10] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
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
            className="rounded-xl bg-sky-500/90 px-4 py-2 text-sm font-semibold text-black hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}