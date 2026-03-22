import ParticlesBackground from "@/components/background/ParticlesBackground";
import { HomePlaceholderSections } from "@/components/HomePlaceholderSections";
import LandingHero from "@/components/home/LandingHero";

export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen overflow-x-clip text-white">
      <ParticlesBackground />

      <div className="relative z-10">
        <LandingHero />
        <HomePlaceholderSections />
      </div>
    </main>
  );
}



<footer className="text-xs opacity-70">
  {process.env.VERCEL_TARGET_ENV} · {process.env.VERCEL_GIT_COMMIT_REF} ·{" "}
  {process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)}
</footer>