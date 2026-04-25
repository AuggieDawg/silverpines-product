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
