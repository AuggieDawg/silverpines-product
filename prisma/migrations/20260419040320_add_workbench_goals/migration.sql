/*
  Warnings:

  - You are about to drop the `CameraHealthSample` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CameraStreamProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecordingClip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityAuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityDevice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityInvoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityProperty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityPropertyMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityServiceTicket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityZone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Snapshot` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkbenchGoalStatus" AS ENUM ('Planned', 'Active', 'AtRisk', 'Achieved', 'Paused');

-- CreateEnum
CREATE TYPE "RepairDeviceType" AS ENUM ('Phone', 'Tablet', 'Laptop', 'Desktop', 'AllInOne', 'CustomBuild', 'Monitor', 'GameConsole', 'Smartwatch', 'Printer', 'Other');

-- CreateEnum
CREATE TYPE "RepairTicketPriority" AS ENUM ('Low', 'Medium', 'High', 'Urgent');

-- CreateEnum
CREATE TYPE "RepairIntakeChannel" AS ENUM ('WalkIn', 'Phone', 'Text', 'WhatsApp', 'Facebook', 'Website', 'Referral', 'Other');

-- CreateEnum
CREATE TYPE "RepairQuoteStatus" AS ENUM ('Draft', 'Sent', 'Approved', 'Rejected', 'Expired');

-- CreateEnum
CREATE TYPE "RepairPhotoCategory" AS ENUM ('Intake', 'Before', 'Damage', 'Diagnostic', 'Progress', 'After', 'Receipt', 'Pickup', 'Other');

-- CreateEnum
CREATE TYPE "RepairPaymentMethod" AS ENUM ('Cash', 'Card', 'Transfer', 'Zelle', 'CashApp', 'Other');

-- DropForeignKey
ALTER TABLE "CameraHealthSample" DROP CONSTRAINT "CameraHealthSample_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "CameraStreamProfile" DROP CONSTRAINT "CameraStreamProfile_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "RecordingClip" DROP CONSTRAINT "RecordingClip_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityAlert" DROP CONSTRAINT "SecurityAlert_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityAlert" DROP CONSTRAINT "SecurityAlert_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityAlert" DROP CONSTRAINT "SecurityAlert_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityAuditLog" DROP CONSTRAINT "SecurityAuditLog_actorUserId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityAuditLog" DROP CONSTRAINT "SecurityAuditLog_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityDevice" DROP CONSTRAINT "SecurityDevice_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityDevice" DROP CONSTRAINT "SecurityDevice_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityDocument" DROP CONSTRAINT "SecurityDocument_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityEvent" DROP CONSTRAINT "SecurityEvent_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityEvent" DROP CONSTRAINT "SecurityEvent_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityEvent" DROP CONSTRAINT "SecurityEvent_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityInvoice" DROP CONSTRAINT "SecurityInvoice_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityProperty" DROP CONSTRAINT "SecurityProperty_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityPropertyMember" DROP CONSTRAINT "SecurityPropertyMember_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityPropertyMember" DROP CONSTRAINT "SecurityPropertyMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityServiceTicket" DROP CONSTRAINT "SecurityServiceTicket_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityZone" DROP CONSTRAINT "SecurityZone_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Snapshot" DROP CONSTRAINT "Snapshot_deviceId_fkey";

-- DropTable
DROP TABLE "CameraHealthSample";

-- DropTable
DROP TABLE "CameraStreamProfile";

-- DropTable
DROP TABLE "RecordingClip";

-- DropTable
DROP TABLE "SecurityAlert";

-- DropTable
DROP TABLE "SecurityAuditLog";

-- DropTable
DROP TABLE "SecurityDevice";

-- DropTable
DROP TABLE "SecurityDocument";

-- DropTable
DROP TABLE "SecurityEvent";

-- DropTable
DROP TABLE "SecurityInvoice";

-- DropTable
DROP TABLE "SecurityProperty";

-- DropTable
DROP TABLE "SecurityPropertyMember";

-- DropTable
DROP TABLE "SecurityServiceTicket";

-- DropTable
DROP TABLE "SecurityZone";

-- DropTable
DROP TABLE "Snapshot";

-- DropEnum
DROP TYPE "CameraStreamKind";

-- DropEnum
DROP TYPE "CameraStreamStatus";

-- DropEnum
DROP TYPE "CameraTransport";

-- DropEnum
DROP TYPE "SecurityAlertSeverity";

-- DropEnum
DROP TYPE "SecurityAlertStatus";

-- DropEnum
DROP TYPE "SecurityDeviceStatus";

-- DropEnum
DROP TYPE "SecurityDeviceType";

-- DropEnum
DROP TYPE "SecurityEventType";

-- DropEnum
DROP TYPE "SecurityPropertyAccessRole";

-- DropEnum
DROP TYPE "ServiceTicketPriority";

-- DropEnum
DROP TYPE "ServiceTicketStatus";

-- CreateTable
CREATE TABLE "WorkbenchGoal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "successMetric" TEXT,
    "targetDate" TIMESTAMP(3),
    "status" "WorkbenchGoalStatus" NOT NULL DEFAULT 'Planned',
    "priority" "WorkbenchTaskPriority" NOT NULL DEFAULT 'Medium',
    "mapX" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "mapY" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "WorkbenchGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkbenchGoalTask" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkbenchGoalTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairCustomer" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "companyName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'US',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairDevice" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "deviceType" "RepairDeviceType" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "color" TEXT,
    "serialNumber" TEXT,
    "imei" TEXT,
    "storageCapacity" TEXT,
    "operatingSystem" TEXT,
    "passcodeHint" TEXT,
    "accessoriesIncluded" TEXT,
    "issueSummary" TEXT,
    "cosmeticCondition" TEXT,
    "powersOn" BOOLEAN,
    "liquidDamageSuspected" BOOLEAN NOT NULL DEFAULT false,
    "dataBackupRequested" BOOLEAN NOT NULL DEFAULT false,
    "dataPrivacyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairTicket" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "RepairStatus" NOT NULL DEFAULT 'Reported',
    "priority" "RepairTicketPriority" NOT NULL DEFAULT 'Medium',
    "intakeChannel" "RepairIntakeChannel" NOT NULL DEFAULT 'WalkIn',
    "reportedIssue" TEXT,
    "diagnosticSummary" TEXT,
    "internalNotes" TEXT,
    "claimCheckCode" TEXT,
    "quotedAmount" DECIMAL(10,2),
    "estimatedPartsCost" DECIMAL(10,2),
    "estimatedLaborCost" DECIMAL(10,2),
    "finalAmount" DECIMAL(10,2),
    "depositAmount" DECIMAL(10,2),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairNote" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "body" TEXT NOT NULL,
    "isCustomerVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryPart" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "category" TEXT,
    "compatibleWith" TEXT,
    "supplierName" TEXT,
    "supplierUrl" TEXT,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER,
    "unitCost" DECIMAL(10,2),
    "unitPrice" DECIMAL(10,2),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairPartUsage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitCost" DECIMAL(10,2),
    "unitPrice" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairPartUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairQuote" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "status" "RepairQuoteStatus" NOT NULL DEFAULT 'Draft',
    "laborAmount" DECIMAL(10,2),
    "partsAmount" DECIMAL(10,2),
    "taxAmount" DECIMAL(10,2),
    "totalAmount" DECIMAL(10,2),
    "notes" TEXT,
    "sentAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairInvoice" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "ticketId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'Draft',
    "paymentMethod" "RepairPaymentMethod",
    "subtotal" DECIMAL(10,2),
    "taxAmount" DECIMAL(10,2),
    "totalAmount" DECIMAL(10,2),
    "amountPaid" DECIMAL(10,2),
    "issuedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairDocument" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "customerId" TEXT,
    "ticketId" TEXT,
    "name" TEXT NOT NULL,
    "originalFileName" TEXT,
    "mimeType" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'Other',
    "summary" TEXT,
    "storageKey" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairPhoto" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "deviceId" TEXT,
    "uploadedByUserId" TEXT,
    "category" "RepairPhotoCategory" NOT NULL DEFAULT 'Intake',
    "caption" TEXT,
    "originalFileName" TEXT,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "fileSizeBytes" INTEGER,
    "takenAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairAuditLog" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "ticketId" TEXT,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkbenchGoal_ownerId_idx" ON "WorkbenchGoal"("ownerId");

-- CreateIndex
CREATE INDEX "WorkbenchGoal_ownerId_status_idx" ON "WorkbenchGoal"("ownerId", "status");

-- CreateIndex
CREATE INDEX "WorkbenchGoal_ownerId_updatedAt_idx" ON "WorkbenchGoal"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "WorkbenchGoalTask_ownerId_idx" ON "WorkbenchGoalTask"("ownerId");

-- CreateIndex
CREATE INDEX "WorkbenchGoalTask_goalId_idx" ON "WorkbenchGoalTask"("goalId");

-- CreateIndex
CREATE INDEX "WorkbenchGoalTask_taskId_idx" ON "WorkbenchGoalTask"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkbenchGoalTask_ownerId_goalId_taskId_key" ON "WorkbenchGoalTask"("ownerId", "goalId", "taskId");

-- CreateIndex
CREATE INDEX "RepairCustomer_ownerId_idx" ON "RepairCustomer"("ownerId");

-- CreateIndex
CREATE INDEX "RepairCustomer_ownerId_displayName_idx" ON "RepairCustomer"("ownerId", "displayName");

-- CreateIndex
CREATE INDEX "RepairCustomer_phone_idx" ON "RepairCustomer"("phone");

-- CreateIndex
CREATE INDEX "RepairCustomer_email_idx" ON "RepairCustomer"("email");

-- CreateIndex
CREATE INDEX "RepairDevice_ownerId_idx" ON "RepairDevice"("ownerId");

-- CreateIndex
CREATE INDEX "RepairDevice_customerId_idx" ON "RepairDevice"("customerId");

-- CreateIndex
CREATE INDEX "RepairDevice_deviceType_idx" ON "RepairDevice"("deviceType");

-- CreateIndex
CREATE INDEX "RepairDevice_serialNumber_idx" ON "RepairDevice"("serialNumber");

-- CreateIndex
CREATE INDEX "RepairDevice_imei_idx" ON "RepairDevice"("imei");

-- CreateIndex
CREATE UNIQUE INDEX "RepairTicket_ticketNumber_key" ON "RepairTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "RepairTicket_ownerId_idx" ON "RepairTicket"("ownerId");

-- CreateIndex
CREATE INDEX "RepairTicket_customerId_receivedAt_idx" ON "RepairTicket"("customerId", "receivedAt");

-- CreateIndex
CREATE INDEX "RepairTicket_deviceId_receivedAt_idx" ON "RepairTicket"("deviceId", "receivedAt");

-- CreateIndex
CREATE INDEX "RepairTicket_status_updatedAt_idx" ON "RepairTicket"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "RepairTicket_priority_updatedAt_idx" ON "RepairTicket"("priority", "updatedAt");

-- CreateIndex
CREATE INDEX "RepairNote_ticketId_createdAt_idx" ON "RepairNote"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "RepairNote_authorUserId_createdAt_idx" ON "RepairNote"("authorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "InventoryPart_ownerId_idx" ON "InventoryPart"("ownerId");

-- CreateIndex
CREATE INDEX "InventoryPart_ownerId_name_idx" ON "InventoryPart"("ownerId", "name");

-- CreateIndex
CREATE INDEX "InventoryPart_sku_idx" ON "InventoryPart"("sku");

-- CreateIndex
CREATE INDEX "InventoryPart_quantityOnHand_idx" ON "InventoryPart"("quantityOnHand");

-- CreateIndex
CREATE INDEX "RepairPartUsage_ticketId_idx" ON "RepairPartUsage"("ticketId");

-- CreateIndex
CREATE INDEX "RepairPartUsage_partId_idx" ON "RepairPartUsage"("partId");

-- CreateIndex
CREATE INDEX "RepairQuote_ticketId_createdAt_idx" ON "RepairQuote"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "RepairQuote_status_idx" ON "RepairQuote"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RepairInvoice_invoiceNumber_key" ON "RepairInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "RepairInvoice_ownerId_idx" ON "RepairInvoice"("ownerId");

-- CreateIndex
CREATE INDEX "RepairInvoice_customerId_createdAt_idx" ON "RepairInvoice"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "RepairInvoice_ticketId_idx" ON "RepairInvoice"("ticketId");

-- CreateIndex
CREATE INDEX "RepairInvoice_status_idx" ON "RepairInvoice"("status");

-- CreateIndex
CREATE INDEX "RepairDocument_ownerId_category_idx" ON "RepairDocument"("ownerId", "category");

-- CreateIndex
CREATE INDEX "RepairDocument_customerId_uploadedAt_idx" ON "RepairDocument"("customerId", "uploadedAt");

-- CreateIndex
CREATE INDEX "RepairDocument_ticketId_uploadedAt_idx" ON "RepairDocument"("ticketId", "uploadedAt");

-- CreateIndex
CREATE INDEX "RepairPhoto_ticketId_uploadedAt_idx" ON "RepairPhoto"("ticketId", "uploadedAt");

-- CreateIndex
CREATE INDEX "RepairPhoto_deviceId_uploadedAt_idx" ON "RepairPhoto"("deviceId", "uploadedAt");

-- CreateIndex
CREATE INDEX "RepairPhoto_uploadedByUserId_uploadedAt_idx" ON "RepairPhoto"("uploadedByUserId", "uploadedAt");

-- CreateIndex
CREATE INDEX "RepairAuditLog_customerId_createdAt_idx" ON "RepairAuditLog"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "RepairAuditLog_ticketId_createdAt_idx" ON "RepairAuditLog"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "RepairAuditLog_actorUserId_createdAt_idx" ON "RepairAuditLog"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "WorkbenchGoal" ADD CONSTRAINT "WorkbenchGoal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchGoalTask" ADD CONSTRAINT "WorkbenchGoalTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchGoalTask" ADD CONSTRAINT "WorkbenchGoalTask_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "WorkbenchGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchGoalTask" ADD CONSTRAINT "WorkbenchGoalTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "WorkbenchTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairCustomer" ADD CONSTRAINT "RepairCustomer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairDevice" ADD CONSTRAINT "RepairDevice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairDevice" ADD CONSTRAINT "RepairDevice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "RepairCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairTicket" ADD CONSTRAINT "RepairTicket_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairTicket" ADD CONSTRAINT "RepairTicket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "RepairCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairTicket" ADD CONSTRAINT "RepairTicket_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "RepairDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairNote" ADD CONSTRAINT "RepairNote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "RepairTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairNote" ADD CONSTRAINT "RepairNote_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryPart" ADD CONSTRAINT "InventoryPart_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairPartUsage" ADD CONSTRAINT "RepairPartUsage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "RepairTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairPartUsage" ADD CONSTRAINT "RepairPartUsage_partId_fkey" FOREIGN KEY ("partId") REFERENCES "InventoryPart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairQuote" ADD CONSTRAINT "RepairQuote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "RepairTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairInvoice" ADD CONSTRAINT "RepairInvoice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairInvoice" ADD CONSTRAINT "RepairInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "RepairCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairInvoice" ADD CONSTRAINT "RepairInvoice_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "RepairTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairDocument" ADD CONSTRAINT "RepairDocument_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairDocument" ADD CONSTRAINT "RepairDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "RepairCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairDocument" ADD CONSTRAINT "RepairDocument_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "RepairTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairPhoto" ADD CONSTRAINT "RepairPhoto_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "RepairTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairPhoto" ADD CONSTRAINT "RepairPhoto_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "RepairDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairPhoto" ADD CONSTRAINT "RepairPhoto_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairAuditLog" ADD CONSTRAINT "RepairAuditLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "RepairCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairAuditLog" ADD CONSTRAINT "RepairAuditLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "RepairTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairAuditLog" ADD CONSTRAINT "RepairAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
