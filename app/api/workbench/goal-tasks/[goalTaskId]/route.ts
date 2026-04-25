import { requireAdmin } from "@/lib/auth/require";
import { prisma } from "@/lib/db/prisma";
import { jsonError, jsonOk } from "@/lib/http/json";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ goalTaskId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { goalTaskId } = await params;

  const existing = await prisma.workbenchGoalTask.findFirst({
    where: {
      id: goalTaskId,
      ownerId: auth.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return jsonError(404, "Goal attachment not found");
  }

  await prisma.workbenchGoalTask.delete({
    where: { id: goalTaskId },
  });

  return jsonOk({ ok: true });
}
