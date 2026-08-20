"use client";

import { useEffect, useState } from "react";

interface ConnectionInfo {
  effectiveType?: string;
  saveData?: boolean;
}

function canPlayHeroVideo() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithHints = navigator as Navigator & {
    connection?: ConnectionInfo;
    deviceMemory?: number;
  };
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = navigatorWithHints.connection;
  const lowMemory = (navigatorWithHints.deviceMemory ?? 8) <= 4;
  const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
  const slowNetwork = connection?.saveData || /2g|3g/.test(connection?.effectiveType ?? "");

  return hasFinePointer && !reducedMotion && !lowMemory && !lowCpu && !slowNetwork;
}

export default function HeroVideo() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateVideoMode = () => setIsEnabled(canPlayHeroVideo());

    updateVideoMode();
    pointerQuery.addEventListener("change", updateVideoMode);
    motionQuery.addEventListener("change", updateVideoMode);

    return () => {
      pointerQuery.removeEventListener("change", updateVideoMode);
      motionQuery.removeEventListener("change", updateVideoMode);
    };
  }, []);

  return (
    <div className="hero-video-background" aria-hidden="true">
      {isEnabled ? (
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src="/videos/iridescent-loop.mp4" type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
