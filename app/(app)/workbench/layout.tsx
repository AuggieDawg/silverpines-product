import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/rbac";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageContextBadge } from "@/components/navigation/PageContextBadge";

export default async function WorkbenchLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  if (!isAdmin(session.user.role)) {
    redirect("/not-authorized");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.055),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(185,28,28,0.12),_transparent_30%)]" />

        <img
          src="/brand/syndicate-labs-pyramid-logo.png"
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-auto w-[min(760px,70vw)] -translate-x-1/2 -translate-y-1/2 opacity-[0.045] blur-[0.2px] grayscale"
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="sticky top-0 z-20 border-b border-white/10 bg-black/55 px-5 py-3 backdrop-blur-xl">
            <PageContextBadge
              kind="PERSONAL"
              label="Personal Page · Execution System"
            />
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
