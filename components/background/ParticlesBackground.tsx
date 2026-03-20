"use client";

import { useMemo, type CSSProperties } from "react";

type ParticleSpec = {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  blur: number;
};

export default function ParticlesBackground() {
  const particles = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: 90 }, (_, index) => ({
        id: index,
        left: (index * 11.73) % 100,
        top: (index * 7.91) % 100,
        size: 2 + ((index * 13) % 5),
        opacity: 0.18 + ((index * 17) % 30) / 100,
        duration: 16 + (index % 9) * 2.4,
        delay: -((index % 11) * 1.35),
        driftX: -50 + ((index * 19) % 101),
        blur: index % 4 === 0 ? 1.5 : 0,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[radial-gradient(circle_at_top,rgba(42,92,190,0.18),transparent_28%),linear-gradient(180deg,#050913_0%,#08101b_45%,#050811_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_60%)]" />

      {particles.map((particle) => {
        const style = {
          left: `${particle.left}%`,
          top: `${particle.top}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          opacity: particle.opacity,
          filter: `blur(${particle.blur}px)`,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`,
          ["--drift-x" as string]: `${particle.driftX}px`,
        } satisfies CSSProperties;

        return (
          <span
            key={particle.id}
            style={style}
            className="absolute rounded-full bg-white/90 shadow-[0_0_12px_rgba(190,220,255,0.55)] animate-[particle-float_linear_infinite]"
          />
        );
      })}

      <style jsx global>{`
        @keyframes particle-float {
          0% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0;
          }
          10% {
            opacity: inherit;
          }
          50% {
            transform: translate3d(var(--drift-x), -90px, 0) scale(1);
          }
          100% {
            transform: translate3d(calc(var(--drift-x) * -0.35), -180px, 0) scale(0.92);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}