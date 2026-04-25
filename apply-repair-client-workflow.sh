#!/usr/bin/env bash
set -euo pipefail

echo "Creating Prisma-backed repair workflow files..."

mkdir -p lib/repair
mkdir -p components/repair
mkdir -p app/client/tickets
mkdir -p app/client/customers
mkdir -p app/client/inventory
mkdir -p app/client/invoices
mkdir -p app/client/photos

cat > lib/repair/queries.ts <<'TS'
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export type RepairMetric = {
  openTickets: number;
  customerCount: number;
  lowStockParts: number;
  unpaidInvoiceValue: number;
  photoCount: number;
};

export type RepairCustomerView = {
  id: string;
  displayName: string;
  companyName: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  active: boolean;
  ticketCount: number;
  deviceCount: number;
  invoiceCount: number;
  updatedLabel: string;
};

export type RepairTicketView = {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  intakeChannel: string;
  reportedIssue: string | null;
  diagnosticSummary: string | null;
  quotedAmount: number | null;
  estimatedPartsCost: number | null;
  estimatedLaborCost: number | null;
  finalAmount: number | null;
  receivedLabel: string;
  updatedLabel: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  deviceLabel: string;
  deviceType: string;
  deviceBrand: string | null;
  deviceModel: string | null;
  invoiceCount: number;
  noteCount: number;
  photoCount: number;
};

export type InventoryPartView = {
  id: string;
  sku: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  compatibleWith: string | null;
  supplierName: string | null;
  quantityOnHand: number;
  reorderPoint: number | null;
  unitCost: number | null;
  unitPrice: number | null;
  isLowStock: boolean;
  updatedLabel: string;
};

export type RepairInvoiceView = {
  id: string;
  invoiceNumber: string;
  status: string;
  paymentMethod: string | null;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  issuedLabel: string;
  dueLabel: string;
  paidLabel: string;
  customerName: string;
  ticketTitle: string | null;
};

export type RepairPhotoView = {
  id: string;
  category: string;
  caption: string | null;
  originalFileName: string | null;
  uploadedLabel: string;
  ticketTitle: string;
  deviceLabel: string | null;
};

export type RepairWorkspace = {
  metrics: RepairMetric;
  tickets: RepairTicketView[];
  customers: RepairCustomerView[];
  inventoryParts: InventoryPartView[];
  invoices: RepairInvoiceView[];
  photos: RepairPhotoView[];
};

export async function requireRepairOwnerId() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  return session.user.id;
}

export async function getRepairWorkspaceForCurrentUser() {
  const ownerId = await requireRepairOwnerId();
  return getRepairWorkspace(ownerId);
}

