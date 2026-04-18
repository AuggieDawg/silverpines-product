/**
 * app/api/ml/profile/route.ts
 *
 * Secure gateway endpoint for the Dataset Profiler tool.
 * - Requires an auth session.
 * - Requires ADMIN role.
 * - Accepts multipart/form-data with "file" as CSV.
 * - Forwards the upload to the private ML service /profile endpoint.
 */

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/rbac";

export const runtime = "nodejs";

type ErrorPayload = {
  error?: string;
  message?: string;
  detail?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJsonSafely(res: Response): Promise<unknown> {
  return res.json().catch(() => null);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const baseUrl = process.env.ML_SERVICE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "ML_SERVICE_URL is not set in .env" },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing "file" in multipart form data' },
      { status: 400 }
    );
  }

  const maxBytes = 10 * 1024 * 1024;

  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "File too large. Max upload size is 10MB." },
      { status: 413 }
    );
  }

  const forward = new FormData();
  forward.append("file", file, file.name);

  const res = await fetch(`${baseUrl}/profile`, {
    method: "POST",
    body: forward,
  });

  const data = await readJsonSafely(res);

  if (!res.ok) {
    const payload: ErrorPayload = isObject(data) ? data : { detail: data };

    return NextResponse.json(
      {
        error: "ML profile failed",
        detail: payload,
      },
      { status: 502 }
    );
  }

  return NextResponse.json(data);
}