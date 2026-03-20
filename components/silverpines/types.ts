export type GarageIndicator = "Y" | "N";
export type UnitKind = "APARTMENT" | "GARAGE";
export type ManagedUnitStatus = "Occupied" | "Vacant" | "Notice" | "Turn" | "Down" | "Model";

export type RepairStatus =
  | "Reported"
  | "Approved"
  | "Scheduled"
  | "InProgress"
  | "WaitingOnParts"
  | "Completed"
  | "Closed"
  | "Cancelled";

export type MaintenanceStatus =
  | "Upcoming"
  | "DueSoon"
  | "Overdue"
  | "Completed"
  | "Skipped"
  | "Cancelled";

export type AccessType =
  | "ApartmentDoor"
  | "GarageDoor"
  | "Mailbox"
  | "Gate"
  | "Storage"
  | "Utility"
  | "Other";

export type ManagedPhotoCategory =
  | "General"
  | "Inspection"
  | "Before"
  | "After"
  | "Damage"
  | "Turnover"
  | "Appliance"
  | "Exterior"
  | "Safety"
  | "Receipt"
  | "Other";

export type ManagedPhotoRoomTag =
  | "Unknown"
  | "Exterior"
  | "Entry"
  | "LivingRoom"
  | "Kitchen"
  | "DiningRoom"
  | "Hallway"
  | "Bathroom"
  | "Bedroom"
  | "Laundry"
  | "Utility"
  | "Garage"
  | "Balcony"
  | "Patio"
  | "Closet"
  | "Mechanical"
  | "Other";

export interface UnitRepairEvent {
  id: string;
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: RepairStatus;
  description?: string;
  vendorName?: string;
  openedAt: string;
  scheduledFor?: string;
  completedAt?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface MaintenanceEvent {
  id: string;
  title: string;
  category: string;
  status: MaintenanceStatus;
  dueAt?: string;
  completedAt?: string;
  vendorName?: string;
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface AccessCodeRecord {
  id: string;
  label: string;
  accessType: AccessType;
  codeLast4?: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  notes?: string;
}

export interface UnitKeyRecord {
  id: string;
  keyLabel: string;
  keyType: string;
  serialNumber?: string;
  assignedTo?: string;
  issuedAt?: string;
  returnedAt?: string;
  isActive: boolean;
  notes?: string;
}

export interface ManagedDocumentRecord {
  id: string;
  name: string;
  category: string;
  mimeType: string;
  uploadedAt: string;
  sizeLabel: string;
  summary?: string;
}

export interface ManagedPhotoRecord {
  id: string;
  category: ManagedPhotoCategory;
  roomTag: ManagedPhotoRoomTag;
  caption?: string;
  originalFileName?: string;
  mimeType: string;
  storageKey: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  takenAt?: string;
  uploadedAt: string;
  uploadedByName?: string;
  inspectionSetCode?: string;
}

export interface InspectionSetRecord {
  id: string;
  code: string;
  title: string;
  description?: string;
  status: "Open" | "InReview" | "Closed";
  startedAt: string;
  completedAt?: string;
  photoCount: number;
}

export interface ManagedUnitRecord {
  unitCode: string;
  propertyCode: string;
  propertyName: string;
  buildingLabel: string;
  floorLabel?: string;
  unitNumber: string;
  unitKind: UnitKind;
  status: ManagedUnitStatus;
  hasGarage: boolean;
  garageIndicator: GarageIndicator;
  linkedGarageCode?: string;
  openIssuesCount: number;
  nextScheduledMaintenance?: string;
  lastRepairAt?: string;
  lastMaintenanceAt?: string;
  ytdRepairCost: number;
  notesSummary?: string;
  repairs: UnitRepairEvent[];
  maintenance: MaintenanceEvent[];
  accessCodes: AccessCodeRecord[];
  keys: UnitKeyRecord[];
  documents: ManagedDocumentRecord[];
  photos: ManagedPhotoRecord[];
  inspectionSets: InspectionSetRecord[];
  notes: string[];
}

export interface SilverPinesFilters {
  query: string;
  status: "ALL" | ManagedUnitStatus;
  garageIndicator: "ALL" | GarageIndicator;
  unitKind: "ALL" | UnitKind;
}