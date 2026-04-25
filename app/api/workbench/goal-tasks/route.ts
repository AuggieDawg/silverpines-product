import { requireAdmin } from "@/lib/auth/require";
import { prisma } from "@/lib/db/prisma";
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

  const goalId = String(body.goalId ?? "").trim();
  const taskId = String(body.taskId ?? "").trim();

  if (!goalId || !taskId) {
    return jsonError(400, "goalId and taskId are required");
  }

  const [goal, task] = await Promise.all([
    prisma.workbenchGoal.findFirst({
      where: { id: goalId, ownerId: auth.userId },
      select: { id: true },
    }),
    prisma.workbenchTask.findFirst({
      where: { id: taskId, ownerId: auth.userId },
      select: { id: true },
    }),
  ]);

  if (!goal || !task) {
    return jsonError(404, "Goal or task not found");
  }

  const existing = await prisma.workbenchGoalTask.findFirst({
    where: {
      ownerId: auth.userId,
      goalId,
      taskId,
    },
  });

  if (existing) {
    return jsonOk({ goalTask: existing });
  }

  const goalTask = await prisma.workbenchGoalTask.create({
    data: {
      ownerId: auth.userId,
      goalId,
      taskId,
    },
  });

  return jsonCreated({ goalTask });
}
