-- AlterTable
ALTER TABLE "ManagedGarage" ADD COLUMN     "lastMaintenanceAt" TIMESTAMP(3),
ADD COLUMN     "lastRepairAt" TIMESTAMP(3),
ADD COLUMN     "notesSummary" TEXT,
ADD COLUMN     "status" "ManagedUnitStatus" NOT NULL DEFAULT 'Vacant';

-- AlterTable
ALTER TABLE "UnitRepairEvent" ADD COLUMN     "garageId" TEXT,
ALTER COLUMN "unitId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ManagedGarage_status_idx" ON "ManagedGarage"("status");

-- CreateIndex
CREATE INDEX "UnitRepairEvent_garageId_openedAt_idx" ON "UnitRepairEvent"("garageId", "openedAt");

-- AddForeignKey
ALTER TABLE "UnitRepairEvent" ADD CONSTRAINT "UnitRepairEvent_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "ManagedGarage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
