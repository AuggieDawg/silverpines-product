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