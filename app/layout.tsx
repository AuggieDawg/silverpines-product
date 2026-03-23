import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import RouteParticles from "@/components/background/RouteParticles";
import { GlobalHeader } from "@/components/GlobalHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SilverPines Product",
  description: "Operational systems, property workflows, and premium client-facing interfaces.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#050811] text-white antialiased`}
      >
        <RouteParticles />

        <div className="relative z-10 flex min-h-screen flex-col">
          <GlobalHeader />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}