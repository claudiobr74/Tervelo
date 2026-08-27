import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tervelo",
    short_name: "Tervelo",
    description: "Treinos de musculação que continuam mesmo sem internet.",
    start_url: "/app/today",
    scope: "/",
    display: "standalone",
    background_color: "#0F1115",
    theme_color: "#0F1115",
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
