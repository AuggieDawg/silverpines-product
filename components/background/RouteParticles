"use client";

import { usePathname } from "next/navigation";

import ParticlesBackground from "@/components/background/ParticlesBackground";

export default function RouteParticles() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return <ParticlesBackground mode="overlay" />;
}