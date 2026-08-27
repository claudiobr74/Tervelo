import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tervelo",
    short_name: "Tervelo",
    description: "Treinos de musculação que continuam mesmo sem internet.",
    start_url: "/app/today",
    scope: "/",
    display: "standalone",
    // Mesma abertura do app: claro por padrão.
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
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
