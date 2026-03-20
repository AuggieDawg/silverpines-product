import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  GarageIndicator,
  InspectionSetStatus,
  MaintenanceFrequency,
  MaintenanceStatus,
  ManagedPhotoCategory,
  ManagedPhotoRoomTag,
  ManagedPhotoSubjectType,
  PrismaClient,
  RepairStatus,
  UnitAccessType,
} from "@prisma/client";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || DATABASE_URL.trim().length === 0) {
  throw new Error(
    "DATABASE_URL is missing. Ensure it exists in .env before running the SilverPines seed."
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

const DEV_ONLY_CIPHER_PREFIX = "DEV_ONLY_NOT_ENCRYPTED__";

function fakeCipher(plain: string) {
  return `${DEV_ONLY_CIPHER_PREFIX}${plain}`;
}

async function main() {
  const emailArg = process.argv[2]?.trim();

  if (!emailArg) {
    throw new Error('Usage: npm run seed:silverpines -- "you@example.com"');
  }

  const user = await prisma.user.findUnique({
    where: { email: emailArg },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    throw new Error(`No user found for ${emailArg}. Create or sign in with that user first.`);
  }

  const property = await prisma.managedProperty.upsert({
    where: { code: "SILVER" },
    update: {
      ownerId: user.id,
      name: "SilverPines",
      nickname: "Silver Pines",
      description: "Apartment and garage operations for SilverPines.",
      city: "Vernal",
      state: "UT",
      timezone: "America/Denver",
      isActive: true,
      notes: "Seeded property for SilverPines product validation.",
    },
    create: {
      ownerId: user.id,
      code: "SILVER",
      name: "SilverPines",
      nickname: "Silver Pines",
      description: "Apartment and garage operations for SilverPines.",
      city: "Vernal",
      state: "UT",
      timezone: "America/Denver",
      isActive: true,
      notes: "Seeded property for SilverPines product validation.",
    },
  });

  await prisma.managedPropertyMember.upsert({
    where: {
      propertyId_userId: {
        propertyId: property.id,
        userId: user.id,
      },
    },
    update: {
      accessRole: "Admin",
    },
    create: {
      propertyId: property.id,
      userId: user.id,
      accessRole: "Admin",
    },
  });

  await prisma.$transaction([
    prisma.managedPhoto.deleteMany({ where: { propertyId: property.id } }),
    prisma.inspectionSet.deleteMany({ where: { propertyId: property.id } }),
    prisma.managedDocument.deleteMany({ where: { propertyId: property.id } }),
    prisma.unitNote.deleteMany({ where: { propertyId: property.id } }),
    prisma.unitAccessCode.deleteMany({ where: { propertyId: property.id } }),
    prisma.unitKey.deleteMany({ where: { propertyId: property.id } }),
    prisma.preventiveMaintenanceRun.deleteMany({ where: { propertyId: property.id } }),
    prisma.unitRepairEvent.deleteMany({ where: { propertyId: property.id } }),
    prisma.preventiveMaintenancePlan.deleteMany({ where: { propertyId: property.id } }),
    prisma.managedVendor.deleteMany({ where: { propertyId: property.id } }),
    prisma.managedUnit.deleteMany({ where: { propertyId: property.id } }),
    prisma.managedGarage.deleteMany({ where: { propertyId: property.id } }),
  ]);

  const plumbingVendor = await prisma.managedVendor.create({
    data: {
      propertyId: property.id,
      name: "Uintah Plumbing",
      tradeCategory: "Plumbing",
      phone: "435-000-1001",
      contactName: "Lead Plumber",
      isActive: true,
    },
  });

  const electricalVendor = await prisma.managedVendor.create({
    data: {
      propertyId: property.id,
      name: "Basin Electrical",
      tradeCategory: "Electrical",
      phone: "435-000-1002",
      contactName: "Service Electrician",
      isActive: true,
    },
  });

  const mechanicalVendor = await prisma.managedVendor.create({
    data: {
      propertyId: property.id,
      name: "Basin Mechanical",
      tradeCategory: "HVAC",
      phone: "435-000-1003",
      contactName: "Service Tech",
      isActive: true,
    },
  });

  const garage01 = await prisma.managedGarage.create({
    data: {
      propertyId: property.id,
      garageCode: "SILVER-G-01",
      label: "Garage 01",
      locationLabel: "North row",
      status: "Occupied",
      notesSummary: "Assigned to SILVER-A-101.",
      notes: "Linked to apartment SILVER-A-101.",
      isActive: true,
    },
  });

  const garage02 = await prisma.managedGarage.create({
    data: {
      propertyId: property.id,
      garageCode: "SILVER-G-02",
      label: "Garage 02",
      locationLabel: "North row",
      status: "Occupied",
      notesSummary: "Assigned to SILVER-B-201.",
      notes: "Linked to apartment SILVER-B-201.",
      isActive: true,
    },
  });

  const garage03 = await prisma.managedGarage.create({
    data: {
      propertyId: property.id,
      garageCode: "SILVER-G-03",
      label: "Garage 03",
      locationLabel: "South row",
      status: "Occupied",
      notesSummary: "Assigned to SILVER-C-301.",
      notes: "Door spring inspection required.",
      isActive: true,
    },
  });

  const garage04 = await prisma.managedGarage.create({
    data: {
      propertyId: property.id,
      garageCode: "SILVER-G-04",
      label: "Garage 04",
      locationLabel: "South row",
      status: "Vacant",
      notesSummary: "Available for assignment.",
      isActive: true,
    },
  });

  const unitA101 = await prisma.managedUnit.create({
    data: {
      propertyId: property.id,
      unitCode: "SILVER-A-101",
      buildingLabel: "A",
      floorLabel: "1",
      unitNumber: "101",
      bedroomCount: 2,
      bathroomCount: "1.0",
      squareFeet: 900,
      status: "Occupied",
      hasGarage: true,
      garageIndicator: GarageIndicator.Y,
      linkedGarageId: garage01.id,
      notesSummary: "Kitchen sink repair completed; follow-up valve inspection pending.",
      lastRepairAt: new Date("2026-03-10T10:00:00.000Z"),
      lastMaintenanceAt: new Date("2026-02-20T10:00:00.000Z"),
    },
  });

  const unitA102 = await prisma.managedUnit.create({
    data: {
      propertyId: property.id,
      unitCode: "SILVER-A-102",
      buildingLabel: "A",
      floorLabel: "1",
      unitNumber: "102",
      bedroomCount: 2,
      bathroomCount: "1.0",
      squareFeet: 880,
      status: "Vacant",
      hasGarage: false,
      garageIndicator: GarageIndicator.N,
      notesSummary: "Vacant turn unit. Paint and deep clean already completed.",
      lastRepairAt: new Date("2026-02-14T10:00:00.000Z"),
      lastMaintenanceAt: new Date("2026-02-28T10:00:00.000Z"),
    },
  });

  const unitB201 = await prisma.managedUnit.create({
    data: {
      propertyId: property.id,
      unitCode: "SILVER-B-201",
      buildingLabel: "B",
      floorLabel: "2",
      unitNumber: "201",
      bedroomCount: 3,
      bathroomCount: "2.0",
      squareFeet: 1180,
      status: "Occupied",
      hasGarage: true,
      garageIndicator: GarageIndicator.Y,
      linkedGarageId: garage02.id,
      notesSummary: "Bathroom fan and balcony light both still open.",
      lastRepairAt: new Date("2026-03-14T10:00:00.000Z"),
      lastMaintenanceAt: new Date("2026-01-12T10:00:00.000Z"),
    },
  });

  const unitB202 = await prisma.managedUnit.create({
    data: {
      propertyId: property.id,
      unitCode: "SILVER-B-202",
      buildingLabel: "B",
      floorLabel: "2",
      unitNumber: "202",
      bedroomCount: 2,
      bathroomCount: "1.0",
      squareFeet: 910,
      status: "Occupied",
      hasGarage: false,
      garageIndicator: GarageIndicator.N,
      notesSummary: "No active issues.",
      lastRepairAt: new Date("2026-01-05T10:00:00.000Z"),
      lastMaintenanceAt: new Date("2026-02-01T10:00:00.000Z"),
    },
  });

  const unitC301 = await prisma.managedUnit.create({
    data: {
      propertyId: property.id,
      unitCode: "SILVER-C-301",
      buildingLabel: "C",
      floorLabel: "3",
      unitNumber: "301",
      bedroomCount: 3,
      bathroomCount: "2.0",
      squareFeet: 1210,
      status: "Turn",
      hasGarage: true,
      garageIndicator: GarageIndicator.Y,
      linkedGarageId: garage03.id,
      notesSummary: "Turn unit. Flooring patch and appliance test in progress.",
      lastRepairAt: new Date("2026-03-16T10:00:00.000Z"),
      lastMaintenanceAt: new Date("2026-03-01T10:00:00.000Z"),
    },
  });

  const unitC302 = await prisma.managedUnit.create({
    data: {
      propertyId: property.id,
      unitCode: "SILVER-C-302",
      buildingLabel: "C",
      floorLabel: "3",
      unitNumber: "302",
      bedroomCount: 2,
      bathroomCount: "1.0",
      squareFeet: 905,
      status: "Occupied",
      hasGarage: false,
      garageIndicator: GarageIndicator.N,
      notesSummary: "Window latch replacement overdue for closeout documentation.",
      lastRepairAt: new Date("2026-03-11T10:00:00.000Z"),
      lastMaintenanceAt: new Date("2026-01-10T10:00:00.000Z"),
    },
  });

  const hvacPlan = await prisma.preventiveMaintenancePlan.create({
    data: {
      propertyId: property.id,
      title: "Quarterly HVAC filter change",
      category: "HVAC",
      description: "Standard recurring HVAC air filter replacement.",
      frequency: MaintenanceFrequency.Quarterly,
      targetScope: "UNIT",
      isActive: true,
      nextDueAt: new Date("2026-04-03T10:00:00.000Z"),
    },
  });

  const safetyPlan = await prisma.preventiveMaintenancePlan.create({
    data: {
      propertyId: property.id,
      title: "Smoke detector test",
      category: "Safety",
      description: "Routine smoke detector inspection and test.",
      frequency: MaintenanceFrequency.Quarterly,
      targetScope: "UNIT",
      isActive: true,
      nextDueAt: new Date("2026-03-25T10:00:00.000Z"),
    },
  });

  await prisma.unitRepairEvent.createMany({
    data: [
      {
        propertyId: property.id,
        unitId: unitA101.id,
        vendorId: plumbingVendor.id,
        title: "Kitchen sink leak",
        category: "Plumbing",
        priority: "High",
        status: RepairStatus.Completed,
        description: "Replaced worn shutoff valve and resealed under-sink fittings.",
        openedAt: new Date("2026-03-08T10:00:00.000Z"),
        scheduledFor: new Date("2026-03-09T10:00:00.000Z"),
        completedAt: new Date("2026-03-10T10:00:00.000Z"),
        estimatedCost: "250.00",
        actualCost: "285.00",
      },
      {
        propertyId: property.id,
        unitId: unitA102.id,
        title: "Bedroom blind replacement",
        category: "Cosmetic",
        priority: "Low",
        status: RepairStatus.Completed,
        openedAt: new Date("2026-02-13T10:00:00.000Z"),
        completedAt: new Date("2026-02-14T10:00:00.000Z"),
        actualCost: "110.00",
      },
      {
        propertyId: property.id,
        unitId: unitB201.id,
        vendorId: electricalVendor.id,
        title: "Bathroom exhaust fan replacement",
        category: "Electrical",
        priority: "Medium",
        status: RepairStatus.Scheduled,
        openedAt: new Date("2026-03-14T10:00:00.000Z"),
        scheduledFor: new Date("2026-03-21T10:00:00.000Z"),
        estimatedCost: "300.00",
      },
      {
        propertyId: property.id,
        unitId: unitB201.id,
        vendorId: electricalVendor.id,
        title: "Balcony light intermittent fault",
        category: "Electrical",
        priority: "Low",
        status: RepairStatus.Reported,
        openedAt: new Date("2026-03-15T10:00:00.000Z"),
        estimatedCost: "120.00",
      },
      {
        propertyId: property.id,
        unitId: unitB202.id,
        title: "Cabinet hinge adjustment",
        category: "Finish",
        priority: "Low",
        status: RepairStatus.Closed,
        openedAt: new Date("2026-01-04T10:00:00.000Z"),
        completedAt: new Date("2026-01-05T10:00:00.000Z"),
        actualCost: "95.00",
      },
      {
        propertyId: property.id,
        unitId: unitC301.id,
        title: "Dishwasher drainage failure",
        category: "Appliances",
        priority: "High",
        status: RepairStatus.InProgress,
        openedAt: new Date("2026-03-16T10:00:00.000Z"),
        estimatedCost: "420.00",
      },
      {
        propertyId: property.id,
        unitId: unitC302.id,
        title: "Window latch replacement",
        category: "Hardware",
        priority: "Medium",
        status: RepairStatus.Completed,
        openedAt: new Date("2026-03-09T10:00:00.000Z"),
        completedAt: new Date("2026-03-11T10:00:00.000Z"),
        actualCost: "340.00",
      },
      {
        propertyId: property.id,
        garageId: garage03.id,
        title: "Garage door spring noise",
        category: "Mechanical",
        priority: "Medium",
        status: RepairStatus.Scheduled,
        openedAt: new Date("2026-03-16T10:00:00.000Z"),
        scheduledFor: new Date("2026-03-27T10:00:00.000Z"),
        estimatedCost: "180.00",
      },
      {
        propertyId: property.id,
        garageId: garage01.id,
        title: "Garage remote battery swap",
        category: "Access",
        priority: "Low",
        status: RepairStatus.Closed,
        openedAt: new Date("2026-01-18T10:00:00.000Z"),
        completedAt: new Date("2026-01-18T10:00:00.000Z"),
        actualCost: "65.00",
      },
    ],
  });

  await prisma.preventiveMaintenanceRun.createMany({
    data: [
      {
        propertyId: property.id,
        unitId: unitA101.id,
        planId: hvacPlan.id,
        vendorId: mechanicalVendor.id,
        title: "Quarterly HVAC filter change",
        category: "HVAC",
        status: MaintenanceStatus.Upcoming,
        dueAt: new Date("2026-04-03T10:00:00.000Z"),
        estimatedCost: "45.00",
      },
      {
        propertyId: property.id,
        unitId: unitA102.id,
        title: "Move-in readiness inspection",
        category: "Inspection",
        status: MaintenanceStatus.DueSoon,
        dueAt: new Date("2026-03-29T10:00:00.000Z"),
      },
      {
        propertyId: property.id,
        unitId: unitB201.id,
        planId: safetyPlan.id,
        title: "Smoke detector test",
        category: "Safety",
        status: MaintenanceStatus.DueSoon,
        dueAt: new Date("2026-03-25T10:00:00.000Z"),
      },
      {
        propertyId: property.id,
        unitId: unitB202.id,
        title: "Air return cleaning",
        category: "HVAC",
        status: MaintenanceStatus.Upcoming,
        dueAt: new Date("2026-05-01T10:00:00.000Z"),
      },
      {
        propertyId: property.id,
        unitId: unitC301.id,
        title: "Turn checklist closeout",
        category: "Turnover",
        status: MaintenanceStatus.DueSoon,
        dueAt: new Date("2026-03-24T10:00:00.000Z"),
      },
      {
        propertyId: property.id,
        unitId: unitC302.id,
        title: "GFCI test",
        category: "Safety",
        status: MaintenanceStatus.Overdue,
        dueAt: new Date("2026-03-22T10:00:00.000Z"),
      },
    ],
  });

  await prisma.unitAccessCode.createMany({
    data: [
      {
        propertyId: property.id,
        unitId: unitA101.id,
        accessType: UnitAccessType.ApartmentDoor,
        label: "Apartment keypad",
        codeCiphertext: fakeCipher("9142"),
        codeLast4: "9142",
        isActive: true,
        effectiveFrom: new Date("2026-01-01T10:00:00.000Z"),
      },
      {
        propertyId: property.id,
        garageId: garage01.id,
        accessType: UnitAccessType.GarageDoor,
        label: "Garage keypad",
        codeCiphertext: fakeCipher("4408"),
        codeLast4: "4408",
        isActive: true,
        effectiveFrom: new Date("2026-01-01T10:00:00.000Z"),
      },
      {
        propertyId: property.id,
        unitId: unitA102.id,
        accessType: UnitAccessType.ApartmentDoor,
        label: "Apartment keypad",
        codeCiphertext: fakeCipher("1187"),
        codeLast4: "1187",
        isActive: true,
        effectiveFrom: new Date("2026-02-01T10:00:00.000Z"),
      },
      {
        propertyId: property.id,
        unitId: unitB201.id,
        accessType: UnitAccessType.ApartmentDoor,
        label: "Apartment keypad",
        codeCiphertext: fakeCipher("5520"),
        codeLast4: "5520",
        isActive: true,
        effectiveFrom: new Date("2026-01-01T10:00:00.000Z"),
      },
      {
        propertyId: property.id,
        unitId: unitC301.id,
        accessType: UnitAccessType.ApartmentDoor,
        label: "Apartment keypad",
        codeCiphertext: fakeCipher("1048"),
        codeLast4: "1048",
        isActive: false,
        effectiveFrom: new Date("2025-08-01T10:00:00.000Z"),
        effectiveTo: new Date("2026-03-12T10:00:00.000Z"),
        notes: "Prior tenant code deactivated.",
      },
    ],
  });

  await prisma.unitKey.createMany({
    data: [
      {
        propertyId: property.id,
        unitId: unitA101.id,
        keyLabel: "Unit entry key",
        keyType: "Physical",
        serialNumber: "SP-A101-01",
        assignedTo: "Tenant set",
        issuedAt: new Date("2026-01-01T10:00:00.000Z"),
        isActive: true,
      },
      {
        propertyId: property.id,
        unitId: unitA102.id,
        keyLabel: "Leasing key set",
        keyType: "Physical",
        serialNumber: "SP-A102-01",
        assignedTo: "Office",
        issuedAt: new Date("2026-02-01T10:00:00.000Z"),
        isActive: true,
      },
      {
        propertyId: property.id,
        unitId: unitB201.id,
        keyLabel: "Emergency master duplicate",
        keyType: "Physical",
        serialNumber: "SP-B201-EM",
        assignedTo: "Maintenance office",
        issuedAt: new Date("2026-01-01T10:00:00.000Z"),
        isActive: true,
      },
      {
        propertyId: property.id,
        unitId: unitC301.id,
        keyLabel: "Turn crew key set",
        keyType: "Physical",
        assignedTo: "Maintenance team",
        issuedAt: new Date("2026-03-13T10:00:00.000Z"),
        isActive: true,
      },
    ],
  });

  await prisma.unitNote.createMany({
    data: [
      {
        propertyId: property.id,
        unitId: unitA101.id,
        body: "Tenant reported a brief pressure fluctuation two days before the leak became visible.",
        pinned: false,
      },
      {
        propertyId: property.id,
        unitId: unitA101.id,
        body: "Garage assignment confirmed for this apartment.",
        pinned: true,
      },
      {
        propertyId: property.id,
        unitId: unitA102.id,
        body: "Ready for showing after inspection clears.",
        pinned: false,
      },
      {
        propertyId: property.id,
        unitId: unitB201.id,
        body: "Resident prefers weekday access after 3 PM.",
        pinned: false,
      },
      {
        propertyId: property.id,
        unitId: unitC301.id,
        body: "Do not issue new resident credentials until dishwasher closes.",
        pinned: true,
      },
      {
        propertyId: property.id,
        unitId: unitC302.id,
        body: "Upload completion photo set.",
        pinned: false,
      },
    ],
  });

  await prisma.managedDocument.createMany({
    data: [
      {
        propertyId: property.id,
        unitId: unitA101.id,
        name: "sink-repair-invoice-mar-2026.pdf",
        originalFileName: "sink-repair-invoice-mar-2026.pdf",
        mimeType: "application/pdf",
        category: "Invoice",
        summary: "Final plumbing invoice.",
        storageKey: "seed/silver/a101/sink-repair-invoice-mar-2026.pdf",
        fileSizeBytes: 245760,
      },
      {
        propertyId: property.id,
        unitId: unitA101.id,
        name: "unit-a101-maintenance-log.xlsx",
        originalFileName: "unit-a101-maintenance-log.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        category: "Spreadsheet",
        summary: "Running maintenance ledger.",
        storageKey: "seed/silver/a101/unit-a101-maintenance-log.xlsx",
        fileSizeBytes: 90112,
      },
      {
        propertyId: property.id,
        unitId: unitB201.id,
        name: "b201-electrical-notes.pdf",
        originalFileName: "b201-electrical-notes.pdf",
        mimeType: "application/pdf",
        category: "Repair",
        storageKey: "seed/silver/b201/b201-electrical-notes.pdf",
        fileSizeBytes: 126976,
      },
      {
        propertyId: property.id,
        unitId: unitC301.id,
        name: "turn-punchlist-c301.xlsx",
        originalFileName: "turn-punchlist-c301.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        category: "Spreadsheet",
        summary: "Turn punch list with appliance checks.",
        storageKey: "seed/silver/c301/turn-punchlist-c301.xlsx",
        fileSizeBytes: 98304,
      },
    ],
  });

  const inspectionA101 = await prisma.inspectionSet.create({
    data: {
      propertyId: property.id,
      unitId: unitA101.id,
      createdByUserId: user.id,
      code: "SP-INSP-A101-20260318",
      title: "A101 move-through inspection",
      description: "Kitchen, bathroom, and entry condition check.",
      status: InspectionSetStatus.Open,
      startedAt: new Date("2026-03-18T15:00:00.000Z"),
    },
  });

  const inspectionG03 = await prisma.inspectionSet.create({
    data: {
      propertyId: property.id,
      garageId: garage03.id,
      createdByUserId: user.id,
      code: "SP-INSP-G03-20260318",
      title: "Garage 03 mechanical follow-up",
      description: "Spring and track condition review.",
      status: InspectionSetStatus.Open,
      startedAt: new Date("2026-03-18T16:00:00.000Z"),
    },
  });

  await prisma.managedPhoto.createMany({
    data: [
      {
        propertyId: property.id,
        unitId: unitA101.id,
        inspectionSetId: inspectionA101.id,
        uploadedByUserId: user.id,
        category: ManagedPhotoCategory.Inspection,
        subjectType: ManagedPhotoSubjectType.Unit,
        roomTag: ManagedPhotoRoomTag.Kitchen,
        caption: "Under-sink plumbing area before follow-up inspection.",
        originalFileName: "a101-kitchen-under-sink-01.jpg",
        mimeType: "image/jpeg",
        storageKey: "seed/silver/a101/photos/a101-kitchen-under-sink-01.jpg",
        width: 1600,
        height: 1200,
        fileSizeBytes: 248500,
        takenAt: new Date("2026-03-18T15:02:00.000Z"),
      },
      {
        propertyId: property.id,
        unitId: unitA101.id,
        inspectionSetId: inspectionA101.id,
        uploadedByUserId: user.id,
        category: ManagedPhotoCategory.Inspection,
        subjectType: ManagedPhotoSubjectType.Unit,
        roomTag: ManagedPhotoRoomTag.Bathroom,
        caption: "Bathroom vanity and plumbing face-on view.",
        originalFileName: "a101-bathroom-01.jpg",
        mimeType: "image/jpeg",
        storageKey: "seed/silver/a101/photos/a101-bathroom-01.jpg",
        width: 1600,
        height: 1200,
        fileSizeBytes: 221300,
        takenAt: new Date("2026-03-18T15:06:00.000Z"),
      },
      {
        propertyId: property.id,
        garageId: garage03.id,
        inspectionSetId: inspectionG03.id,
        uploadedByUserId: user.id,
        category: ManagedPhotoCategory.Damage,
        subjectType: ManagedPhotoSubjectType.Garage,
        roomTag: ManagedPhotoRoomTag.Garage,
        caption: "Garage spring noise follow-up reference shot.",
        originalFileName: "g03-spring-01.jpg",
        mimeType: "image/jpeg",
        storageKey: "seed/silver/g03/photos/g03-spring-01.jpg",
        width: 1600,
        height: 1200,
        fileSizeBytes: 208900,
        takenAt: new Date("2026-03-18T16:10:00.000Z"),
      },
    ],
  });

  console.log("SilverPines seed complete.");
  console.log(`Owner: ${user.email}`);
  console.log(`Property: ${property.code} / ${property.name}`);
  console.log("Created:");
  console.log("- 6 apartments");
  console.log("- 4 garages");
  console.log("- 3 vendors");
  console.log("- repairs, maintenance runs, access codes, keys, notes, and documents");
  console.log("- 2 inspection sets");
  console.log("- 3 managed photos");
  console.log("");
  console.log(
    "Important: codeCiphertext is DEV_ONLY placeholder data. Replace with real encryption before production."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });