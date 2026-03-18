-- CreateEnum
CREATE TYPE "ManagedUnitStatus" AS ENUM ('Occupied', 'Vacant', 'Notice', 'Turn', 'Down', 'Model');

-- CreateEnum
CREATE TYPE "GarageIndicator" AS ENUM ('Y', 'N');

-- CreateEnum
CREATE TYPE "UnitAccessType" AS ENUM ('ApartmentDoor', 'GarageDoor', 'Mailbox', 'Gate', 'Storage', 'Utility', 'Other');

-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('Reported', 'Approved', 'Scheduled', 'InProgress', 'WaitingOnParts', 'Completed', 'Closed', 'Cancelled');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('Upcoming', 'DueSoon', 'Overdue', 'Completed', 'Skipped', 'Cancelled');

-- CreateEnum
CREATE TYPE "MaintenanceFrequency" AS ENUM ('Weekly', 'Monthly', 'Quarterly', 'SemiAnnual', 'Annual', 'Custom');

-- CreateEnum
CREATE TYPE "ManagedDocumentCategory" AS ENUM ('Lease', 'Inspection', 'Invoice', 'Receipt', 'Warranty', 'Photo', 'Spreadsheet', 'Maintenance', 'Repair', 'Access', 'Floorplan', 'Other');

-- CreateTable
CREATE TABLE "ManagedProperty" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "description" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'US',
    "timezone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedPropertyMember" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessRole" TEXT NOT NULL DEFAULT 'Viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedPropertyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedGarage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "garageCode" TEXT NOT NULL,
    "label" TEXT,
    "locationLabel" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedGarage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedUnit" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitCode" TEXT NOT NULL,
    "buildingLabel" TEXT,
    "floorLabel" TEXT,
    "unitNumber" TEXT NOT NULL,
    "bedroomCount" INTEGER,
    "bathroomCount" DECIMAL(3,1),
    "squareFeet" INTEGER,
    "status" "ManagedUnitStatus" NOT NULL DEFAULT 'Vacant',
    "hasGarage" BOOLEAN NOT NULL DEFAULT false,
    "garageIndicator" "GarageIndicator" NOT NULL DEFAULT 'N',
    "linkedGarageId" TEXT,
    "notesSummary" TEXT,
    "lastRepairAt" TIMESTAMP(3),
    "lastMaintenanceAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedVendor" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeCategory" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "contactName" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitRepairEvent" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "vendorId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" "RepairStatus" NOT NULL DEFAULT 'Reported',
    "description" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedCost" DECIMAL(10,2),
    "actualCost" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitRepairEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveMaintenancePlan" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "MaintenanceFrequency" NOT NULL,
    "intervalDays" INTEGER,
    "targetScope" TEXT NOT NULL DEFAULT 'UNIT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nextDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveMaintenancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveMaintenanceRun" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT,
    "garageId" TEXT,
    "planId" TEXT,
    "vendorId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'Upcoming',
    "dueAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "estimatedCost" DECIMAL(10,2),
    "actualCost" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveMaintenanceRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitAccessCode" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT,
    "garageId" TEXT,
    "accessType" "UnitAccessType" NOT NULL DEFAULT 'ApartmentDoor',
    "label" TEXT NOT NULL,
    "codeCiphertext" TEXT NOT NULL,
    "codeLast4" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitAccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitKey" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT,
    "garageId" TEXT,
    "keyLabel" TEXT NOT NULL,
    "keyType" TEXT NOT NULL,
    "serialNumber" TEXT,
    "assignedTo" TEXT,
    "issuedAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedDocument" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT,
    "garageId" TEXT,
    "repairEventId" TEXT,
    "maintenanceRunId" TEXT,
    "name" TEXT NOT NULL,
    "originalFileName" TEXT,
    "mimeType" TEXT NOT NULL,
    "category" "ManagedDocumentCategory" NOT NULL DEFAULT 'Other',
    "summary" TEXT,
    "storageKey" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitNote" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedAuditLog" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagedAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ManagedProperty_code_key" ON "ManagedProperty"("code");

-- CreateIndex
CREATE INDEX "ManagedProperty_ownerId_idx" ON "ManagedProperty"("ownerId");

-- CreateIndex
CREATE INDEX "ManagedProperty_ownerId_updatedAt_idx" ON "ManagedProperty"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "ManagedPropertyMember_userId_idx" ON "ManagedPropertyMember"("userId");

