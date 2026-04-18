import type { Prisma } from "@prisma/client";
import {
  WorkbenchTaskPriority,
  WorkbenchTaskStatus,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { jsonError, jsonOk } from "@/lib/http/json";

const VALID_STATUSES = new Set<string>(Object.values(WorkbenchTaskStatus));
const VALID_PRIORITIES = new Set<string>(Object.values(WorkbenchTaskPriority));

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFiniteNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalDate(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

function parseStatus(value: unknown) {
  if (typeof value === "string" && VALID_STATUSES.has(value)) {
    return value as WorkbenchTaskStatus;
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
  { params }: { params: Promise<{ taskId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { taskId } = await params;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  if (!isObject(body)) {
    return jsonError(400, "JSON body must be an object");
  }

  const existing = await prisma.workbenchTask.findFirst({
    where: {
      id: taskId,
      ownerId: auth.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return jsonError(404, "Task not found");
  }

  const data: Prisma.WorkbenchTaskUpdateInput = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) return jsonError(400, "title cannot be empty");
    data.title = title;
  }

  if (body.client !== undefined) {
    const client = String(body.client).trim();
    if (!client) return jsonError(400, "client cannot be empty");
    data.client = client;
  }

  if (body.assignee !== undefined) {
    const assignee = String(body.assignee).trim();
    if (!assignee) return jsonError(400, "assignee cannot be empty");
    data.assignee = assignee;
  }

  if (body.status !== undefined) {
    const status = parseStatus(body.status);
    if (!status) return jsonError(400, "Invalid task status");
    data.status = status;
  }

  if (body.priority !== undefined) {
    const priority = parsePriority(body.priority);
    if (!priority) return jsonError(400, "Invalid task priority");
    data.priority = priority;
  }

  if (body.dueDate !== undefined) {
    data.dueDate = parseOptionalDate(body.dueDate);
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

  const updated = await prisma.workbenchTask.update({
    where: { id: taskId },
    data,
  });

  return jsonOk({ task: updated });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { taskId } = await params;

  const existing = await prisma.workbenchTask.findFirst({
    where: {
      id: taskId,
      ownerId: auth.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return jsonError(404, "Task not found");
  }

  await prisma.workbenchTask.delete({
    where: { id: taskId },
  });

  return jsonOk({ ok: true });
}