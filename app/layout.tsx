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
export const metadata: Metadata = {
  title: "Gael Richard - Développeur Freelance",
  manifest: "/manifest.json",
  description:
    "Propulsez votre présence sur le web. Des solutions sur mesure pour vos projets web, développées avec passion et expertise avec une attention particulière pour l'expérience utilisateur.",
  openGraph: {
    url: "https://gael-dev.fr",
    type: "website",
    title: "Gael Richard - Développeur Freelance",
    description:
      "Propulsez votre présence sur le web. Des solutions sur mesure pour vos projets web, développées avec passion et expertise avec une attention particulière pour l'expérience utilisateur.",
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/images/5abe5dcf-a83d-46bc-95a0-9b65450a8d03.png?token=aQjQc1mAER4m7abNUzFtrqhVThtneu5kUzd7M_zfX5M&height=630&width=1200&expires=33263104817",
        width: 1200,
        height: 630,
        alt: "Gael Richard - Développeur Freelance",
      },
    ],
  },
  twitter: {
    creator: "@gaelprodev",
    site: "@gaelprodev",
    card: "summary_large_image",
    title: "Gael Richard - Développeur Freelance",
    description:
      "Propulsez votre présence sur le web. Des solutions sur mesure pour vos projets web, développées avec passion et expertise avec une attention particulière pour l'expérience utilisateur.",
    images: [
      "https://opengraph.b-cdn.net/production/images/5abe5dcf-a83d-46bc-95a0-9b65450a8d03.png?token=aQjQc1mAER4m7abNUzFtrqhVThtneu5kUzd7M_zfX5M&height=630&width=1200&expires=33263104817",
    ],
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
