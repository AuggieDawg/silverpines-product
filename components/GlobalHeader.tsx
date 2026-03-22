import Link from "next/link";
import { auth } from "@/auth";
import { BackButton } from "@/components/layout/BackButton";
import { SignOutButton } from "@/components/layout/SignOutButton";

export async function GlobalHeader() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <BackButton />

          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold tracking-wide text-white transition hover:bg-white/10"
          >
            Home
          </Link>

          {isSignedIn ? (
            <Link
              href={isAdmin ? "/owner" : "/client/overview"}
              className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white md:inline-flex"
            >
              {isAdmin ? "Admin" : "Client"}
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <SignOutButton />
          ) : (
            <Link
              href="/api/auth/signin"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}