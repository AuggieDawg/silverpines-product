"use server";

import { randomUUID } from "crypto";

import {
  InvoiceStatus,
  Prisma,
  RepairDeviceType,
  RepairIntakeChannel,
  RepairPaymentMethod,
  RepairStatus,
  RepairTicketPriority,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { requireRepairOwnerId } from "@/lib/repair/queries";

const repairPaths = [
  "/client/overview",
  "/client/tickets",
  "/client/customers",
  "/client/inventory",
  "/client/invoices",
  "/client/photos",
];

export async function createRepairIntakeAction(formData: FormData) {
  const ownerId = await requireRepairOwnerId();

  const customerName = requiredText(formData, "customerName", "Customer name");
  const deviceLabel = requiredText(formData, "deviceLabel", "Device label");
  const reportedIssue = requiredText(formData, "reportedIssue", "Reported issue");

  const deviceType = enumValue(
    formData,
    "deviceType",
    RepairDeviceType.Phone,
    Object.values(RepairDeviceType),
  );

  const priority = enumValue(
    formData,
    "priority",
    RepairTicketPriority.Medium,
    Object.values(RepairTicketPriority),
  );

  const intakeChannel = enumValue(
    formData,
    "intakeChannel",
    RepairIntakeChannel.WalkIn,
    Object.values(RepairIntakeChannel),
  );

  const ticket = await prisma.$transaction(async (tx) => {
    const customer = await tx.repairCustomer.create({
      data: {
        ownerId,
        displayName: customerName,
        companyName: optionalText(formData, "companyName"),
        phone: optionalText(formData, "phone"),
        email: optionalText(formData, "email"),
        city: optionalText(formData, "city"),
        state: optionalText(formData, "state"),
        notes: optionalText(formData, "customerNotes"),
      },
    });

    const device = await tx.repairDevice.create({
      data: {
        ownerId,
        customerId: customer.id,
        label: deviceLabel,
        deviceType,
        brand: optionalText(formData, "brand"),
        model: optionalText(formData, "model"),
        serialNumber: optionalText(formData, "serialNumber"),
        imei: optionalText(formData, "imei"),
        operatingSystem: optionalText(formData, "operatingSystem"),
        accessoriesIncluded: optionalText(formData, "accessoriesIncluded"),
        issueSummary: reportedIssue,
        cosmeticCondition: optionalText(formData, "cosmeticCondition"),
        powersOn: checkboxToNullableBoolean(formData, "powersOn"),
        liquidDamageSuspected: checked(formData, "liquidDamageSuspected"),
        dataBackupRequested: checked(formData, "dataBackupRequested"),
        dataPrivacyAccepted: checked(formData, "dataPrivacyAccepted"),
      },
    });

    const createdTicket = await tx.repairTicket.create({
      data: {
        ownerId,
        customerId: customer.id,
        deviceId: device.id,
        ticketNumber: makeTicketNumber(),
        title: `${deviceLabel} repair intake`,
        priority,
        intakeChannel,
        reportedIssue,
        claimCheckCode: makeClaimCode(),
      },
    });

    await tx.repairAuditLog.create({
      data: {
        customerId: customer.id,
        ticketId: createdTicket.id,
        actorUserId: ownerId,
        entityType: "RepairTicket",
        entityId: createdTicket.id,
        action: "created_intake",
        metadata: {
          ticketNumber: createdTicket.ticketNumber,
          deviceLabel,
          customerName,
        },
      },
    });

    return createdTicket;
  });

  revalidateRepairPaths();
  redirect(`/client/tickets?created=${encodeURIComponent(ticket.ticketNumber)}`);
}

export async function updateTicketStatusAction(formData: FormData) {
  const ownerId = await requireRepairOwnerId();
  const ticketId = requiredText(formData, "ticketId", "Ticket ID");

  const status = enumValue(
    formData,
    "status",
    RepairStatus.Reported,
    Object.values(RepairStatus),
  );

  const now = new Date();
  const data: Prisma.RepairTicketUpdateManyMutationInput = { status };

  if (status === RepairStatus.Approved) data.approvedAt = now;
  if (status === RepairStatus.InProgress) data.startedAt = now;
  if (status === RepairStatus.Completed) data.completedAt = now;
  if (status === RepairStatus.Closed) data.closedAt = now;

  const result = await prisma.repairTicket.updateMany({
    where: { id: ticketId, ownerId },
    data,
  });

  if (result.count > 0) {
    await prisma.repairAuditLog.create({
      data: {
        ticketId,
        actorUserId: ownerId,
        entityType: "RepairTicket",
        entityId: ticketId,
        action: "updated_status",
        metadata: { status },
      },
    });
  }

  revalidateRepairPaths();
}

export async function saveTicketDiagnosisAction(formData: FormData) {
  const ownerId = await requireRepairOwnerId();
  const ticketId = requiredText(formData, "ticketId", "Ticket ID");

  const diagnosticSummary = optionalText(formData, "diagnosticSummary");
  const internalNotes = optionalText(formData, "internalNotes");

  const data: Prisma.RepairTicketUpdateManyMutationInput = {
    diagnosticSummary,
    internalNotes,
    quotedAmount: decimalOrNull(formData, "quotedAmount"),
    estimatedPartsCost: decimalOrNull(formData, "estimatedPartsCost"),
    estimatedLaborCost: decimalOrNull(formData, "estimatedLaborCost"),
    finalAmount: decimalOrNull(formData, "finalAmount"),
  };

  const result = await prisma.repairTicket.updateMany({
    where: { id: ticketId, ownerId },
    data,
  });

  if (result.count > 0) {
    await prisma.repairAuditLog.create({
      data: {
        ticketId,
        actorUserId: ownerId,
        entityType: "RepairTicket",
        entityId: ticketId,
        action: "saved_diagnosis_quote",
      },
    });
  }

  revalidateRepairPaths();
}

export async function createInvoiceFromTicketAction(formData: FormData) {
  const ownerId = await requireRepairOwnerId();
  const ticketId = requiredText(formData, "ticketId", "Ticket ID");

  const ticket = await prisma.repairTicket.findFirst({
    where: { id: ticketId, ownerId },
    select: {
      id: true,
      customerId: true,
      title: true,
      quotedAmount: true,
      finalAmount: true,
    },
  });

  if (!ticket) {
    throw new Error("Ticket was not found for the authenticated user.");
  }

  const subtotal =
    decimalToNumber(ticket.finalAmount) || decimalToNumber(ticket.quotedAmount);

  if (subtotal <= 0) {
    throw new Error("Add a quote or final amount before creating an invoice.");
  }

  const existingInvoice = await prisma.repairInvoice.findFirst({
    where: {
      ownerId,
      ticketId,
      status: { not: InvoiceStatus.Void },
    },
    select: { id: true },
  });

  if (existingInvoice) {
    revalidateRepairPaths();
    redirect("/client/invoices");
  }

  const now = new Date();

  await prisma.repairInvoice.create({
    data: {
      ownerId,
      customerId: ticket.customerId,
      ticketId: ticket.id,
      invoiceNumber: makeInvoiceNumber(),
      status: InvoiceStatus.Open,
      subtotal: new Prisma.Decimal(subtotal),
      taxAmount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(subtotal),
      amountPaid: new Prisma.Decimal(0),
      issuedAt: now,
      dueAt: addDays(now, 14),
      notes: `Generated from repair ticket: ${ticket.title}`,
    },
  });

  await prisma.repairAuditLog.create({
    data: {
      ticketId,
      actorUserId: ownerId,
      entityType: "RepairInvoice",
      action: "created_invoice_from_ticket",
    },
  });

  revalidateRepairPaths();
  redirect("/client/invoices");
}

export async function markInvoicePaidAction(formData: FormData) {
  const ownerId = await requireRepairOwnerId();
  const invoiceId = requiredText(formData, "invoiceId", "Invoice ID");

  const invoice = await prisma.repairInvoice.findFirst({
    where: { id: invoiceId, ownerId },
    select: {
      id: true,
      totalAmount: true,
      amountPaid: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice was not found for the authenticated user.");
  }

  const totalAmount = decimalToNumber(invoice.totalAmount);
  const requestedPaidAmount = decimalOrUndefined(formData, "amountPaid");
  const amountPaid = requestedPaidAmount
    ? decimalToNumber(requestedPaidAmount)
    : totalAmount;

  const paymentMethod = enumValueOrNull(
    formData,
    "paymentMethod",
    Object.values(RepairPaymentMethod),
  );

  await prisma.repairInvoice.update({
    where: { id: invoice.id },
    data: {
      amountPaid: new Prisma.Decimal(amountPaid),
      paymentMethod,
      status: amountPaid >= totalAmount ? InvoiceStatus.Paid : InvoiceStatus.Open,
      paidAt: amountPaid >= totalAmount ? new Date() : null,
    },
  });

  revalidateRepairPaths();
}

export async function createInventoryPartAction(formData: FormData) {
  const ownerId = await requireRepairOwnerId();
  const name = requiredText(formData, "name", "Part name");

  await prisma.inventoryPart.create({
    data: {
      ownerId,
      name,
      sku: optionalText(formData, "sku"),
      brand: optionalText(formData, "brand"),
      category: optionalText(formData, "category"),
      compatibleWith: optionalText(formData, "compatibleWith"),
      supplierName: optionalText(formData, "supplierName"),
      supplierUrl: optionalText(formData, "supplierUrl"),
      quantityOnHand: integerOrDefault(formData, "quantityOnHand", 0),
      reorderPoint: integerOrNull(formData, "reorderPoint"),
      unitCost: decimalOrNull(formData, "unitCost"),
      unitPrice: decimalOrNull(formData, "unitPrice"),
      notes: optionalText(formData, "notes"),
    },
  });

  revalidateRepairPaths();
}

export async function adjustInventoryPartAction(formData: FormData) {
  const ownerId = await requireRepairOwnerId();
  const partId = requiredText(formData, "partId", "Part ID");
  const adjustment = integerOrDefault(formData, "adjustment", 0);

  const part = await prisma.inventoryPart.findFirst({
    where: { id: partId, ownerId },
    select: {
      id: true,
      quantityOnHand: true,
    },
  });

  if (!part) {
    throw new Error("Inventory part was not found for the authenticated user.");
  }

  await prisma.inventoryPart.update({
    where: { id: part.id },
    data: {
      quantityOnHand: Math.max(part.quantityOnHand + adjustment, 0),
    },
  });

  revalidateRepairPaths();
}

function revalidateRepairPaths() {
  for (const path of repairPaths) {
    revalidatePath(path);
  }
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

function checked(formData: FormData, field: string) {
  return formData.get(field) === "true";
}

function checkboxToNullableBoolean(formData: FormData, field: string) {
  const value = formData.get(field);
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
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

function enumValueOrNull<T extends string>(
  formData: FormData,
  field: string,
  allowed: T[],
): T | null {
  const value = formData.get(field);
  if (typeof value !== "string") return null;
  return allowed.includes(value as T) ? (value as T) : null;
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

function decimalOrNull(formData: FormData, field: string) {
  const value = decimalOrUndefined(formData, field);
  return value ?? null;
}

function decimalOrUndefined(formData: FormData, field: string) {
  const value = formData.get(field);
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) return undefined;

  const parsed = Number(text);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} must be a valid positive number.`);
  }

  return new Prisma.Decimal(parsed);
}

function decimalToNumber(value: unknown) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);

  if (typeof value === "object" && "toNumber" in value) {
    const numberValue = (value as { toNumber: () => number }).toNumber();
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function makeTicketNumber() {
  return `RT-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function makeInvoiceNumber() {
  return `INV-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function makeClaimCode() {
  return randomUUID().slice(0, 6).toUpperCase();
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
