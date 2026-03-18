import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import "@/app/globals.css";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/rbac";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function SilverPinesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  if (!isAdmin(session.user.role)) {
    redirect("/client");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}