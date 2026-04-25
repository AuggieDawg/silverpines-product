import {
  WorkbenchTaskPriority,
  WorkbenchTaskStatus,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http/json";

const VALID_STATUSES = new Set<string>(Object.values(WorkbenchTaskStatus));
const VALID_PRIORITIES = new Set<string>(Object.values(WorkbenchTaskPriority));

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseStatus(value: unknown): WorkbenchTaskStatus {
  if (typeof value === "string" && VALID_STATUSES.has(value)) {
    return value as WorkbenchTaskStatus;
  }

  return WorkbenchTaskStatus.Open;
}

function parsePriority(value: unknown): WorkbenchTaskPriority {
  if (typeof value === "string" && VALID_PRIORITIES.has(value)) {
    return value as WorkbenchTaskPriority;
  }

  return WorkbenchTaskPriority.Medium;
}

function parseOptionalDate(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const [tasks, links, goals, goalTasks] = await Promise.all([
    prisma.workbenchTask.findMany({
      where: { ownerId: auth.userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.workbenchTaskLink.findMany({
      where: { ownerId: auth.userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.workbenchGoal.findMany({
      where: { ownerId: auth.userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.workbenchGoalTask.findMany({
      where: { ownerId: auth.userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return jsonOk({ tasks, links, goals, goalTasks });
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
  const client = String(body.client ?? "").trim();
  const assignee = String(body.assignee ?? "").trim();

  if (!title || !client || !assignee) {
    return jsonError(400, "title, client, and assignee are required");
  }

  const existingCount = await prisma.workbenchTask.count({
    where: { ownerId: auth.userId },
  });

  const column = existingCount % 4;
  const row = Math.floor(existingCount / 4);

  const defaultX = 40 + column * 240;
  const defaultY = 40 + row * 160;

  const created = await prisma.workbenchTask.create({
    data: {
      title,
      client,
      assignee,
      status: parseStatus(body.status),
      priority: parsePriority(body.priority),
      dueDate: parseOptionalDate(body.dueDate),
      mapX: toFiniteNumber(body.mapX, defaultX),
      mapY: toFiniteNumber(body.mapY, defaultY),
      ownerId: auth.userId,
    },
  });

  return jsonCreated({ task: created });
}
