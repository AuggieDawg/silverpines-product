"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import type { WorkbenchTaskDTO } from "./types";

type WorkbenchCommentDTO = {
  id: string;
  body: string;
  createdAt: string;
};

type ApiErrorShape = {
  error?: string;
  details?: unknown;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as ApiErrorShape & T;

  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed: ${res.status}`);
  }

  return data as T;
}

function errorToMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;

  if (typeof error === "string") return error;

  return fallback;
}

function errorName(error: unknown) {
  if (typeof error !== "object" || error === null) return "";

  if ("name" in error) {
    const name = (error as { name?: unknown }).name;
    return typeof name === "string" ? name : "";
  }

  return "";
}

export function TaskDetail({
  task,
  onEdit,
}: {
  task?: WorkbenchTaskDTO;
  onEdit?: () => void;
}) {
  const taskId = task?.id ?? null;

  const [comments, setComments] = useState<WorkbenchCommentDTO[]>([]);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const headerLine = useMemo(() => {
    if (!task) return "";
    return `${task.client} • Due ${task.dueDate ?? "—"} • ${task.status}`;
  }, [task]);

  const loadComments = useCallback(async (id: string) => {
    setError(null);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const { comments } = await api<{ comments: WorkbenchCommentDTO[] }>(
      `/api/workbench/tasks/${id}/comments`,
      { signal: ac.signal }
    );

    setComments(comments);
  }, []);

  useEffect(() => {
    setComments([]);
    setCommentText("");
    setError(null);

    if (!taskId) return;

    loadComments(taskId).catch((error: unknown) => {
      if (errorName(error) === "AbortError") return;
      setError(errorToMessage(error, "Failed to load comments"));
    });

    return () => {
      abortRef.current?.abort();
    };
  }, [taskId, loadComments]);

  const addComment = useCallback(async () => {
    if (!taskId) return;

    const text = commentText.trim();
    if (!text) return;

    setBusy(true);
    setError(null);

    try {
      const { comment } = await api<{ comment: WorkbenchCommentDTO }>(
        `/api/workbench/tasks/${taskId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ body: text }),
        }
      );

      setComments((prev) => [...prev, comment]);
      setCommentText("");
    } catch (error: unknown) {
      setError(errorToMessage(error, "Failed to add comment"));
    } finally {
      setBusy(false);
    }
  }, [taskId, commentText]);

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!taskId) return;

      setBusy(true);
      setError(null);

      try {
        await api(`/api/workbench/tasks/${taskId}/comments/${commentId}`, {
          method: "DELETE",
        });

        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (error: unknown) {
        setError(errorToMessage(error, "Failed to delete comment"));
      } finally {
        setBusy(false);
      }
    },
    [taskId]
  );

  if (!task) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/60">
        Select a task to view details.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{task.title}</h3>
          <p className="mt-1 text-sm text-white/60">{headerLine}</p>
        </div>

        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 text-sm font-semibold text-white">
            Conversation (Comments)
          </div>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/45">
                No comments yet.
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-3"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="text-xs text-white/45">
                      {new Date(c.createdAt).toLocaleString()}
                    </div>

                    <button
                      type="button"
                      title="Delete comment"
                      disabled={busy}
                      onClick={() => deleteComment(c.id)}
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="whitespace-pre-wrap text-sm text-white/80">
                    {c.body}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
            />
            <button
              type="button"
              disabled={busy || !commentText.trim()}
              onClick={addComment}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Comment
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 text-sm font-semibold text-white">Files</div>
          <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/45">
            MVP note: file uploads come next (S3/R2 + signed URLs).
          </div>
        </div>
      </div>
    </div>
  );
}