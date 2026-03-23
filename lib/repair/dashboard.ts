export type RepairTicketStatus =
  | "NEW"
  | "DIAGNOSING"
  | "WAITING_PARTS"
  | "READY"
  | "COMPLETED";

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE";
export type RepairPhotoKind = "BEFORE" | "DURING" | "AFTER";

export type RepairTicketRecord = {
  id: string;
  title: string;
  customerName: string;
  customerId: string;
  deviceLabel: string;
  brand: string;
  category: "PHONE" | "LAPTOP" | "DESKTOP" | "TABLET";
  status: RepairTicketStatus;
  statusLabel: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  quoteAmount: number | null;
  dueLabel: string;
  symptom: string;
};

export type RepairCustomerRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  activeTickets: number;
  completedRepairs: number;
  lastDevice: string;
};

export type InventoryPartRecord = {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  reorderPoint: number;
  unitCost: number;
  supplier: string;
};

export type RepairInvoiceRecord = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  ticketId: string;
  total: number;
  deposit: number;
  balance: number;
  status: InvoiceStatus;
  issuedLabel: string;
};

export type RepairPhotoRecord = {
  id: string;
  ticketId: string;
  ticketTitle: string;
  kind: RepairPhotoKind;
  caption: string;
};

export const repairCustomers: RepairCustomerRecord[] = [
  {
    id: "cust_001",
    name: "Maria Hernandez",
    phone: "(435) 555-0101",
    email: "maria@example.com",
    city: "Vernal, UT",
    activeTickets: 1,
    completedRepairs: 4,
    lastDevice: "HP Pavilion 15",
  },
  {
    id: "cust_002",
    name: "Tyler Jensen",
    phone: "(435) 555-0102",
    email: "tyler@example.com",
    city: "Naples, UT",
    activeTickets: 2,
    completedRepairs: 1,
    lastDevice: "iPhone 13 Pro",
  },
  {
    id: "cust_003",
    name: "Rosa Alvarez",
    phone: "(435) 555-0103",
    email: "rosa@example.com",
    city: "Vernal, UT",
    activeTickets: 1,
    completedRepairs: 3,
    lastDevice: "Dell Inspiron 15",
  },
  {
    id: "cust_004",
    name: "James Mitchell",
    phone: "(435) 555-0104",
    email: "james@example.com",
    city: "Jensen, UT",
    activeTickets: 0,
    completedRepairs: 6,
    lastDevice: "Samsung Galaxy S22",
  },
];

export const repairTickets: RepairTicketRecord[] = [
  {
    id: "rt_1001",
    title: "Broken laptop frame and hinge",
    customerId: "cust_001",
    customerName: "Maria Hernandez",
    deviceLabel: "HP Pavilion 15",
    brand: "HP",
    category: "LAPTOP",
    status: "DIAGNOSING",
    statusLabel: "Diagnosing",
    priority: "HIGH",
    quoteAmount: 145,
    dueLabel: "Due tomorrow",
    symptom: "Frame separation near hinge, lid misalignment, flex near webcam.",
  },
  {
    id: "rt_1002",
    title: "iPhone screen and housing inspection",
    customerId: "cust_002",
    customerName: "Tyler Jensen",
    deviceLabel: "iPhone 13 Pro",
    brand: "Apple",
    category: "PHONE",
    status: "WAITING_PARTS",
    statusLabel: "Waiting on parts",
    priority: "HIGH",
    quoteAmount: 229,
    dueLabel: "Parts ETA Friday",
    symptom: "Cracked OLED, dented frame edge, face unlock check pending.",
  },
  {
    id: "rt_1003",
    title: "Desktop thermal cleanup and tune-up",
    customerId: "cust_004",
    customerName: "James Mitchell",
    deviceLabel: "Custom gaming PC",
    brand: "Custom",
    category: "DESKTOP",
    status: "READY",
    statusLabel: "Ready for pickup",
    priority: "MEDIUM",
    quoteAmount: 95,
    dueLabel: "Ready now",
    symptom: "High temperatures under load, dust buildup, old thermal paste.",
  },
  {
    id: "rt_1004",
    title: "Charging port diagnosis",
    customerId: "cust_003",
    customerName: "Rosa Alvarez",
    deviceLabel: "Samsung Galaxy S21",
    brand: "Samsung",
    category: "PHONE",
    status: "NEW",
    statusLabel: "New intake",
    priority: "MEDIUM",
    quoteAmount: null,
    dueLabel: "Needs triage",
    symptom: "Intermittent charging, debris suspected, moisture indicator check.",
  },
  {
    id: "rt_1005",
    title: "Battery and keyboard evaluation",
    customerId: "cust_002",
    customerName: "Tyler Jensen",
    deviceLabel: "Dell Inspiron 14",
    brand: "Dell",
    category: "LAPTOP",
    status: "COMPLETED",
    statusLabel: "Completed",
    priority: "LOW",
    quoteAmount: 170,
    dueLabel: "Delivered",
    symptom: "Battery drain and several non-responsive keys.",
  },
];

