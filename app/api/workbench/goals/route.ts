import {
  WorkbenchGoalStatus,
  WorkbenchTaskPriority,
} from "@prisma/client";

import { requireAdmin } from "@/lib/auth/require";
import { prisma } from "@/lib/db/prisma";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http/json";

const VALID_STATUSES = new Set<string>(Object.values(WorkbenchGoalStatus));
const VALID_PRIORITIES = new Set<string>(Object.values(WorkbenchTaskPriority));

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStatus(value: unknown): WorkbenchGoalStatus {
  if (typeof value === "string" && VALID_STATUSES.has(value)) {
    return value as WorkbenchGoalStatus;
  }

  return WorkbenchGoalStatus.Planned;
}

function parsePriority(value: unknown): WorkbenchTaskPriority {
  if (typeof value === "string" && VALID_PRIORITIES.has(value)) {
    return value as WorkbenchTaskPriority;
  }

  return WorkbenchTaskPriority.Medium;
}

function parseOptionalDate(value: unknown) {
  if (value === undefined || value === null || value === "") return null;

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

function toFiniteNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const goals = await prisma.workbenchGoal.findMany({
    where: { ownerId: auth.userId },
    orderBy: { updatedAt: "desc" },
  });

  return jsonOk({ goals });
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

  const title = String(body.title ?? "").trim();
  const purpose = String(body.purpose ?? "").trim();
  const successMetric = String(body.successMetric ?? "").trim() || null;

  if (!title || !purpose) {
    return jsonError(400, "title and purpose are required");
  }

  const existingCount = await prisma.workbenchGoal.count({
    where: { ownerId: auth.userId },
  });

  const column = existingCount % 3;
  const row = Math.floor(existingCount / 3);

  const defaultX = 80 + column * 280;
  const defaultY = 80 + row * 190;

  const goal = await prisma.workbenchGoal.create({
    data: {
      title,
      purpose,
      successMetric,
      targetDate: parseOptionalDate(body.targetDate),
      status: parseStatus(body.status),
      priority: parsePriority(body.priority),
      mapX: toFiniteNumber(body.mapX, defaultX),
      mapY: toFiniteNumber(body.mapY, defaultY),
      ownerId: auth.userId,
    },
  });

  return jsonCreated({ goal });
}
