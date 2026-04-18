"use client";

import { useState } from "react";

type FlipCardProps = {
  title: string;
  frontText: string;
  backText: string;
  frontImageSrc?: string;
  backImageSrc?: string;
};

export function FlipCard({
  title,
  frontText,
  backText,
  frontImageSrc,
  backImageSrc,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const shinyRed = `
    radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), rgba(255,255,255,0) 35%),
    linear-gradient(135deg, #ff2b2b 0%, #b30000 55%, #7a0000 100%)
  `;

  return (
    <button
      onClick={() => setFlipped((value) => !value)}
      style={{
        width: "100%",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
      }}
      aria-pressed={flipped}
      title="Click to flip"
    >
      <div
        style={{
          perspective: 1200,
          width: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: 320,
            borderRadius: 18,
            transformStyle: "preserve-3d",
            transition: "transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              backfaceVisibility: "hidden",
              background: shinyRed,
              border: "1px solid rgba(0,0,0,0.25)",
              color: "#000",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>

            {frontImageSrc ? (
              <div style={{ display: "grid", placeItems: "center", flex: 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frontImageSrc}
                  alt={`${title} image`}
                  style={{
                    width: 96,
                    height: 96,
                    objectFit: "cover",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.20)",
                    border: "1px solid rgba(0,0,0,0.20)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                  }}
                />
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}

            <div style={{ fontWeight: 650, opacity: 0.95 }}>{frontText}</div>

            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Click to flip →
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: shinyRed,
              border: "1px solid rgba(0,0,0,0.25)",
              color: "#000",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>

            {backImageSrc ? (
              <div style={{ display: "grid", placeItems: "center", flex: 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={backImageSrc}
                  alt={`${title} back image`}
                  style={{
                    width: 96,
                    height: 96,
                    objectFit: "cover",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.20)",
                    border: "1px solid rgba(0,0,0,0.20)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                  }}
                />
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}

            <div style={{ fontWeight: 650, opacity: 0.95 }}>{backText}</div>

            <div style={{ fontSize: 12, opacity: 0.75 }}>
              ← Click to flip back
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
