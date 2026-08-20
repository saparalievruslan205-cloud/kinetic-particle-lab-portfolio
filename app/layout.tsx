import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import ClientRuntime from "@/components/ClientRuntime";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KINETIC//LAB — Creative Technologist",
    template: "%s — KINETIC//LAB",
  },
  description:
    "Immersive interfaces, real-time graphics and full-stack products where code, movement and light become one system.",
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
    <html lang="en" className={manrope.variable}>
      <body>
        <SmoothScroll>
          <ClientRuntime />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
