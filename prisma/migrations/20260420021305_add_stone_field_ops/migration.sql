-- CreateEnum
CREATE TYPE "FieldRigStatus" AS ENUM ('Available', 'Moving', 'RiggingUp', 'Working', 'WaitingOnParts', 'WaitingOnOperator', 'DownForRepair', 'Standby', 'RiggingDown', 'Complete');

-- CreateEnum
CREATE TYPE "FieldJobStatus" AS ENUM ('Planned', 'Active', 'WaitingOnParts', 'WaitingOnOperator', 'DownForRepair', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "FieldJobPriority" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateTable
CREATE TABLE "FieldRig" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rigNumber" TEXT,
    "status" "FieldRigStatus" NOT NULL DEFAULT 'Standby',
    "currentOperator" TEXT,
    "currentWellId" TEXT,
    "locationLabel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldRig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldWell" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "operatorName" TEXT NOT NULL,
    "wellName" TEXT NOT NULL,
    "wellNumber" TEXT,
    "apiNumber" TEXT,
    "leaseName" TEXT,
    "locationLabel" TEXT,
    "county" TEXT,
    "state" TEXT DEFAULT 'UT',
    "directions" TEXT,
    "hazards" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldWell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldJob" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "rigId" TEXT,
    "wellId" TEXT,
    "jobNumber" TEXT NOT NULL,
    "operatorName" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" "FieldJobStatus" NOT NULL DEFAULT 'Planned',
    "priority" "FieldJobPriority" NOT NULL DEFAULT 'Medium',
    "objective" TEXT,
    "currentSummary" TEXT,
    "blocker" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldDailyReport" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "rigId" TEXT,
    "wellId" TEXT,
    "jobId" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workPerformed" TEXT,
    "currentStatus" TEXT,
    "downtime" TEXT,
    "safetyNotes" TEXT,
    "partsUsed" TEXT,
    "partsNeeded" TEXT,
    "tomorrowPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldDailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldInventoryItem" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "rigId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER,
    "unit" TEXT,
    "supplier" TEXT,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldInventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FieldRig_ownerId_idx" ON "FieldRig"("ownerId");

-- CreateIndex
CREATE INDEX "FieldRig_ownerId_status_idx" ON "FieldRig"("ownerId", "status");

-- CreateIndex
CREATE INDEX "FieldRig_currentWellId_idx" ON "FieldRig"("currentWellId");

-- CreateIndex
CREATE INDEX "FieldRig_updatedAt_idx" ON "FieldRig"("updatedAt");

-- CreateIndex
CREATE INDEX "FieldWell_ownerId_idx" ON "FieldWell"("ownerId");

-- CreateIndex
CREATE INDEX "FieldWell_ownerId_operatorName_idx" ON "FieldWell"("ownerId", "operatorName");

-- CreateIndex
CREATE INDEX "FieldWell_ownerId_wellName_idx" ON "FieldWell"("ownerId", "wellName");

-- CreateIndex
CREATE INDEX "FieldWell_apiNumber_idx" ON "FieldWell"("apiNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FieldJob_jobNumber_key" ON "FieldJob"("jobNumber");

-- CreateIndex
CREATE INDEX "FieldJob_ownerId_idx" ON "FieldJob"("ownerId");

-- CreateIndex
CREATE INDEX "FieldJob_rigId_idx" ON "FieldJob"("rigId");

-- CreateIndex
CREATE INDEX "FieldJob_wellId_idx" ON "FieldJob"("wellId");

-- CreateIndex
CREATE INDEX "FieldJob_ownerId_status_idx" ON "FieldJob"("ownerId", "status");

-- CreateIndex
CREATE INDEX "FieldJob_ownerId_updatedAt_idx" ON "FieldJob"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "FieldDailyReport_ownerId_idx" ON "FieldDailyReport"("ownerId");

-- CreateIndex
CREATE INDEX "FieldDailyReport_rigId_reportDate_idx" ON "FieldDailyReport"("rigId", "reportDate");

-- CreateIndex
CREATE INDEX "FieldDailyReport_wellId_reportDate_idx" ON "FieldDailyReport"("wellId", "reportDate");

-- CreateIndex
CREATE INDEX "FieldDailyReport_jobId_reportDate_idx" ON "FieldDailyReport"("jobId", "reportDate");

-- CreateIndex
CREATE INDEX "FieldDailyReport_reportDate_idx" ON "FieldDailyReport"("reportDate");

-- CreateIndex
CREATE INDEX "FieldInventoryItem_ownerId_idx" ON "FieldInventoryItem"("ownerId");

-- CreateIndex
CREATE INDEX "FieldInventoryItem_rigId_idx" ON "FieldInventoryItem"("rigId");

-- CreateIndex
CREATE INDEX "FieldInventoryItem_ownerId_name_idx" ON "FieldInventoryItem"("ownerId", "name");

-- CreateIndex
CREATE INDEX "FieldInventoryItem_quantityOnHand_idx" ON "FieldInventoryItem"("quantityOnHand");

-- AddForeignKey
ALTER TABLE "FieldRig" ADD CONSTRAINT "FieldRig_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldRig" ADD CONSTRAINT "FieldRig_currentWellId_fkey" FOREIGN KEY ("currentWellId") REFERENCES "FieldWell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldWell" ADD CONSTRAINT "FieldWell_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldJob" ADD CONSTRAINT "FieldJob_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldJob" ADD CONSTRAINT "FieldJob_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "FieldRig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldJob" ADD CONSTRAINT "FieldJob_wellId_fkey" FOREIGN KEY ("wellId") REFERENCES "FieldWell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldDailyReport" ADD CONSTRAINT "FieldDailyReport_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldDailyReport" ADD CONSTRAINT "FieldDailyReport_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "FieldRig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldDailyReport" ADD CONSTRAINT "FieldDailyReport_wellId_fkey" FOREIGN KEY ("wellId") REFERENCES "FieldWell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldDailyReport" ADD CONSTRAINT "FieldDailyReport_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "FieldJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldInventoryItem" ADD CONSTRAINT "FieldInventoryItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldInventoryItem" ADD CONSTRAINT "FieldInventoryItem_rigId_fkey" FOREIGN KEY ("rigId") REFERENCES "FieldRig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