-- CreateIndex
CREATE INDEX "ManagedPropertyMember_propertyId_idx" ON "ManagedPropertyMember"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagedPropertyMember_propertyId_userId_key" ON "ManagedPropertyMember"("propertyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagedGarage_garageCode_key" ON "ManagedGarage"("garageCode");

-- CreateIndex
CREATE INDEX "ManagedGarage_propertyId_idx" ON "ManagedGarage"("propertyId");

-- CreateIndex
CREATE INDEX "ManagedGarage_propertyId_garageCode_idx" ON "ManagedGarage"("propertyId", "garageCode");

-- CreateIndex
CREATE UNIQUE INDEX "ManagedUnit_unitCode_key" ON "ManagedUnit"("unitCode");

-- CreateIndex
CREATE INDEX "ManagedUnit_propertyId_idx" ON "ManagedUnit"("propertyId");

-- CreateIndex
CREATE INDEX "ManagedUnit_propertyId_unitCode_idx" ON "ManagedUnit"("propertyId", "unitCode");

-- CreateIndex
CREATE INDEX "ManagedUnit_propertyId_buildingLabel_unitNumber_idx" ON "ManagedUnit"("propertyId", "buildingLabel", "unitNumber");

-- CreateIndex
CREATE INDEX "ManagedUnit_linkedGarageId_idx" ON "ManagedUnit"("linkedGarageId");

-- CreateIndex
CREATE INDEX "ManagedUnit_status_idx" ON "ManagedUnit"("status");

-- CreateIndex
CREATE INDEX "ManagedVendor_propertyId_idx" ON "ManagedVendor"("propertyId");

-- CreateIndex
CREATE INDEX "ManagedVendor_propertyId_name_idx" ON "ManagedVendor"("propertyId", "name");

-- CreateIndex
CREATE INDEX "UnitRepairEvent_propertyId_idx" ON "UnitRepairEvent"("propertyId");

-- CreateIndex
CREATE INDEX "UnitRepairEvent_unitId_openedAt_idx" ON "UnitRepairEvent"("unitId", "openedAt");

-- CreateIndex
CREATE INDEX "UnitRepairEvent_status_idx" ON "UnitRepairEvent"("status");

-- CreateIndex
CREATE INDEX "UnitRepairEvent_vendorId_idx" ON "UnitRepairEvent"("vendorId");

-- CreateIndex
CREATE INDEX "PreventiveMaintenancePlan_propertyId_idx" ON "PreventiveMaintenancePlan"("propertyId");

-- CreateIndex
CREATE INDEX "PreventiveMaintenancePlan_propertyId_isActive_idx" ON "PreventiveMaintenancePlan"("propertyId", "isActive");

-- CreateIndex
CREATE INDEX "PreventiveMaintenancePlan_nextDueAt_idx" ON "PreventiveMaintenancePlan"("nextDueAt");

-- CreateIndex
CREATE INDEX "PreventiveMaintenanceRun_propertyId_idx" ON "PreventiveMaintenanceRun"("propertyId");

-- CreateIndex
CREATE INDEX "PreventiveMaintenanceRun_unitId_dueAt_idx" ON "PreventiveMaintenanceRun"("unitId", "dueAt");

-- CreateIndex
CREATE INDEX "PreventiveMaintenanceRun_garageId_dueAt_idx" ON "PreventiveMaintenanceRun"("garageId", "dueAt");

-- CreateIndex
CREATE INDEX "PreventiveMaintenanceRun_planId_idx" ON "PreventiveMaintenanceRun"("planId");

-- CreateIndex
CREATE INDEX "PreventiveMaintenanceRun_status_idx" ON "PreventiveMaintenanceRun"("status");

-- CreateIndex
CREATE INDEX "PreventiveMaintenanceRun_vendorId_idx" ON "PreventiveMaintenanceRun"("vendorId");

-- CreateIndex
CREATE INDEX "UnitAccessCode_propertyId_idx" ON "UnitAccessCode"("propertyId");

-- CreateIndex
CREATE INDEX "UnitAccessCode_unitId_isActive_idx" ON "UnitAccessCode"("unitId", "isActive");

-- CreateIndex
CREATE INDEX "UnitAccessCode_garageId_isActive_idx" ON "UnitAccessCode"("garageId", "isActive");

-- CreateIndex
CREATE INDEX "UnitKey_propertyId_idx" ON "UnitKey"("propertyId");

