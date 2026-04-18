import Link from "next/link";

export default function NotAuthorizedPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center px-6 py-16">
      <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-red-300/75">
          Access denied
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          You are not authorized to access this app.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
          This deployment is currently locked for a private owner-only launch.
          Only approved accounts can sign in and access protected routes.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/api/auth/signin"
            className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
          >
            Try sign in again
          </Link>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/6 hover:text-white"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}