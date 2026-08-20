"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CustomCursor = dynamic(() => import("@/components/CustomCursor"), {
  ssr: false,
});

export default function ClientRuntime() {
  const [enableCursor, setEnableCursor] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateCursorMode = () => setEnableCursor(pointerQuery.matches);

    updateCursorMode();
    pointerQuery.addEventListener("change", updateCursorMode);

    return () => pointerQuery.removeEventListener("change", updateCursorMode);
  }, []);

  return enableCursor ? <CustomCursor /> : null;
}
