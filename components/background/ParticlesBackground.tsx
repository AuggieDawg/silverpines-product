"use client";

import { useMemo, type CSSProperties } from "react";

type ParticlesBackgroundMode = "full" | "overlay";

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

type ParticlesBackgroundProps = {
  mode?: ParticlesBackgroundMode;
};

function buildParticle(index: number, overlay: boolean): ParticleSpec {
  return {
    id: index,
    left: (index * (overlay ? 17.31 : 11.73)) % 100,
    top: (index * (overlay ? 9.67 : 7.91)) % 100,
    size: overlay ? 1 + ((index * 11) % 4) : 2 + ((index * 13) % 5),
    opacity: overlay
      ? 0.08 + ((index * 13) % 16) / 100
      : 0.18 + ((index * 17) % 30) / 100,
    duration: overlay ? 20 + (index % 8) * 2.8 : 16 + (index % 9) * 2.4,
    delay: -((index % 11) * (overlay ? 1.8 : 1.35)),
    driftX: overlay ? -32 + ((index * 15) % 65) : -50 + ((index * 19) % 101),
    blur: overlay ? (index % 6 === 0 ? 1.2 : 0) : index % 4 === 0 ? 1.5 : 0,
  };
}

export default function ParticlesBackground({
  mode = "full",
}: ParticlesBackgroundProps) {
  const overlay = mode === "overlay";

  const particles = useMemo<ParticleSpec[]>(
    () =>
      Array.from(
        { length: overlay ? 44 : 90 },
        (_, index) => buildParticle(index, overlay),
      ),
    [overlay],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {overlay ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_22%),radial-gradient(circle_at_80%_20%,rgba(96,165,250,0.07),transparent_24%),radial-gradient(circle_at_18%_84%,rgba(168,85,247,0.06),transparent_26%)] opacity-55" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,17,0.08),rgba(4,9,17,0.18))]" />

          <div className="absolute -right-24 top-24 h-56 w-56 rounded-full bg-sky-300/[0.07] blur-3xl animate-[particle-glow-drift_24s_ease-in-out_infinite]" />
          <div className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-violet-400/[0.06] blur-3xl animate-[particle-glow-drift_28s_ease-in-out_infinite_reverse]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(42,92,190,0.18),transparent_28%),linear-gradient(180deg,#050913_0%,#08101b_45%,#050811_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_60%)]" />

          <div className="absolute -left-16 top-[-10%] h-[22rem] w-[22rem] rounded-full bg-sky-400/[0.10] blur-3xl animate-[particle-glow-drift_18s_ease-in-out_infinite]" />
          <div className="absolute right-[-8%] top-[12%] h-[18rem] w-[18rem] rounded-full bg-indigo-400/[0.10] blur-3xl animate-[particle-glow-drift_22s_ease-in-out_infinite_reverse]" />
          <div className="absolute bottom-[-10%] left-[24%] h-[20rem] w-[20rem] rounded-full bg-cyan-300/[0.06] blur-3xl animate-[particle-glow-drift_26s_ease-in-out_infinite]" />
        </>
      )}

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
            className={
              overlay
                ? "absolute rounded-full bg-white/75 shadow-[0_0_10px_rgba(190,220,255,0.18)] animate-[particle-float_linear_infinite]"
                : "absolute rounded-full bg-white/90 shadow-[0_0_12px_rgba(190,220,255,0.55)] animate-[particle-float_linear_infinite]"
            }
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

        @keyframes particle-glow-drift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(24px, -18px, 0) scale(1.06);
          }

          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-\\[particle-float_linear_infinite\\],
          .animate-\\[particle-glow-drift_18s_ease-in-out_infinite\\],
          .animate-\\[particle-glow-drift_22s_ease-in-out_infinite_reverse\\],
          .animate-\\[particle-glow-drift_24s_ease-in-out_infinite\\],
          .animate-\\[particle-glow-drift_26s_ease-in-out_infinite\\],
          .animate-\\[particle-glow-drift_28s_ease-in-out_infinite_reverse\\] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}