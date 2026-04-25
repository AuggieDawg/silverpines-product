export type PageContextKind =
  | "COMPANY"
  | "PERSONAL"
  | "OWNER"
  | "PORTAL"
  | "EXPERIMENTAL";

export type BusinessContext = {
  id: string;
  label: string;
  route: string;
  kind: PageContextKind;
  badgeLabel: string;
  domain: string;
  description: string;
  enabledForAnalysis: boolean;
};

export const businessContexts: BusinessContext[] = [
  {
    id: "repair-operations",
    label: "Repair Operations",
    route: "/client",
    kind: "COMPANY",
    badgeLabel: "Company Page · Repair Operations",
    domain: "computer-cellphone-repair",
    description:
      "Customer intake, device records, repair tickets, quotes, invoices, inventory, and documentation.",
    enabledForAnalysis: true,
  },
  {
    id: "property-operations",
    label: "Property Operations",
    route: "/silverpines",
    kind: "COMPANY",
    badgeLabel: "Company Page · Property Operations",
    domain: "property-management",
    description:
      "Property units, maintenance, inspections, photos, access records, and operational history.",
    enabledForAnalysis: true,
  },
  {
    id: "stone-well-services",
    label: "Stone Well Service",
    route: "/stone",
    kind: "COMPANY",
    badgeLabel: "Company Page · Field Operations",
    domain: "oilfield-well-service",
    description:
      "Rig tracking, well files, job status, daily reports, inventory, safety notes, and field intelligence.",
    enabledForAnalysis: true,
  },
  {
    id: "workbench",
    label: "Personal Workbench",
    route: "/workbench",
    kind: "PERSONAL",
    badgeLabel: "Personal Page · Execution System",
    domain: "personal-execution",
    description:
      "Personal planning, goal mapping, task execution, and owner operating rhythm.",
    enabledForAnalysis: false,
  },
  {
    id: "owner",
    label: "Owner Portal",
    route: "/owner",
    kind: "OWNER",
    badgeLabel: "Owner Page · Product Control",
    domain: "product-operations",
    description:
      "Owner-only controls, product administration, data tools, and internal command surfaces.",
    enabledForAnalysis: false,
  },
];

export function getBusinessContextByRoute(pathname: string) {
  return businessContexts.find((context) => {
    return pathname === context.route || pathname.startsWith(`${context.route}/`);
  });
}

export function getAnalyzableCompanyContexts() {
  return businessContexts.filter(
    (context) => context.kind === "COMPANY" && context.enabledForAnalysis,
  );
}
