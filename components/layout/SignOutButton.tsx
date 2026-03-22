"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20 hover:text-white"
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}