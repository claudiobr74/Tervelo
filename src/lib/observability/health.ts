export const APP_SERVICE = "tervelo-web";

export function healthPayload(): { status: "ok"; service: string; version: string } {
  return {
    status: "ok",
    service: APP_SERVICE,
    version: process.env.npm_package_version ?? "0.1.0",
  };
}
