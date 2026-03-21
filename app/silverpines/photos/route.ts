import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  ManagedPhotoCategory,
  ManagedPhotoRoomTag,
  ManagedPhotoSubjectType,
} from "@prisma/client";

import { requireAdmin } from "@/lib/auth/require";
import { jsonCreated, jsonError } from "@/lib/http/json";
import { prisma } from "@/lib/db/prisma";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024;

const PHOTO_CATEGORIES = new Set<ManagedPhotoCategory>([
  ManagedPhotoCategory.General,
  ManagedPhotoCategory.Inspection,
  ManagedPhotoCategory.Before,
  ManagedPhotoCategory.After,
  ManagedPhotoCategory.Damage,
  ManagedPhotoCategory.Turnover,
  ManagedPhotoCategory.Appliance,
  ManagedPhotoCategory.Exterior,
  ManagedPhotoCategory.Safety,
  ManagedPhotoCategory.Receipt,
  ManagedPhotoCategory.Other,
]);

const ROOM_TAGS = new Set<ManagedPhotoRoomTag>([
  ManagedPhotoRoomTag.Unknown,
  ManagedPhotoRoomTag.Exterior,
  ManagedPhotoRoomTag.Entry,
  ManagedPhotoRoomTag.LivingRoom,
  ManagedPhotoRoomTag.Kitchen,
  ManagedPhotoRoomTag.DiningRoom,
  ManagedPhotoRoomTag.Hallway,
  ManagedPhotoRoomTag.Bathroom,
  ManagedPhotoRoomTag.Bedroom,
  ManagedPhotoRoomTag.Laundry,
  ManagedPhotoRoomTag.Utility,
  ManagedPhotoRoomTag.Garage,
  ManagedPhotoRoomTag.Balcony,
  ManagedPhotoRoomTag.Patio,
  ManagedPhotoRoomTag.Closet,
  ManagedPhotoRoomTag.Mechanical,
  ManagedPhotoRoomTag.Other,
]);

function safeSegment(value: string) {
  return value.replace(/[^A-Za-z0-9_-]/g, "_");
}

function extensionFromMime(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "bin";
  }
}

function todayParts(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return { year, month, day };
}

function parsePhotoCategory(value: FormDataEntryValue | null): ManagedPhotoCategory {
  if (typeof value === "string" && PHOTO_CATEGORIES.has(value as ManagedPhotoCategory)) {
    return value as ManagedPhotoCategory;
  }

  return ManagedPhotoCategory.General;
}

function parseRoomTag(value: FormDataEntryValue | null): ManagedPhotoRoomTag {
  if (typeof value === "string" && ROOM_TAGS.has(value as ManagedPhotoRoomTag)) {
    return value as ManagedPhotoRoomTag;
  }

  return ManagedPhotoRoomTag.Unknown;
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  try {
    const formData = await req.formData();

    const assetCodeRaw = formData.get("assetCode");
    const captionRaw = formData.get("caption");
    const categoryRaw = formData.get("category");
    const roomTagRaw = formData.get("roomTag");
    const inspectionSetIdRaw = formData.get("inspectionSetId");
    const fileValue = formData.get("file");

    const assetCode =
      typeof assetCodeRaw === "string" ? assetCodeRaw.trim().toUpperCase() : "";

    const caption =
      typeof captionRaw === "string" && captionRaw.trim().length > 0
        ? captionRaw.trim()
        : undefined;

    const category = parsePhotoCategory(categoryRaw);
    const roomTag = parseRoomTag(roomTagRaw);

    const inspectionSetId =
      typeof inspectionSetIdRaw === "string" && inspectionSetIdRaw.trim().length > 0
        ? inspectionSetIdRaw.trim()
        : undefined;

    if (!assetCode) {
      return jsonError(400, "assetCode is required");
    }

    if (!(fileValue instanceof File)) {
      return jsonError(400, "file is required");
    }

    if (fileValue.size <= 0) {
      return jsonError(400, "file is empty");
    }

    if (fileValue.size > MAX_FILE_SIZE_BYTES) {
      return jsonError(400, "file exceeds the 12 MB upload limit");
    }

    if (!ALLOWED_MIME_TYPES.has(fileValue.type)) {
      return jsonError(400, `Unsupported file type: ${fileValue.type || "unknown"}`);
    }

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

    if (inspectionSetId) {
      const inspectionSet = await prisma.inspectionSet.findUnique({
        where: { id: inspectionSetId },
        select: {
          id: true,
          propertyId: true,
          unitId: true,
          garageId: true,
        },
      });

      if (!inspectionSet) {
        return jsonError(404, "Inspection set not found");
      }

      if (inspectionSet.propertyId !== (unit?.propertyId ?? garage!.propertyId)) {
        return jsonError(400, "Inspection set does not belong to this property");
      }

      if (unit && inspectionSet.unitId !== unit.id) {
        return jsonError(400, "Inspection set does not belong to this unit");
      }

      if (garage && inspectionSet.garageId !== garage.id) {
        return jsonError(400, "Inspection set does not belong to this garage");
      }
    }

    const { year, month, day } = todayParts();
    const ext = extensionFromMime(fileValue.type);
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const relativeDir = path.posix.join(
      "uploads",
      "silverpines",
      safeSegment(assetCode),
      year,
      month,
      day
    );

    const absoluteDir = path.join(process.cwd(), "public", relativeDir);
    const absoluteFilePath = path.join(absoluteDir, fileName);
    const browserPath = `/${relativeDir}/${fileName}`;

    await mkdir(absoluteDir, { recursive: true });

    const arrayBuffer = await fileValue.arrayBuffer();
    await writeFile(absoluteFilePath, Buffer.from(arrayBuffer));

    const subjectType: ManagedPhotoSubjectType = unit
      ? ManagedPhotoSubjectType.Unit
      : ManagedPhotoSubjectType.Garage;

    const photo = await prisma.managedPhoto.create({
      data: {
        propertyId: unit?.propertyId ?? garage!.propertyId,
        unitId: unit?.id,
        garageId: garage?.id,
        inspectionSetId,
        uploadedByUserId: auth.userId,
        category,
        subjectType,
        roomTag,
        caption,
        originalFileName: fileValue.name || undefined,
        mimeType: fileValue.type,
        storageKey: browserPath,
        fileSizeBytes: fileValue.size,
        uploadedAt: new Date(),
      },
      select: {
        id: true,
        category: true,
        roomTag: true,
        caption: true,
        originalFileName: true,
        mimeType: true,
        storageKey: true,
        fileSizeBytes: true,
        uploadedAt: true,
        inspectionSetId: true,
      },
    });

    return jsonCreated({
      photo: {
        ...photo,
        uploadedAt: photo.uploadedAt.toISOString(),
      },
    });
  } catch (error) {
    return jsonError(500, "Failed to upload SilverPines photo", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}