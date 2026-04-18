import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/rbac";
import { RepairShell } from "@/components/repair/RepairShell";

export default async function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Private-launch mode: only your admin account can access the app surfaces.
  if (process.env.PRIVATE_DEMO_MODE === "true" && !isAdmin(session.user.role)) {
    redirect("/not-authorized");
  }

  const displayName = session.user.name ?? session.user.email ?? "Client User";

  return (
    <RepairShell
      userLabel={displayName}
      userInitials={getInitials(displayName)}
    >
      {children}
    </RepairShell>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "CU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}