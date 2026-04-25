import type { Prisma } from "@prisma/client";
import {
  WorkbenchGoalStatus,
  WorkbenchTaskPriority,
} from "@prisma/client";

import { requireAdmin } from "@/lib/auth/require";
import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/http/json";

const VALID_STATUSES = new Set<string>(Object.values(WorkbenchGoalStatus));
const VALID_PRIORITIES = new Set<string>(Object.values(WorkbenchTaskPriority));

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFiniteNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalDate(value: unknown) {
  if (value === undefined || value === null || value === "") return null;

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

function parseStatus(value: unknown) {
  if (typeof value === "string" && VALID_STATUSES.has(value)) {
    return value as WorkbenchGoalStatus;
  }

  return null;
}

function parsePriority(value: unknown) {
  if (typeof value === "string" && VALID_PRIORITIES.has(value)) {
    return value as WorkbenchTaskPriority;
  }

  return null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { goalId } = await params;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  if (!isObject(body)) {
    return jsonError(400, "JSON body must be an object");
  }

  const existing = await prisma.workbenchGoal.findFirst({
    where: {
      id: goalId,
      ownerId: auth.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return jsonError(404, "Goal not found");
  }

  const data: Prisma.WorkbenchGoalUpdateInput = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) return jsonError(400, "title cannot be empty");
    data.title = title;
  }

  if (body.purpose !== undefined) {
    const purpose = String(body.purpose).trim();
    if (!purpose) return jsonError(400, "purpose cannot be empty");
    data.purpose = purpose;
  }

  if (body.successMetric !== undefined) {
    data.successMetric = String(body.successMetric ?? "").trim() || null;
  }

  if (body.targetDate !== undefined) {
    data.targetDate = parseOptionalDate(body.targetDate);
  }

  if (body.status !== undefined) {
    const status = parseStatus(body.status);
    if (!status) return jsonError(400, "Invalid goal status");
    data.status = status;
  }

  if (body.priority !== undefined) {
    const priority = parsePriority(body.priority);
    if (!priority) return jsonError(400, "Invalid goal priority");
    data.priority = priority;
  }

  if (body.mapX !== undefined) {
    const mapX = parseFiniteNumber(body.mapX);
    if (mapX === null) return jsonError(400, "mapX must be a finite number");
    data.mapX = mapX;
  }

  if (body.mapY !== undefined) {
    const mapY = parseFiniteNumber(body.mapY);
    if (mapY === null) return jsonError(400, "mapY must be a finite number");
    data.mapY = mapY;
  }

  const goal = await prisma.workbenchGoal.update({
    where: { id: goalId },
    data,
  });

  return jsonOk({ goal });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { goalId } = await params;

  const existing = await prisma.workbenchGoal.findFirst({
    where: {
      id: goalId,
      ownerId: auth.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return jsonError(404, "Goal not found");
  }

  await prisma.workbenchGoal.delete({
    where: { id: goalId },
  });

  return jsonOk({ ok: true });
}
