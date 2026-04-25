import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function requireStoneOwnerId() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  return session.user.id;
}

export async function getStoneWorkspaceForCurrentUser() {
  const ownerId = await requireStoneOwnerId();

  const [rigs, wells, jobs, dailyReports, inventoryItems] =
    await prisma.$transaction([
      prisma.fieldRig.findMany({
        where: { ownerId },
        orderBy: [{ status: "asc" }, { name: "asc" }],
        include: {
          currentWell: true,
          _count: {
            select: {
              jobs: true,
              dailyReports: true,
              inventoryItems: true,
            },
          },
        },
      }),

      prisma.fieldWell.findMany({
        where: { ownerId },
        orderBy: [{ operatorName: "asc" }, { wellName: "asc" }],
        take: 80,
        include: {
          _count: {
            select: {
              jobs: true,
              dailyReports: true,
              assignedRigs: true,
            },
          },
        },
      }),

      prisma.fieldJob.findMany({
        where: { ownerId },
        orderBy: [{ updatedAt: "desc" }],
        take: 80,
        include: {
          rig: true,
          well: true,
          _count: {
            select: {
              dailyReports: true,
            },
          },
        },
      }),

      prisma.fieldDailyReport.findMany({
        where: { ownerId },
        orderBy: [{ reportDate: "desc" }, { updatedAt: "desc" }],
        take: 30,
        include: {
          rig: true,
          well: true,
          job: true,
        },
      }),

      prisma.fieldInventoryItem.findMany({
        where: { ownerId },
        orderBy: [{ quantityOnHand: "asc" }, { name: "asc" }],
        take: 80,
        include: {
          rig: true,
        },
      }),
    ]);

  const activeJobs = jobs.filter(
    (job) => !["Completed", "Cancelled"].includes(job.status),
  ).length;

  const rigDownCount = rigs.filter((rig) => rig.status === "DownForRepair").length;

  const inventoryAtRisk = inventoryItems.filter((item) => {
    const reorderPoint = item.reorderPoint ?? 0;
    return reorderPoint > 0 && item.quantityOnHand <= reorderPoint;
  }).length;

  const reportsToday = dailyReports.filter((report) =>
    isSameDay(report.reportDate, new Date()),
  ).length;

  return {
    metrics: {
      rigCount: rigs.length,
      activeJobs,
      rigDownCount,
      wellCount: wells.length,
      inventoryAtRisk,
      reportsToday,
    },
    rigs,
    wells,
    jobs,
    dailyReports,
    inventoryItems,
  };
}

export function formatDate(date: Date | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function statusLabel(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
