import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { SkipLink } from "@/components/a11y/skip-link";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { OfflineBoot } from "@/components/app/offline-boot";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TERVELO",
  applicationName: "Tervelo",
  description:
    "Treinamento de musculação, evolução corporal, recuperação e nutrição esportiva com acompanhamento longitudinal.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Tervelo",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/pwa-192.png",
    apple: "/icons/pwa-192.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <SkipLink />
        <ThemeProvider>
          <OfflineBoot>
            <div id="conteudo" className="flex min-h-full flex-1 flex-col">
              {children}
            </div>
          </OfflineBoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
