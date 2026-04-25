"use server";

import { randomUUID } from "crypto";

import {
  FieldJobPriority,
  FieldJobStatus,
  FieldRigStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requireStoneOwnerId } from "@/lib/stone/queries";

export async function createFieldRigAction(formData: FormData) {
  const ownerId = await requireStoneOwnerId();

  await prisma.fieldRig.create({
    data: {
      ownerId,
      name: requiredText(formData, "name", "Rig name"),
      rigNumber: optionalText(formData, "rigNumber"),
      status: enumValue(
        formData,
        "status",
        FieldRigStatus.Standby,
        Object.values(FieldRigStatus),
      ),
      currentOperator: optionalText(formData, "currentOperator"),
      locationLabel: optionalText(formData, "locationLabel"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidatePath("/stone");
}

export async function updateFieldRigStatusAction(formData: FormData) {
  const ownerId = await requireStoneOwnerId();
  const rigId = requiredText(formData, "rigId", "Rig ID");

  const status = enumValue(
    formData,
    "status",
    FieldRigStatus.Standby,
    Object.values(FieldRigStatus),
  );

  await prisma.fieldRig.updateMany({
    where: { id: rigId, ownerId },
    data: { status },
  });

  revalidatePath("/stone");
}

export async function createFieldWellAction(formData: FormData) {
  const ownerId = await requireStoneOwnerId();

  await prisma.fieldWell.create({
    data: {
      ownerId,
      operatorName: requiredText(formData, "operatorName", "Operator"),
      wellName: requiredText(formData, "wellName", "Well name"),
      wellNumber: optionalText(formData, "wellNumber"),
      apiNumber: optionalText(formData, "apiNumber"),
      leaseName: optionalText(formData, "leaseName"),
      locationLabel: optionalText(formData, "locationLabel"),
      county: optionalText(formData, "county"),
      state: optionalText(formData, "state") ?? "UT",
      directions: optionalText(formData, "directions"),
      hazards: optionalText(formData, "hazards"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidatePath("/stone");
}

export async function createFieldJobAction(formData: FormData) {
  const ownerId = await requireStoneOwnerId();

  const status = enumValue(
    formData,
    "status",
    FieldJobStatus.Planned,
    Object.values(FieldJobStatus),
  );

  await prisma.fieldJob.create({
    data: {
      ownerId,
      rigId: optionalText(formData, "rigId"),
      wellId: optionalText(formData, "wellId"),
      jobNumber: makeJobNumber(),
      operatorName: requiredText(formData, "operatorName", "Operator"),
      jobType: requiredText(formData, "jobType", "Job type"),
      status,
      priority: enumValue(
        formData,
        "priority",
        FieldJobPriority.Medium,
        Object.values(FieldJobPriority),
      ),
      objective: optionalText(formData, "objective"),
      currentSummary: optionalText(formData, "currentSummary"),
      blocker: optionalText(formData, "blocker"),
      startedAt: status === FieldJobStatus.Active ? new Date() : null,
    },
  });

  revalidatePath("/stone");
}

export async function updateFieldJobStatusAction(formData: FormData) {
  const ownerId = await requireStoneOwnerId();
  const jobId = requiredText(formData, "jobId", "Job ID");

  const status = enumValue(
    formData,
    "status",
    FieldJobStatus.Planned,
    Object.values(FieldJobStatus),
  );

  await prisma.fieldJob.updateMany({
    where: { id: jobId, ownerId },
    data: {
      status,
      completedAt: status === FieldJobStatus.Completed ? new Date() : undefined,
      startedAt: status === FieldJobStatus.Active ? new Date() : undefined,
    },
  });

  revalidatePath("/stone");
}

export async function createFieldDailyReportAction(formData: FormData) {
  const ownerId = await requireStoneOwnerId();

  await prisma.fieldDailyReport.create({
    data: {
      ownerId,
      rigId: optionalText(formData, "rigId"),
      wellId: optionalText(formData, "wellId"),
      jobId: optionalText(formData, "jobId"),
      reportDate: dateOrToday(formData, "reportDate"),
      workPerformed: optionalText(formData, "workPerformed"),
      currentStatus: optionalText(formData, "currentStatus"),
      downtime: optionalText(formData, "downtime"),
      safetyNotes: optionalText(formData, "safetyNotes"),
      partsUsed: optionalText(formData, "partsUsed"),
      partsNeeded: optionalText(formData, "partsNeeded"),
      tomorrowPlan: optionalText(formData, "tomorrowPlan"),
    },
  });

  revalidatePath("/stone");
}

export async function createFieldInventoryItemAction(formData: FormData) {
  const ownerId = await requireStoneOwnerId();

  await prisma.fieldInventoryItem.create({
    data: {
      ownerId,
      rigId: optionalText(formData, "rigId"),
      name: requiredText(formData, "name", "Inventory item"),
      category: optionalText(formData, "category"),
      quantityOnHand: integerOrDefault(formData, "quantityOnHand", 0),
      reorderPoint: integerOrNull(formData, "reorderPoint"),
      unit: optionalText(formData, "unit"),
      supplier: optionalText(formData, "supplier"),
      isCritical: formData.get("isCritical") === "true",
      notes: optionalText(formData, "notes"),
    },
  });

  revalidatePath("/stone");
}

export async function adjustFieldInventoryItemAction(formData: FormData) {
  const ownerId = await requireStoneOwnerId();
  const itemId = requiredText(formData, "itemId", "Inventory item ID");
  const adjustment = integerOrDefault(formData, "adjustment", 0);

  const item = await prisma.fieldInventoryItem.findFirst({
    where: { id: itemId, ownerId },
    select: { id: true, quantityOnHand: true },
  });

  if (!item) {
    throw new Error("Inventory item was not found.");
  }

  await prisma.fieldInventoryItem.update({
    where: { id: item.id },
    data: {
      quantityOnHand: Math.max(item.quantityOnHand + adjustment, 0),
    },
  });

  revalidatePath("/stone");
}

function requiredText(formData: FormData, field: string, label: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text;
}

function optionalText(formData: FormData, field: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function integerOrDefault(formData: FormData, field: string, fallback: number) {
  const value = formData.get(field);
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function integerOrNull(formData: FormData, field: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;

  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function enumValue<T extends string>(
  formData: FormData,
  field: string,
  fallback: T,
  allowed: T[],
): T {
  const value = formData.get(field);
  if (typeof value !== "string") return fallback;
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function dateOrToday(formData: FormData, field: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    return new Date();
  }

  const date = new Date(`${text}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function makeJobNumber() {
  return `STONE-${new Date().getFullYear()}-${randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}
