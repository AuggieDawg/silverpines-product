"use client";

import { useMemo, useState } from "react";

type ProfileResponse = Record<string, unknown>;

type ErrorShape = {
  error?: unknown;
  message?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(value: unknown): string | null {
  if (!isObject(value)) return null;

  const shape = value as ErrorShape;

  if (typeof shape.error === "string") return shape.error;
  if (typeof shape.message === "string") return shape.message;

  return JSON.stringify(value);
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";

  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let value = bytes;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function errorToMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Unknown error";
}

export function DataProfilerPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProfileResponse | null>(null);

  const fileMeta = useMemo(() => {
    if (!file) return null;

    return {
      name: file.name,
      size: file.size,
      type: file.type || "unknown",
      lastModified: file.lastModified ? new Date(file.lastModified) : null,
    };
  }, [file]);

  async function runProfiler() {
    if (!file) return;

    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/ml/profile", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let detail = "";
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const json: unknown = await res.json().catch(() => null);
          detail = getErrorMessage(json) ?? "";
        } else {
          detail = await res.text().catch(() => "");
        }

        throw new Error(
          `Profiler failed (${res.status} ${res.statusText})${
            detail ? `: ${detail}` : ""
          }`
        );
      }

      const json: unknown = await res.json();

      if (!isObject(json)) {
        throw new Error("Profiler returned an invalid response shape.");
      }

      setResult(json);
    } catch (err: unknown) {
      setError(errorToMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setBusy(false);
    setError(null);
    setResult(null);
  }

  return (
    <section
      style={{
        padding: 16,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 950, letterSpacing: 0.2 }}>
        Data Profiler
      </div>

      <div style={{ color: "rgba(255,255,255,0.70)", marginTop: 6 }}>
        Upload a CSV to compute column types, missingness, basic statistics,
        and summary metadata. This runs in your ML microservice through your
        authenticated gateway.
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: 14,
          padding: 14,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(0,0,0,0.40)",
        }}
      >
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          style={{ color: "rgba(255,255,255,0.85)" }}
        />

        <button
          onClick={runProfiler}
          disabled={!file || busy}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background:
              "linear-gradient(135deg, rgba(255,0,80,0.28), rgba(255,255,255,0.03))",
            boxShadow: "inset 0 0 18px rgba(255,0,80,0.16)",
            color: "rgba(255,255,255,0.92)",
            cursor: !file || busy ? "not-allowed" : "pointer",
            fontWeight: 800,
          }}
          title={!file ? "Choose a CSV first" : "Run the profiler"}
        >
          {busy ? "Running..." : "Run Profiler"}
        </button>

        <button
          onClick={reset}
          disabled={busy && !result}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.85)",
            cursor: busy && !result ? "not-allowed" : "pointer",
            fontWeight: 750,
          }}
          title="Clear selection and results"
        >
          Reset
        </button>

        {fileMeta && (
          <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12 }}>
            <div>
              <strong>File:</strong> {fileMeta.name}
            </div>
            <div>
              <strong>Size:</strong> {formatBytes(fileMeta.size)}{" "}
              <span style={{ marginLeft: 10 }}>
                <strong>Type:</strong> {fileMeta.type}
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 16,
            border: "1px solid rgba(255,120,120,0.35)",
            background: "rgba(255,0,0,0.08)",
            color: "rgba(255,180,180,0.95)",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            Profiler Error
          </div>

          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {error}
          </div>

          <div
            style={{
              marginTop: 10,
              color: "rgba(255,200,200,0.85)",
              fontSize: 12,
            }}
          >
            Common causes: DB container stopped, ML service stopped, missing
            ML_SERVICE_URL, or invalid CSV input.
          </div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>
            Profiler Result JSON
          </div>

          <pre
            style={{
              padding: 14,
              borderRadius: 16,
              background: "rgba(0,0,0,0.70)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.85)",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}