"use client";

import { useEffect } from "react";
import { bootOffline } from "@/lib/offline/boot";

export function OfflineBoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void bootOffline();
  }, []);
  return children;
}
