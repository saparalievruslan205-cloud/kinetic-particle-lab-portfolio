import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import ClientRuntime from "@/components/ClientRuntime";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KINETIC//LAB — Creative Technologist",
    template: "%s — KINETIC//LAB",
  },
  description:
    "Иммерсивные интерфейсы, real-time графика и full-stack продукты — immersive interfaces, real-time graphics and digital systems.",
  keywords: [
    "Creative Technologist",
    "Fullstack Developer",
    "Three.js",
    "WebGL",
    "Next.js",
    "Interactive Portfolio",
  ],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fafc",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body>
        <SmoothScroll>
          <ClientRuntime />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
