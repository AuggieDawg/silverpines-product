"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function getFallback(pathname: string) {
  if (pathname.startsWith("/client/") && pathname !== "/client/overview") {
    return "/client/overview";
  }

  if (pathname.startsWith("/owner/")) {
    return "/owner";
  }

  if (pathname.startsWith("/workbench/")) {
    return "/workbench";
  }

  if (pathname.startsWith("/silverpines/")) {
    return "/silverpines";
  }

  if (
    pathname === "/client" ||
    pathname === "/client/overview" ||
    pathname === "/owner" ||
    pathname === "/workbench" ||
    pathname === "/silverpines"
  ) {
    return "/";
  }

  return "/";
}

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  const fallback = getFallback(pathname);

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }

        router.push(fallback);
      }}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10 hover:text-white"
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}