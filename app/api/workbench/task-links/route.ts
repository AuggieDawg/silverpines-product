import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http/json";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  if (!isObject(body)) {
    return jsonError(400, "JSON body must be an object");
  }

  const sourceTaskId = String(body.sourceTaskId ?? "").trim();
  const targetTaskId = String(body.targetTaskId ?? "").trim();

  if (!sourceTaskId || !targetTaskId) {
    return jsonError(400, "sourceTaskId and targetTaskId are required");
  }

  if (sourceTaskId === targetTaskId) {
    return jsonError(400, "A task cannot link to itself");
  }

  const ownedTaskCount = await prisma.workbenchTask.count({
    where: {
      ownerId: auth.userId,
      id: { in: [sourceTaskId, targetTaskId] },
    },
  });

  if (ownedTaskCount !== 2) {
    return jsonError(404, "One or both tasks were not found");
  }

  const existing = await prisma.workbenchTaskLink.findFirst({
    where: {
      ownerId: auth.userId,
      sourceTaskId,
      targetTaskId,
    },
  });

  if (existing) {
    return jsonOk({ link: existing });
  }

  const link = await prisma.workbenchTaskLink.create({
    data: {
      ownerId: auth.userId,
      sourceTaskId,
      targetTaskId,
    },
  });

  return jsonCreated({ link });
}