export async function getRepairWorkspace(ownerId: string): Promise<RepairWorkspace> {
  const [customers, tickets, inventoryParts, invoices, photos, photoCount] =
    await prisma.$transaction([
      prisma.repairCustomer.findMany({
        where: { ownerId },
        orderBy: { updatedAt: "desc" },
        take: 50,
        include: {
          _count: {
            select: {
              tickets: true,
              devices: true,
              invoices: true,
            },
          },
        },
      }),

      prisma.repairTicket.findMany({
        where: { ownerId },
        orderBy: [{ updatedAt: "desc" }],
        take: 80,
        include: {
          customer: {
            select: {
              displayName: true,
              phone: true,
              email: true,
            },
          },
          device: {
            select: {
              label: true,
              deviceType: true,
              brand: true,
              model: true,
            },
          },
          _count: {
            select: {
              invoices: true,
              notes: true,
              photos: true,
            },
          },
        },
      }),

      prisma.inventoryPart.findMany({
        where: { ownerId, isActive: true },
        orderBy: [{ quantityOnHand: "asc" }, { name: "asc" }],
        take: 80,
      }),

      prisma.repairInvoice.findMany({
        where: { ownerId },
        orderBy: { updatedAt: "desc" },
        take: 80,
        include: {
          customer: {
            select: { displayName: true },
          },
          ticket: {
            select: { title: true },
          },
        },
      }),

      prisma.repairPhoto.findMany({
        where: {
          ticket: { ownerId },
        },
        orderBy: { uploadedAt: "desc" },
        take: 24,
        include: {
          ticket: { select: { title: true } },
          device: { select: { label: true } },
        },
      }),

      prisma.repairPhoto.count({
        where: {
          ticket: { ownerId },
        },
      }),
    ]);

  const ticketViews = tickets.map((ticket) => ({
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    intakeChannel: ticket.intakeChannel,
    reportedIssue: ticket.reportedIssue,
    diagnosticSummary: ticket.diagnosticSummary,
    quotedAmount: decimalToNumberOrNull(ticket.quotedAmount),
    estimatedPartsCost: decimalToNumberOrNull(ticket.estimatedPartsCost),
    estimatedLaborCost: decimalToNumberOrNull(ticket.estimatedLaborCost),
    finalAmount: decimalToNumberOrNull(ticket.finalAmount),
    receivedLabel: formatDate(ticket.receivedAt),
    updatedLabel: formatDate(ticket.updatedAt),
    customerName: ticket.customer.displayName,
    customerPhone: ticket.customer.phone,
    customerEmail: ticket.customer.email,
    deviceLabel: ticket.device.label,
    deviceType: ticket.device.deviceType,
    deviceBrand: ticket.device.brand,
    deviceModel: ticket.device.model,
    invoiceCount: ticket._count.invoices,
    noteCount: ticket._count.notes,
    photoCount: ticket._count.photos,
  }));

  const inventoryViews = inventoryParts.map((part) => {
    const reorderPoint = part.reorderPoint ?? 0;
    const isLowStock = reorderPoint > 0 && part.quantityOnHand <= reorderPoint;

    return {
      id: part.id,
      sku: part.sku,
      name: part.name,
      brand: part.brand,
      category: part.category,
      compatibleWith: part.compatibleWith,
      supplierName: part.supplierName,
      quantityOnHand: part.quantityOnHand,
      reorderPoint: part.reorderPoint,
      unitCost: decimalToNumberOrNull(part.unitCost),
      unitPrice: decimalToNumberOrNull(part.unitPrice),
      isLowStock,
      updatedLabel: formatDate(part.updatedAt),
    };
  });

  const invoiceViews = invoices.map((invoice) => {
    const totalAmount = decimalToNumber(invoice.totalAmount);
    const amountPaid = decimalToNumber(invoice.amountPaid);

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      paymentMethod: invoice.paymentMethod,
      subtotal: decimalToNumber(invoice.subtotal),
      taxAmount: decimalToNumber(invoice.taxAmount),
      totalAmount,
      amountPaid,
      balance: Math.max(totalAmount - amountPaid, 0),
      issuedLabel: invoice.issuedAt ? formatDate(invoice.issuedAt) : "Not issued",
      dueLabel: invoice.dueAt ? formatDate(invoice.dueAt) : "No due date",
      paidLabel: invoice.paidAt ? formatDate(invoice.paidAt) : "Not paid",
      customerName: invoice.customer.displayName,
      ticketTitle: invoice.ticket?.title ?? null,
    };
  });

  const openTickets = ticketViews.filter(
    (ticket) => !["Closed", "Completed", "Cancelled"].includes(ticket.status),
  ).length;

  const lowStockParts = inventoryViews.filter((part) => part.isLowStock).length;

  const unpaidInvoiceValue = invoiceViews
    .filter((invoice) => invoice.status !== "Paid" && invoice.status !== "Void")
    .reduce((sum, invoice) => sum + invoice.balance, 0);

  return {
    metrics: {
      openTickets,
      customerCount: customers.length,
      lowStockParts,
      unpaidInvoiceValue,
      photoCount,
    },

    customers: customers.map((customer) => ({
      id: customer.id,
      displayName: customer.displayName,
      companyName: customer.companyName,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      state: customer.state,
      active: customer.isActive,
      ticketCount: customer._count.tickets,
      deviceCount: customer._count.devices,
      invoiceCount: customer._count.invoices,
      updatedLabel: formatDate(customer.updatedAt),
    })),

    tickets: ticketViews,
    inventoryParts: inventoryViews,
    invoices: invoiceViews,

    photos: photos.map((photo) => ({
      id: photo.id,
      category: photo.category,
      caption: photo.caption,
      originalFileName: photo.originalFileName,
      uploadedLabel: formatDate(photo.uploadedAt),
      ticketTitle: photo.ticket.title,
      deviceLabel: photo.device?.label ?? null,
    })),
  };
}

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function statusLabel(status: string) {
  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
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

function decimalToNumberOrNull(value: unknown) {
  if (value === null || value === undefined) return null;
  return decimalToNumber(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
TS

cat > lib/repair/actions.ts <<'TS'
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
TS

cat > components/repair/RepairOverview.tsx <<'TSX'
import Link from "next/link";
import {
  Boxes,
  Camera,
  ClipboardList,
  DollarSign,
  Plus,
  ReceiptText,
  Users,
} from "lucide-react";

import {
  formatCurrency,
  getRepairWorkspaceForCurrentUser,
  statusLabel,
} from "@/lib/repair/queries";

export default async function RepairOverview() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const { metrics, tickets, inventoryParts, invoices, photos } = workspace;

  const lowStockParts = inventoryParts.filter((part) => part.isLowStock);
  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.status !== "Paid" && invoice.status !== "Void",
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Open tickets"
          value={metrics.openTickets.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="border-red-500/20 bg-red-500/10 text-red-100 shadow-red-900/20"
        />

        <MetricCard
          title="Customers"
          value={metrics.customerCount.toString()}
          icon={<Users className="h-5 w-5" />}
          tone="border-sky-500/20 bg-sky-500/10 text-sky-100 shadow-sky-900/20"
        />

        <MetricCard
          title="Parts below reorder"
          value={metrics.lowStockParts.toString()}
          icon={<Boxes className="h-5 w-5" />}
          tone="border-amber-500/20 bg-amber-500/10 text-amber-100 shadow-amber-900/20"
        />

        <MetricCard
          title="Unpaid invoices"
          value={formatCurrency(metrics.unpaidInvoiceValue)}
          icon={<DollarSign className="h-5 w-5" />}
          tone="border-emerald-500/20 bg-emerald-500/10 text-emerald-100 shadow-emerald-900/20"
        />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              End-to-end workflow
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Intake → diagnosis → quote → invoice → payment
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              This client module is now pointed at your real repair schema. Start
              with a customer/device intake, move the ticket through the shop,
              create an invoice, and mark it paid.
            </p>
          </div>

          <Link
            href="/client/tickets#new-intake"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/15 px-5 py-3 text-sm font-medium text-red-100 transition hover:bg-red-500/25"
          >
            <Plus className="h-4 w-4" />
            New repair intake
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                Active queue
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Tickets moving through the shop
              </h2>
            </div>

            <Link
              href="/client/tickets"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
            >
              Open tickets
            </Link>
          </div>

          {tickets.length === 0 ? (
            <EmptyState
              title="No repair tickets yet"
              body="Create your first real repair intake. The dashboard will stay clean instead of pretending fake demo work exists."
              href="/client/tickets#new-intake"
              action="Create intake"
            />
          ) : (
            <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
              <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr] gap-4 border-b border-white/10 bg-black/20 px-4 py-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
                <span>Ticket</span>
                <span>Customer</span>
                <span>Status</span>
                <span>Quoted</span>
              </div>

              <div className="divide-y divide-white/10">
                {tickets.slice(0, 6).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr] gap-4 px-4 py-4 text-sm"
                  >
                    <div>
                      <p className="font-medium text-white">{ticket.title}</p>
                      <p className="mt-1 text-zinc-400">
                        {ticket.ticketNumber} · {ticket.deviceLabel}
                      </p>
                    </div>

                    <div className="text-zinc-300">{ticket.customerName}</div>

                    <div>
                      <span className={statusPill(ticket.status)}>
                        {statusLabel(ticket.status)}
                      </span>
                    </div>

                    <div className="text-zinc-200">
                      {ticket.quotedAmount
                        ? formatCurrency(ticket.quotedAmount)
                        : "Pending"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  Inventory pressure
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Low-stock parts
                </h2>
              </div>

              <Boxes className="h-5 w-5 text-zinc-400" />
            </div>

            {lowStockParts.length === 0 ? (
              <EmptyState
                title="No low-stock parts"
                body="Once parts are added with reorder points, parts below threshold will appear here."
                href="/client/inventory"
                action="Manage inventory"
              />
            ) : (
              <div className="mt-5 space-y-3">
                {lowStockParts.slice(0, 4).map((part) => (
                  <div
                    key={part.id}
                    className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{part.name}</p>
                        <p className="mt-1 text-sm text-amber-100/80">
                          {part.sku ? `SKU ${part.sku}` : "No SKU yet"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {part.quantityOnHand} left
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
                          Reorder at {part.reorderPoint ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  Billing snapshot
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Invoice status
                </h2>
              </div>

              <ReceiptText className="h-5 w-5 text-zinc-400" />
            </div>

            {unpaidInvoices.length === 0 ? (
              <EmptyState
                title="No unpaid invoices"
                body="Invoices generated from tickets will appear here until they are paid."
                href="/client/invoices"
                action="Open invoices"
              />
            ) : (
              <div className="mt-5 space-y-3">
                {unpaidInvoices.slice(0, 4).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {invoice.customerName}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(invoice.balance)}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          {invoice.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Documentation
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Repair photo/document trail
            </h2>
          </div>

          <Camera className="h-5 w-5 text-zinc-400" />
        </div>

        {photos.length === 0 ? (
          <EmptyState
            title="No repair photos yet"
            body="Photo upload/storage is the next serious upgrade. For now, this page is ready to show real uploaded evidence once storage is wired."
            href="/client/photos"
            action="Open photos"
          />
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {photos.slice(0, 4).map((photo) => (
              <div
                key={photo.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-4"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  {photo.category}
                </p>
                <p className="mt-2 font-medium text-white">{photo.ticketTitle}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {photo.caption ?? "No caption provided."}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className={`rounded-3xl border p-5 shadow-xl ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] opacity-70">
            {title}
          </p>
          <p className="mt-3 text-2xl font-semibold">{value}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
      <p className="font-medium text-white">{title}</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
      >
        {action}
      </Link>
    </div>
  );
}

function statusPill(status: string) {
  switch (status) {
    case "Reported":
      return "inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200";
    case "Approved":
      return "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200";
    case "InProgress":
      return "inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200";
    case "WaitingOnParts":
      return "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200";
    case "Completed":
    case "Closed":
      return "inline-flex rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-200";
    case "Cancelled":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    default:
      return "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200";
  }
}
TSX

cat > app/client/tickets/page.tsx <<'TSX'
import {
  createInvoiceFromTicketAction,
  createRepairIntakeAction,
  saveTicketDiagnosisAction,
  updateTicketStatusAction,
} from "@/lib/repair/actions";
import {
  formatCurrency,
  getRepairWorkspaceForCurrentUser,
  statusLabel,
} from "@/lib/repair/queries";

const deviceTypes = [
  "Phone",
  "Tablet",
  "Laptop",
  "Desktop",
  "AllInOne",
  "CustomBuild",
  "Monitor",
  "GameConsole",
  "Smartwatch",
  "Printer",
  "Other",
];

const priorities = ["Low", "Medium", "High", "Urgent"];
const intakeChannels = [
  "WalkIn",
  "Phone",
  "Text",
  "WhatsApp",
  "Facebook",
  "Website",
  "Referral",
  "Other",
];

const statuses = [
  "Reported",
  "Approved",
  "Scheduled",
  "InProgress",
  "WaitingOnParts",
  "Completed",
  "Closed",
  "Cancelled",
];

export default async function RepairTicketsPage() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const tickets = workspace.tickets;

  return (
    <div className="space-y-6">
      <section
        id="new-intake"
        className="rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-5"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-red-200/70">
            New intake
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Create a real customer, device, and repair ticket
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
            This is the beginning of the workflow. No demo data. Every intake
            creates real database records tied to your authenticated user.
          </p>
        </div>

        <form action={createRepairIntakeAction} className="mt-6 grid gap-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Customer name" name="customerName" required />
            <Field label="Phone" name="phone" />
            <Field label="Email" name="email" type="email" />
            <Field label="Company" name="companyName" />
            <Field label="City" name="city" defaultValue="Vernal" />
            <Field label="State" name="state" defaultValue="UT" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Device label" name="deviceLabel" placeholder="iPhone 13 Pro, Dell Inspiron, Custom PC" required />

            <Select label="Device type" name="deviceType" values={deviceTypes} />
            <Select label="Priority" name="priority" values={priorities} defaultValue="Medium" />

            <Field label="Brand" name="brand" placeholder="Apple, Samsung, Dell, HP" />
            <Field label="Model" name="model" />
            <Field label="Serial number" name="serialNumber" />
            <Field label="IMEI" name="imei" />
            <Field label="Operating system" name="operatingSystem" placeholder="iOS, Android, Windows 11" />
            <Select label="Intake channel" name="intakeChannel" values={intakeChannels} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TextArea
              label="Reported issue"
              name="reportedIssue"
              placeholder="Describe the failure, customer complaint, symptoms, and urgency."
              required
            />
            <TextArea
              label="Cosmetic condition"
              name="cosmeticCondition"
              placeholder="Cracks, dents, missing screws, liquid indicators, frame damage, screen condition."
            />
            <TextArea
              label="Accessories included"
              name="accessoriesIncluded"
              placeholder="Charger, case, SIM tray, power cable, bag, external drive."
            />
            <TextArea
              label="Customer notes"
              name="customerNotes"
              placeholder="Anything useful about customer expectations, communication, or warranty terms."
            />
          </div>

          <div className="grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 md:grid-cols-2 xl:grid-cols-4">
            <Checkbox label="Powers on" name="powersOn" />
            <Checkbox label="Liquid damage suspected" name="liquidDamageSuspected" />
            <Checkbox label="Data backup requested" name="dataBackupRequested" />
            <Checkbox label="Customer accepted data privacy terms" name="dataPrivacyAccepted" />
          </div>

          <div>
            <button
              type="submit"
              className="rounded-full border border-red-500/30 bg-red-500/20 px-5 py-3 text-sm font-medium text-red-100 transition hover:bg-red-500/30"
            >
              Create intake ticket
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Repair queue
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Work tickets
          </h2>
        </div>

        {tickets.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="font-medium text-white">No tickets yet.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Create your first intake above. This page intentionally stays
              empty until you enter real repair work.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={statusPill(ticket.status)}>
                        {statusLabel(ticket.status)}
                      </span>
                      <span className={priorityPill(ticket.priority)}>
                        {ticket.priority}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                        {ticket.ticketNumber}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {ticket.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {ticket.reportedIssue ?? "No issue summary provided."}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                      <Info label="Customer" value={ticket.customerName} />
                      <Info label="Phone" value={ticket.customerPhone ?? "—"} />
                      <Info label="Device" value={ticket.deviceLabel} />
                      <Info
                        label="Quote"
                        value={
                          ticket.quotedAmount
                            ? formatCurrency(ticket.quotedAmount)
                            : "Pending"
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <form action={updateTicketStatusAction} className="space-y-3">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <label className="block text-xs uppercase tracking-[0.22em] text-zinc-500">
                        Update status
                      </label>
                      <select
                        name="status"
                        defaultValue={ticket.status}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
                      >
                        Save status
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.45fr]">
                  <form
                    action={saveTicketDiagnosisAction}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <input type="hidden" name="ticketId" value={ticket.id} />

                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Diagnosis and quote
                    </p>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <TextArea
                        label="Diagnostic summary"
                        name="diagnosticSummary"
                        defaultValue={ticket.diagnosticSummary ?? ""}
                      />
                      <TextArea
                        label="Internal notes"
                        name="internalNotes"
                        placeholder="Private shop notes, risk, part notes, customer concerns."
                      />

                      <Field
                        label="Parts estimate"
                        name="estimatedPartsCost"
                        type="number"
                        step="0.01"
                        defaultValue={ticket.estimatedPartsCost?.toString() ?? ""}
                      />

                      <Field
                        label="Labor estimate"
                        name="estimatedLaborCost"
                        type="number"
                        step="0.01"
                        defaultValue={ticket.estimatedLaborCost?.toString() ?? ""}
                      />

                      <Field
                        label="Quoted amount"
                        name="quotedAmount"
                        type="number"
                        step="0.01"
                        defaultValue={ticket.quotedAmount?.toString() ?? ""}
                      />

                      <Field
                        label="Final amount"
                        name="finalAmount"
                        type="number"
                        step="0.01"
                        defaultValue={ticket.finalAmount?.toString() ?? ""}
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
                    >
                      Save diagnosis / quote
                    </button>
                  </form>

                  <form
                    action={createInvoiceFromTicketAction}
                    className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4"
                  >
                    <input type="hidden" name="ticketId" value={ticket.id} />

                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">
                      Invoice
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      Create an invoice from the final amount, or the quoted
                      amount if no final amount has been entered.
                    </p>

                    <button
                      type="submit"
                      className="mt-4 w-full rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/25"
                    >
                      {ticket.invoiceCount > 0
                        ? "Open existing invoice"
                        : "Create invoice"}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        step={step}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  required = false,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={4}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
      />
    </label>
  );
}

function Select({
  label,
  name,
  values,
  defaultValue,
}: {
  label: string;
  name: string;
  values: string[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? values[0]}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
      >
        {values.map((value) => (
          <option key={value} value={value}>
            {statusLabel(value)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-zinc-300">
      <input name={name} type="checkbox" value="true" className="h-4 w-4" />
      {label}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value}</p>
    </div>
  );
}

function statusPill(status: string) {
  switch (status) {
    case "Reported":
      return "inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200";
    case "Approved":
      return "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200";
    case "InProgress":
      return "inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200";
    case "WaitingOnParts":
      return "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200";
    case "Completed":
    case "Closed":
      return "inline-flex rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-200";
    case "Cancelled":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    default:
      return "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200";
  }
}

function priorityPill(priority: string) {
  switch (priority) {
    case "Urgent":
    case "High":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    case "Medium":
      return "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200";
    default:
      return "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200";
  }
}
TSX

cat > app/client/customers/page.tsx <<'TSX'
import Link from "next/link";

import { getRepairWorkspaceForCurrentUser } from "@/lib/repair/queries";

export default async function RepairCustomersPage() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const customers = workspace.customers;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Customer records
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Repair customers
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Customers are created through the intake workflow so every record
              starts connected to a real device and ticket.
            </p>
          </div>

          <Link
            href="/client/tickets#new-intake"
            className="rounded-full border border-red-500/30 bg-red-500/15 px-5 py-3 text-sm text-red-100 transition hover:bg-red-500/25"
          >
            New intake
          </Link>
        </div>

        {customers.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="font-medium text-white">No customers yet.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              This is correct for a clean system. Create the first intake and
              customer data will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {customers.map((customer) => (
              <article
                key={customer.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {customer.displayName}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {customer.companyName ?? "Individual customer"}
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                    {customer.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                  <Row label="Phone" value={customer.phone ?? "—"} />
                  <Row label="Email" value={customer.email ?? "—"} />
                  <Row
                    label="Location"
                    value={[customer.city, customer.state].filter(Boolean).join(", ") || "—"}
                  />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <Count label="Tickets" value={customer.ticketCount} />
                  <Count label="Devices" value={customer.deviceCount} />
                  <Count label="Invoices" value={customer.invoiceCount} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
    </div>
  );
}
TSX

cat > app/client/inventory/page.tsx <<'TSX'
import {
  adjustInventoryPartAction,
  createInventoryPartAction,
} from "@/lib/repair/actions";
import {
  formatCurrency,
  getRepairWorkspaceForCurrentUser,
} from "@/lib/repair/queries";

export default async function RepairInventoryPage() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const parts = workspace.inventoryParts;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Parts control
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Add inventory part
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Track screens, batteries, charging ports, thermal paste, hinges,
            cables, adapters, and other repair materials.
          </p>
        </div>

        <form action={createInventoryPartAction} className="mt-6 grid gap-4">
          <div className="grid gap-4 lg:grid-cols-4">
            <Field label="Part name" name="name" required />
            <Field label="SKU" name="sku" />
            <Field label="Brand" name="brand" />
            <Field label="Category" name="category" placeholder="Display, Battery, Charging, Consumable" />
            <Field label="Compatible with" name="compatibleWith" />
            <Field label="Supplier" name="supplierName" />
            <Field label="Supplier URL" name="supplierUrl" />
            <Field label="Quantity on hand" name="quantityOnHand" type="number" defaultValue="0" />
            <Field label="Reorder point" name="reorderPoint" type="number" />
            <Field label="Unit cost" name="unitCost" type="number" step="0.01" />
            <Field label="Unit price" name="unitPrice" type="number" step="0.01" />
            <Field label="Notes" name="notes" />
          </div>

          <button
            type="submit"
            className="w-fit rounded-full border border-red-500/30 bg-red-500/15 px-5 py-3 text-sm font-medium text-red-100 transition hover:bg-red-500/25"
          >
            Add part
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Current stock
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Inventory
          </h2>
        </div>

        {parts.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="font-medium text-white">No parts in inventory yet.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Add real parts above. Low-stock alerts will appear once reorder
              points are configured.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {parts.map((part) => (
              <article
                key={part.id}
                className={[
                  "rounded-3xl border p-5",
                  part.isLowStock
                    ? "border-amber-500/20 bg-amber-500/[0.06]"
                    : "border-white/10 bg-black/20",
                ].join(" ")}
              >
                <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {part.isLowStock ? (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">
                          Low stock
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200">
                          Stocked
                        </span>
                      )}
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                        {part.category ?? "Uncategorized"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {part.name}
                    </h3>

                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                      <Info label="SKU" value={part.sku ?? "—"} />
                      <Info label="Compatible" value={part.compatibleWith ?? "—"} />
                      <Info label="Supplier" value={part.supplierName ?? "—"} />
                      <Info label="Unit cost" value={formatCurrency(part.unitCost)} />
                      <Info label="Unit price" value={formatCurrency(part.unitPrice)} />
                      <Info label="Updated" value={part.updatedLabel} />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Quantity
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-white">
                      {part.quantityOnHand}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Reorder at {part.reorderPoint ?? 0}
                    </p>

                    <form action={adjustInventoryPartAction} className="mt-4 flex gap-2">
                      <input type="hidden" name="partId" value={part.id} />
                      <input
                        name="adjustment"
                        type="number"
                        defaultValue="1"
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
                      >
                        Adjust
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
      />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value}</p>
    </div>
  );
}
TSX

cat > app/client/invoices/page.tsx <<'TSX'
import { markInvoicePaidAction } from "@/lib/repair/actions";
import {
  formatCurrency,
  getRepairWorkspaceForCurrentUser,
} from "@/lib/repair/queries";

const paymentMethods = ["Cash", "Card", "Transfer", "Zelle", "CashApp", "Other"];

export default async function RepairInvoicesPage() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const invoices = workspace.invoices;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Billing
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Repair invoices
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Invoices are created from repair tickets after a quote or final
            amount is entered.
          </p>
        </div>

        {invoices.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="font-medium text-white">No invoices yet.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Finish a diagnosis and quote on a ticket, then create the invoice
              from the ticket page.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {invoices.map((invoice) => (
              <article
                key={invoice.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={invoicePill(invoice.status)}>
                        {invoice.status}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                        {invoice.invoiceNumber}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {invoice.customerName}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      {invoice.ticketTitle ?? "General invoice"}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                      <Info label="Subtotal" value={formatCurrency(invoice.subtotal)} />
                      <Info label="Total" value={formatCurrency(invoice.totalAmount)} />
                      <Info label="Paid" value={formatCurrency(invoice.amountPaid)} />
                      <Info label="Balance" value={formatCurrency(invoice.balance)} />
                      <Info label="Issued" value={invoice.issuedLabel} />
                      <Info label="Due" value={invoice.dueLabel} />
                      <Info label="Paid date" value={invoice.paidLabel} />
                      <Info label="Method" value={invoice.paymentMethod ?? "—"} />
                    </div>
                  </div>

                  <form
                    action={markInvoicePaidAction}
                    className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4"
                  >
                    <input type="hidden" name="invoiceId" value={invoice.id} />

                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">
                      Payment
                    </p>

                    <label className="mt-4 block">
                      <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Amount paid
                      </span>
                      <input
                        name="amountPaid"
                        type="number"
                        step="0.01"
                        defaultValue={invoice.totalAmount.toString()}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>

                    <label className="mt-4 block">
                      <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Method
                      </span>
                      <select
                        name="paymentMethod"
                        defaultValue="Cash"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      >
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="submit"
                      className="mt-4 w-full rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/25"
                    >
                      Mark paid
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value}</p>
    </div>
  );
}

function invoicePill(status: string) {
  switch (status) {
    case "Paid":
      return "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200";
    case "Overdue":
      return "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200";
    case "Open":
      return "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200";
    default:
      return "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200";
  }
}
TSX

cat > app/client/photos/page.tsx <<'TSX'
import { Camera } from "lucide-react";

import { getRepairWorkspaceForCurrentUser } from "@/lib/repair/queries";

export default async function RepairPhotosPage() {
  const workspace = await getRepairWorkspaceForCurrentUser();
  const photos = workspace.photos;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Repair evidence
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Photos and documentation
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              This page is ready for real repair photos. The next production
              upgrade should wire file upload storage, image previews, and
              before/during/after tagging.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <Camera className="h-5 w-5 text-zinc-300" />
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="font-medium text-white">No photos uploaded yet.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Good. This means we removed fake gallery data. For production, add
              storage-backed upload to `RepairPhoto` so every repair has a clean
              evidence trail.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo) => (
              <article
                key={photo.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex h-40 items-center justify-center rounded-3xl border border-white/10 bg-[linear-gradient(135deg,_rgba(239,68,68,0.16),_rgba(255,255,255,0.02)_45%,_rgba(59,130,246,0.12))]">
                  <Camera className="h-8 w-8 text-zinc-200/80" />
                </div>

                <div className="mt-4">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                    {photo.category}
                  </span>
                  <h3 className="mt-3 font-semibold text-white">
                    {photo.ticketTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {photo.caption ?? "No caption provided."}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Uploaded {photo.uploadedLabel}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
TSX

echo "Repair workflow files written."
echo ""
echo "Next steps:"
echo "  npm run db:generate"
echo "  npm run build"
echo "  git diff --stat"
echo "  git diff"
