"use client";

import { createClient } from "@nhost/nhost-js";
import { getNhostPublicConfig } from "@/lib/nhost/config";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getBrowserNhostClient() {
  if (!browserClient) {
    const { subdomain, region } = getNhostPublicConfig();
    browserClient = createClient({ subdomain, region });
  }
  return browserClient;
}