export const inventoryParts: InventoryPartRecord[] = [
  {
    id: "part_001",
    sku: "SCR-IP13PRO-BLK",
    name: "iPhone 13 Pro OLED assembly",
    category: "Display",
    quantity: 1,
    reorderPoint: 2,
    unitCost: 128,
    supplier: "Mobile Parts Direct",
  },
  {
    id: "part_002",
    sku: "HINGE-HP15-L",
    name: "HP Pavilion left hinge set",
    category: "Laptop frame",
    quantity: 2,
    reorderPoint: 2,
    unitCost: 18,
    supplier: "Laptop Parts Depot",
  },
  {
    id: "part_003",
    sku: "USB-C-S21-PORT",
    name: "Galaxy S21 charging port flex",
    category: "Charging",
    quantity: 5,
    reorderPoint: 2,
    unitCost: 11,
    supplier: "Mobile Parts Direct",
  },
  {
    id: "part_004",
    sku: "THERM-PASTE-4G",
    name: "Thermal paste syringe",
    category: "Consumables",
    quantity: 3,
    reorderPoint: 3,
    unitCost: 9,
    supplier: "Tech Supply West",
  },
  {
    id: "part_005",
    sku: "BAT-DELL-7420",
    name: "Dell Inspiron battery pack",
    category: "Battery",
    quantity: 0,
    reorderPoint: 1,
    unitCost: 56,
    supplier: "Laptop Parts Depot",
  },
];

export const repairInvoices: RepairInvoiceRecord[] = [
  {
    id: "inv_001",
    number: "INV-2026-001",
    customerId: "cust_001",
    customerName: "Maria Hernandez",
    ticketId: "rt_1001",
    total: 145,
    deposit: 50,
    balance: 95,
    status: "SENT",
    issuedLabel: "Today",
  },
  {
    id: "inv_002",
    number: "INV-2026-002",
    customerId: "cust_002",
    customerName: "Tyler Jensen",
    ticketId: "rt_1002",
    total: 229,
    deposit: 0,
    balance: 229,
    status: "DRAFT",
    issuedLabel: "Awaiting approval",
  },
  {
    id: "inv_003",
    number: "INV-2026-003",
    customerId: "cust_004",
    customerName: "James Mitchell",
    ticketId: "rt_1003",
    total: 95,
    deposit: 95,
    balance: 0,
    status: "PAID",
    issuedLabel: "Paid today",
  },
  {
    id: "inv_004",
    number: "INV-2026-004",
    customerId: "cust_003",
    customerName: "Rosa Alvarez",
    ticketId: "rt_1004",
    total: 0,
    deposit: 0,
    balance: 0,
    status: "DRAFT",
    issuedLabel: "Pending diagnosis",
  },
];

export const repairPhotos: RepairPhotoRecord[] = [
  {
    id: "photo_001",
    ticketId: "rt_1001",
    ticketTitle: "Broken laptop frame and hinge",
    kind: "BEFORE",
    caption: "Initial intake shot showing frame split near the left hinge.",
  },
  {
    id: "photo_002",
    ticketId: "rt_1001",
    ticketTitle: "Broken laptop frame and hinge",
    kind: "DURING",
    caption: "Internal hinge mount inspection after bezel removal.",
  },
  {
    id: "photo_003",
    ticketId: "rt_1003",
    ticketTitle: "Desktop thermal cleanup and tune-up",
    kind: "AFTER",
    caption: "Fresh thermal paste applied and fan shroud cleaned.",
  },
  {
    id: "photo_004",
    ticketId: "rt_1002",
    ticketTitle: "iPhone screen and housing inspection",
    kind: "BEFORE",
    caption: "OLED crack pattern and bent frame corner documented.",
  },
  {
    id: "photo_005",
    ticketId: "rt_1005",
    ticketTitle: "Battery and keyboard evaluation",
    kind: "AFTER",
    caption: "Battery replacement complete and keyboard tested.",
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getRepairDashboardMetrics() {
  const openTickets = repairTickets.filter(
    (ticket) => ticket.status !== "COMPLETED",
  ).length;

  const lowStockParts = inventoryParts.filter(
    (part) => part.quantity <= part.reorderPoint,
  ).length;

  const outstandingInvoiceValue = repairInvoices
    .filter((invoice) => invoice.balance > 0)
    .reduce((sum, invoice) => sum + invoice.balance, 0);

  return {
    openTickets,
    customerCount: repairCustomers.length,
    lowStockParts,
    outstandingInvoiceValue,
    photoCount: repairPhotos.length,
  };
}