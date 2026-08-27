import { nhostMode, resolveDeployTarget } from "@/lib/deploy/runtime";

export const APP_SERVICE = "tervelo-web";

export function healthPayload(): {
  status: "ok";
  service: string;
  version: string;
  deploy: "local" | "preview" | "production";
  nhost: "local-preview" | "configured";
} {
  return {
    status: "ok",
    service: APP_SERVICE,
    version: process.env.npm_package_version ?? "0.1.0",
    deploy: resolveDeployTarget(),
    nhost: nhostMode(),
  };
}
