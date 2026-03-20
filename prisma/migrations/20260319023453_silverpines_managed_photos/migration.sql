-- CreateEnum
CREATE TYPE "ManagedPhotoCategory" AS ENUM ('General', 'Inspection', 'Before', 'After', 'Damage', 'Turnover', 'Appliance', 'Exterior', 'Safety', 'Receipt', 'Other');

-- CreateEnum
CREATE TYPE "ManagedPhotoSubjectType" AS ENUM ('Property', 'Unit', 'Garage', 'Repair', 'Maintenance');

-- CreateEnum
CREATE TYPE "ManagedPhotoRoomTag" AS ENUM ('Unknown', 'Exterior', 'Entry', 'LivingRoom', 'Kitchen', 'DiningRoom', 'Hallway', 'Bathroom', 'Bedroom', 'Laundry', 'Utility', 'Garage', 'Balcony', 'Patio', 'Closet', 'Mechanical', 'Other');

-- CreateEnum
CREATE TYPE "InspectionSetStatus" AS ENUM ('Open', 'InReview', 'Closed');

-- CreateTable
CREATE TABLE "InspectionSet" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT,
    "garageId" TEXT,
    "createdByUserId" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "InspectionSetStatus" NOT NULL DEFAULT 'Open',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedPhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT,
    "garageId" TEXT,
    "repairEventId" TEXT,
    "maintenanceRunId" TEXT,
    "inspectionSetId" TEXT,
    "uploadedByUserId" TEXT,
    "category" "ManagedPhotoCategory" NOT NULL DEFAULT 'General',
    "subjectType" "ManagedPhotoSubjectType" NOT NULL DEFAULT 'Unit',
    "roomTag" "ManagedPhotoRoomTag" NOT NULL DEFAULT 'Unknown',
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
    "preventiveMaintenancePlanId" TEXT,

    CONSTRAINT "ManagedPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InspectionSet_code_key" ON "InspectionSet"("code");

-- CreateIndex
CREATE INDEX "InspectionSet_propertyId_startedAt_idx" ON "InspectionSet"("propertyId", "startedAt");

-- CreateIndex
CREATE INDEX "InspectionSet_unitId_startedAt_idx" ON "InspectionSet"("unitId", "startedAt");

-- CreateIndex
CREATE INDEX "InspectionSet_garageId_startedAt_idx" ON "InspectionSet"("garageId", "startedAt");

-- CreateIndex
CREATE INDEX "InspectionSet_createdByUserId_startedAt_idx" ON "InspectionSet"("createdByUserId", "startedAt");

-- CreateIndex
CREATE INDEX "InspectionSet_status_idx" ON "InspectionSet"("status");

-- CreateIndex
CREATE INDEX "ManagedPhoto_propertyId_uploadedAt_idx" ON "ManagedPhoto"("propertyId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ManagedPhoto_unitId_uploadedAt_idx" ON "ManagedPhoto"("unitId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ManagedPhoto_garageId_uploadedAt_idx" ON "ManagedPhoto"("garageId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ManagedPhoto_inspectionSetId_uploadedAt_idx" ON "ManagedPhoto"("inspectionSetId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ManagedPhoto_repairEventId_uploadedAt_idx" ON "ManagedPhoto"("repairEventId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ManagedPhoto_maintenanceRunId_uploadedAt_idx" ON "ManagedPhoto"("maintenanceRunId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ManagedPhoto_uploadedByUserId_uploadedAt_idx" ON "ManagedPhoto"("uploadedByUserId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ManagedPhoto_category_idx" ON "ManagedPhoto"("category");

-- CreateIndex
CREATE INDEX "ManagedPhoto_roomTag_idx" ON "ManagedPhoto"("roomTag");

-- AddForeignKey
ALTER TABLE "InspectionSet" ADD CONSTRAINT "InspectionSet_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionSet" ADD CONSTRAINT "InspectionSet_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "ManagedUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionSet" ADD CONSTRAINT "InspectionSet_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "ManagedGarage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionSet" ADD CONSTRAINT "InspectionSet_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPhoto" ADD CONSTRAINT "ManagedPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "ManagedProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPhoto" ADD CONSTRAINT "ManagedPhoto_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "ManagedUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPhoto" ADD CONSTRAINT "ManagedPhoto_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "ManagedGarage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPhoto" ADD CONSTRAINT "ManagedPhoto_repairEventId_fkey" FOREIGN KEY ("repairEventId") REFERENCES "UnitRepairEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPhoto" ADD CONSTRAINT "ManagedPhoto_maintenanceRunId_fkey" FOREIGN KEY ("maintenanceRunId") REFERENCES "PreventiveMaintenanceRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPhoto" ADD CONSTRAINT "ManagedPhoto_inspectionSetId_fkey" FOREIGN KEY ("inspectionSetId") REFERENCES "InspectionSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPhoto" ADD CONSTRAINT "ManagedPhoto_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedPhoto" ADD CONSTRAINT "ManagedPhoto_preventiveMaintenancePlanId_fkey" FOREIGN KEY ("preventiveMaintenancePlanId") REFERENCES "PreventiveMaintenancePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
