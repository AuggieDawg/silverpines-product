import { requireAdmin } from "@/lib/auth/require";
import { jsonCreated, jsonError } from "@/lib/http/json";
import { prisma } from "@/lib/db/prisma";

function compactTimestamp(date = new Date()) {
  return date.toISOString().replace(/\D/g, "").slice(0, 14);
}

function safeCodePart(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 24);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  let body: {
    assetCode?: string;
    title?: string;
    description?: string;
  };

  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const assetCode = body.assetCode?.trim().toUpperCase();
  const title = body.title?.trim();
  const description = body.description?.trim();

  if (!assetCode) {
    return jsonError(400, "assetCode is required");
  }

  if (!title) {
    return jsonError(400, "title is required");
  }

  try {
    const unit = await prisma.managedUnit.findUnique({
      where: { unitCode: assetCode },
      select: {
        id: true,
        propertyId: true,
      },
    });

    const garage = !unit
      ? await prisma.managedGarage.findUnique({
          where: { garageCode: assetCode },
          select: {
            id: true,
            propertyId: true,
          },
        })
      : null;

    if (!unit && !garage) {
      return jsonError(404, `No SilverPines asset found for ${assetCode}`);
    }

    const now = new Date();
    const code = `SP-INSP-${safeCodePart(assetCode)}-${compactTimestamp(now)}`;

    const inspectionSet = await prisma.inspectionSet.create({
      data: {
        propertyId: unit?.propertyId ?? garage!.propertyId,
        unitId: unit?.id,
        garageId: garage?.id,
        createdByUserId: auth.userId,
        code,
        title,
        description: description || undefined,
        status: "Open",
        startedAt: now,
      },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        status: true,
        startedAt: true,
        completedAt: true,
      },
    });

    return jsonCreated({
      inspectionSet: {
        ...inspectionSet,
        startedAt: inspectionSet.startedAt.toISOString(),
        completedAt: inspectionSet.completedAt?.toISOString(),
      },
    });
  } catch (error) {
    return jsonError(500, "Failed to create inspection set", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}