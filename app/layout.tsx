import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Polices de la page d'accueil (classe .landing dans globals.css)
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Metadata statique par défaut
// Les métadonnées dynamiques seront gérées via generateMetadata() dans chaque page si nécessaire
const title = "Gaël Richard · Développeur freelance";
const description =
  "Sites, applications et bots Discord sur mesure. Un seul interlocuteur, du premier croquis à la mise en ligne. Devis gratuit sous 24 h.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gael-dev.fr"),
  title,
  description,
  manifest: "/manifest.json",
  openGraph: {
    url: "https://gael-dev.fr",
    type: "website",
    siteName: "gael-dev.fr",
    locale: "fr_FR",
    title,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@gaelprodev",
    site: "@gaelprodev",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <Script
        defer
        data-domain="gael-dev.fr"
        src="https://plausible.gael-dev.fr/js/script.js"
      />
      <body
        className={cn(
          "min-h-dvh bg-background font-sans antialiased flex flex-col",
          GeistSans.variable,
          GeistMono.variable,
          bricolage.variable,
          instrumentSans.variable,
          jetbrainsMono.variable
        )}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