-- CreateIndex
CREATE INDEX "UnitKey_unitId_isActive_idx" ON "UnitKey"("unitId", "isActive");

-- CreateIndex
CREATE INDEX "UnitKey_garageId_isActive_idx" ON "UnitKey"("garageId", "isActive");

-- CreateIndex
CREATE INDEX "ManagedDocument_propertyId_category_idx" ON "ManagedDocument"("propertyId", "category");

-- CreateIndex
CREATE INDEX "ManagedDocument_unitId_uploadedAt_idx" ON "ManagedDocument"("unitId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ManagedDocument_garageId_uploadedAt_idx" ON "ManagedDocument"("garageId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ManagedDocument_repairEventId_idx" ON "ManagedDocument"("repairEventId");

-- CreateIndex
CREATE INDEX "ManagedDocument_maintenanceRunId_idx" ON "ManagedDocument"("maintenanceRunId");

-- CreateIndex
CREATE INDEX "UnitNote_propertyId_idx" ON "UnitNote"("propertyId");

-- CreateIndex
CREATE INDEX "UnitNote_unitId_createdAt_idx" ON "UnitNote"("unitId", "createdAt");

-- CreateIndex
CREATE INDEX "UnitNote_unitId_pinned_idx" ON "UnitNote"("unitId", "pinned");

-- CreateIndex
CREATE INDEX "ManagedAuditLog_propertyId_createdAt_idx" ON "ManagedAuditLog"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "ManagedAuditLog_actorUserId_createdAt_idx" ON "ManagedAuditLog"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "ManagedProperty" ADD CONSTRAINT "ManagedProperty_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPropertyMember" ADD CONSTRAINT "ManagedPropertyMember_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPropertyMember" ADD CONSTRAINT "ManagedPropertyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedGarage" ADD CONSTRAINT "ManagedGarage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedUnit" ADD CONSTRAINT "ManagedUnit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedUnit" ADD CONSTRAINT "ManagedUnit_linkedGarageId_fkey" FOREIGN KEY ("linkedGarageId") REFERENCES "ManagedGarage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedVendor" ADD CONSTRAINT "ManagedVendor_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitRepairEvent" ADD CONSTRAINT "UnitRepairEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitRepairEvent" ADD CONSTRAINT "UnitRepairEvent_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "ManagedUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitRepairEvent" ADD CONSTRAINT "UnitRepairEvent_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "ManagedVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenancePlan" ADD CONSTRAINT "PreventiveMaintenancePlan_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenanceRun" ADD CONSTRAINT "PreventiveMaintenanceRun_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenanceRun" ADD CONSTRAINT "PreventiveMaintenanceRun_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "ManagedUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenanceRun" ADD CONSTRAINT "PreventiveMaintenanceRun_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "ManagedGarage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenanceRun" ADD CONSTRAINT "PreventiveMaintenanceRun_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PreventiveMaintenancePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenanceRun" ADD CONSTRAINT "PreventiveMaintenanceRun_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "ManagedVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitAccessCode" ADD CONSTRAINT "UnitAccessCode_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitAccessCode" ADD CONSTRAINT "UnitAccessCode_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "ManagedUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitAccessCode" ADD CONSTRAINT "UnitAccessCode_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "ManagedGarage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitKey" ADD CONSTRAINT "UnitKey_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitKey" ADD CONSTRAINT "UnitKey_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "ManagedUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitKey" ADD CONSTRAINT "UnitKey_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "ManagedGarage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedDocument" ADD CONSTRAINT "ManagedDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedDocument" ADD CONSTRAINT "ManagedDocument_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "ManagedUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedDocument" ADD CONSTRAINT "ManagedDocument_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "ManagedGarage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedDocument" ADD CONSTRAINT "ManagedDocument_repairEventId_fkey" FOREIGN KEY ("repairEventId") REFERENCES "UnitRepairEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedDocument" ADD CONSTRAINT "ManagedDocument_maintenanceRunId_fkey" FOREIGN KEY ("maintenanceRunId") REFERENCES "PreventiveMaintenanceRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitNote" ADD CONSTRAINT "UnitNote_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitNote" ADD CONSTRAINT "UnitNote_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "ManagedUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedAuditLog" ADD CONSTRAINT "ManagedAuditLog_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedAuditLog" ADD CONSTRAINT "ManagedAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
