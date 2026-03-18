import { prisma } from "@/lib/db/prisma";

type ListFilters = {
  propertyCode?: string;
  query?: string;
  status?: string;
  garageIndicator?: string;
  unitKind?: string;
};

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : undefined;
}

function toNumber(value: unknown) {
  if (value == null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sizeLabel(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isOpenRepairStatus(status: string) {
  return !["Completed", "Closed", "Cancelled"].includes(status);
}

function isActiveMaintenanceStatus(status: string) {
  return ["Upcoming", "DueSoon", "Overdue"].includes(status);
}

function earliestDueDate(
  items: Array<{ dueAt: Date | null; status: string }>
): string | undefined {
  const candidate = items
    .filter((item) => item.dueAt && isActiveMaintenanceStatus(item.status))
    .sort((a, b) => (a.dueAt!.getTime() - b.dueAt!.getTime()))[0];

  return candidate?.dueAt ? candidate.dueAt.toISOString() : undefined;
}

function latestDate(
  items: Array<Date | null | undefined>
): string | undefined {
  const filtered = items.filter(Boolean) as Date[];
  if (filtered.length === 0) return undefined;
  return filtered.sort((a, b) => b.getTime() - a.getTime())[0].toISOString();
}

function currentYearRepairCost(
  repairs: Array<{ actualCost: unknown; completedAt: Date | null; openedAt: Date }>
) {
  const year = new Date().getFullYear();

  return repairs.reduce((sum, repair) => {
    const effectiveDate = repair.completedAt ?? repair.openedAt;
    if (effectiveDate.getFullYear() !== year) return sum;
    return sum + (toNumber(repair.actualCost) ?? 0);
  }, 0);
}

function matchesQuery(value: string | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query);
}

export async function listManagedAssets(filters: ListFilters = {}) {
  const propertyCode = filters.propertyCode?.trim() || undefined;
  const includeUnits = filters.unitKind !== "GARAGE";
  const includeGarages = filters.unitKind !== "APARTMENT";

  const [units, garages] = await Promise.all([
    includeUnits
      ? prisma.managedUnit.findMany({
          where: {
            ...(propertyCode ? { property: { code: propertyCode } } : {}),
          },
          include: {
            property: true,
            linkedGarage: true,
            repairs: {
              select: {
                status: true,
                openedAt: true,
                completedAt: true,
                actualCost: true,
              },
            },
            maintenanceRuns: {
              select: {
                status: true,
                dueAt: true,
                completedAt: true,
              },
            },
          },
          orderBy: [{ buildingLabel: "asc" }, { unitNumber: "asc" }],
        })
      : Promise.resolve([]),
    includeGarages
      ? prisma.managedGarage.findMany({
          where: {
            ...(propertyCode ? { property: { code: propertyCode } } : {}),
          },
          include: {
            property: true,
            linkedUnits: {
              select: {
                unitCode: true,
              },
            },
            repairs: {
              select: {
                status: true,
                openedAt: true,
                completedAt: true,
                actualCost: true,
              },
            },
            maintenanceRuns: {
              select: {
                status: true,
                dueAt: true,
                completedAt: true,
              },
            },
          },
          orderBy: [{ garageCode: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  let items = [
    ...units.map((unit) => ({
      unitCode: unit.unitCode,
      propertyCode: unit.property.code,
      propertyName: unit.property.name,
      buildingLabel: unit.buildingLabel ?? "—",
      floorLabel: unit.floorLabel ?? undefined,
      unitNumber: unit.unitNumber,
      unitKind: "APARTMENT" as const,
      status: unit.status,
      hasGarage: unit.hasGarage,
      garageIndicator: unit.garageIndicator,
      linkedGarageCode: unit.linkedGarage?.garageCode ?? undefined,
      openIssuesCount: unit.repairs.filter((repair) => isOpenRepairStatus(repair.status)).length,
      nextScheduledMaintenance: earliestDueDate(unit.maintenanceRuns),
      lastRepairAt: latestDate(
        unit.repairs.map((repair) => repair.completedAt ?? repair.openedAt)
      ),
      lastMaintenanceAt: latestDate(
        unit.maintenanceRuns.map((run) => run.completedAt ?? run.dueAt)
      ),
      ytdRepairCost: currentYearRepairCost(unit.repairs),
      notesSummary: unit.notesSummary ?? undefined,
    })),
    ...garages.map((garage) => ({
      unitCode: garage.garageCode,
      propertyCode: garage.property.code,
      propertyName: garage.property.name,
      buildingLabel: "GAR",
      floorLabel: undefined,
      unitNumber: garage.label ?? garage.garageCode,
      unitKind: "GARAGE" as const,
      status: garage.status,
      hasGarage: false,
      garageIndicator: "N" as const,
      linkedGarageCode: undefined,
      openIssuesCount: garage.repairs.filter((repair) => isOpenRepairStatus(repair.status)).length,
      nextScheduledMaintenance: earliestDueDate(garage.maintenanceRuns),
      lastRepairAt: latestDate(
        garage.repairs.map((repair) => repair.completedAt ?? repair.openedAt)
      ),
      lastMaintenanceAt: latestDate(
        garage.maintenanceRuns.map((run) => run.completedAt ?? run.dueAt)
      ),
      ytdRepairCost: currentYearRepairCost(garage.repairs),
      notesSummary:
        garage.notesSummary ??
        (garage.linkedUnits[0] ? `Linked to ${garage.linkedUnits[0].unitCode}.` : undefined),
    })),
  ];

  if (filters.status && filters.status !== "ALL") {
    items = items.filter((item) => item.status === filters.status);
  }

  if (filters.garageIndicator && filters.garageIndicator !== "ALL") {
    items = items.filter((item) => {
      if (item.unitKind === "GARAGE") return true;
      return item.garageIndicator === filters.garageIndicator;
    });
  }

  const query = filters.query?.trim().toLowerCase();
  if (query) {
    items = items.filter((item) => {
      return (
        matchesQuery(item.unitCode, query) ||
        matchesQuery(item.propertyCode, query) ||
        matchesQuery(item.propertyName, query) ||
        matchesQuery(item.buildingLabel, query) ||
        matchesQuery(item.unitNumber, query) ||
        matchesQuery(item.status, query) ||
        matchesQuery(item.linkedGarageCode, query) ||
        matchesQuery(item.notesSummary, query)
      );
    });
  }

  items.sort((a, b) => a.unitCode.localeCompare(b.unitCode));

  return items;
}

export async function getManagedAssetByCode(assetCode: string) {
  const unit = await prisma.managedUnit.findUnique({
    where: { unitCode: assetCode },
    include: {
      property: true,
      linkedGarage: true,
      repairs: {
        include: {
          vendor: true,
        },
        orderBy: { openedAt: "desc" },
      },
      maintenanceRuns: {
        include: {
          vendor: true,
        },
        orderBy: [{ dueAt: "desc" }, { createdAt: "desc" }],
      },
      accessCodes: {
        orderBy: { createdAt: "desc" },
      },
      keys: {
        orderBy: { createdAt: "desc" },
      },
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
      notes: {
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (unit) {
    return {
      unitCode: unit.unitCode,
      propertyCode: unit.property.code,
      propertyName: unit.property.name,
      buildingLabel: unit.buildingLabel ?? "—",
      floorLabel: unit.floorLabel ?? undefined,
      unitNumber: unit.unitNumber,
      unitKind: "APARTMENT" as const,
      status: unit.status,
      hasGarage: unit.hasGarage,
      garageIndicator: unit.garageIndicator,
      linkedGarageCode: unit.linkedGarage?.garageCode ?? undefined,
      openIssuesCount: unit.repairs.filter((repair) => isOpenRepairStatus(repair.status)).length,
      nextScheduledMaintenance: earliestDueDate(unit.maintenanceRuns),
      lastRepairAt: latestDate(unit.repairs.map((repair) => repair.completedAt ?? repair.openedAt)),
      lastMaintenanceAt: latestDate(
        unit.maintenanceRuns.map((run) => run.completedAt ?? run.dueAt)
      ),
      ytdRepairCost: currentYearRepairCost(unit.repairs),
      notesSummary: unit.notesSummary ?? undefined,
      repairs: unit.repairs.map((repair) => ({
        id: repair.id,
        title: repair.title,
        category: repair.category,
        priority: repair.priority,
        status: repair.status,
        description: repair.description ?? undefined,
        vendorName: repair.vendor?.name ?? undefined,
        openedAt: repair.openedAt.toISOString(),
        scheduledFor: toIso(repair.scheduledFor),
        completedAt: toIso(repair.completedAt),
        estimatedCost: toNumber(repair.estimatedCost),
        actualCost: toNumber(repair.actualCost),
      })),
      maintenance: unit.maintenanceRuns.map((run) => ({
        id: run.id,
        title: run.title,
        category: run.category,
        status: run.status,
        dueAt: toIso(run.dueAt),
        completedAt: toIso(run.completedAt),
        vendorName: run.vendor?.name ?? undefined,
        notes: run.notes ?? undefined,
        estimatedCost: toNumber(run.estimatedCost),
        actualCost: toNumber(run.actualCost),
      })),
      accessCodes: unit.accessCodes.map((code) => ({
        id: code.id,
        label: code.label,
        accessType: code.accessType,
        codeLast4: code.codeLast4 ?? undefined,
        isActive: code.isActive,
        effectiveFrom: code.effectiveFrom.toISOString(),
        effectiveTo: toIso(code.effectiveTo),
        notes: code.notes ?? undefined,
      })),
      keys: unit.keys.map((key) => ({
        id: key.id,
        keyLabel: key.keyLabel,
        keyType: key.keyType,
        serialNumber: key.serialNumber ?? undefined,
        assignedTo: key.assignedTo ?? undefined,
        issuedAt: toIso(key.issuedAt),
        returnedAt: toIso(key.returnedAt),
        isActive: key.isActive,
        notes: key.notes ?? undefined,
      })),
      documents: unit.documents.map((document) => ({
        id: document.id,
        name: document.name,
        category: document.category,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt.toISOString(),
        sizeLabel: sizeLabel(document.fileSizeBytes),
        summary: document.summary ?? undefined,
      })),
      notes: unit.notes.map((note) => note.body),
    };
  }

  const garage = await prisma.managedGarage.findUnique({
    where: { garageCode: assetCode },
    include: {
      property: true,
      linkedUnits: {
        select: {
          unitCode: true,
        },
      },
      repairs: {
        include: {
          vendor: true,
        },
        orderBy: { openedAt: "desc" },
      },
      maintenanceRuns: {
        include: {
          vendor: true,
        },
        orderBy: [{ dueAt: "desc" }, { createdAt: "desc" }],
      },
      accessCodes: {
        orderBy: { createdAt: "desc" },
      },
      keys: {
        orderBy: { createdAt: "desc" },
      },
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
    },
  });

  if (!garage) {
    return null;
  }

  const linkedUnitCode = garage.linkedUnits[0]?.unitCode;

  return {
    unitCode: garage.garageCode,
    propertyCode: garage.property.code,
    propertyName: garage.property.name,
    buildingLabel: "GAR",
    floorLabel: undefined,
    unitNumber: garage.label ?? garage.garageCode,
    unitKind: "GARAGE" as const,
    status: garage.status,
    hasGarage: false,
    garageIndicator: "N" as const,
    linkedGarageCode: undefined,
    openIssuesCount: garage.repairs.filter((repair) => isOpenRepairStatus(repair.status)).length,
    nextScheduledMaintenance: earliestDueDate(garage.maintenanceRuns),
    lastRepairAt: latestDate(garage.repairs.map((repair) => repair.completedAt ?? repair.openedAt)),
    lastMaintenanceAt: latestDate(
      garage.maintenanceRuns.map((run) => run.completedAt ?? run.dueAt)
    ),
    ytdRepairCost: currentYearRepairCost(garage.repairs),
    notesSummary:
      garage.notesSummary ?? (linkedUnitCode ? `Linked to ${linkedUnitCode}.` : undefined),
    repairs: garage.repairs.map((repair) => ({
      id: repair.id,
      title: repair.title,
      category: repair.category,
      priority: repair.priority,
      status: repair.status,
      description: repair.description ?? undefined,
      vendorName: repair.vendor?.name ?? undefined,
      openedAt: repair.openedAt.toISOString(),
      scheduledFor: toIso(repair.scheduledFor),
      completedAt: toIso(repair.completedAt),
      estimatedCost: toNumber(repair.estimatedCost),
      actualCost: toNumber(repair.actualCost),
    })),
    maintenance: garage.maintenanceRuns.map((run) => ({
      id: run.id,
      title: run.title,
      category: run.category,
      status: run.status,
      dueAt: toIso(run.dueAt),
      completedAt: toIso(run.completedAt),
      vendorName: run.vendor?.name ?? undefined,
      notes: run.notes ?? undefined,
      estimatedCost: toNumber(run.estimatedCost),
      actualCost: toNumber(run.actualCost),
    })),
    accessCodes: garage.accessCodes.map((code) => ({
      id: code.id,
      label: code.label,
      accessType: code.accessType,
      codeLast4: code.codeLast4 ?? undefined,
      isActive: code.isActive,
      effectiveFrom: code.effectiveFrom.toISOString(),
      effectiveTo: toIso(code.effectiveTo),
      notes: code.notes ?? undefined,
    })),
    keys: garage.keys.map((key) => ({
      id: key.id,
      keyLabel: key.keyLabel,
      keyType: key.keyType,
      serialNumber: key.serialNumber ?? undefined,
      assignedTo: key.assignedTo ?? undefined,
      issuedAt: toIso(key.issuedAt),
      returnedAt: toIso(key.returnedAt),
      isActive: key.isActive,
      notes: key.notes ?? undefined,
    })),
    documents: garage.documents.map((document) => ({
      id: document.id,
      name: document.name,
      category: document.category,
      mimeType: document.mimeType,
      uploadedAt: document.uploadedAt.toISOString(),
      sizeLabel: sizeLabel(document.fileSizeBytes),
      summary: document.summary ?? undefined,
    })),
    notes: [garage.notes, linkedUnitCode ? `Linked to ${linkedUnitCode}.` : undefined].filter(
      Boolean
    ) as string[],
  };
}

export async function getManagedAssetHistoryByCode(assetCode: string) {
  const asset = await getManagedAssetByCode(assetCode);
  if (!asset) return null;

  return {
    unitCode: asset.unitCode,
    unitKind: asset.unitKind,
    repairs: asset.repairs,
    maintenance: asset.maintenance,
    accessCodes: asset.accessCodes,
    keys: asset.keys,
    documents: asset.documents,
    notes: asset.notes,
  };
}