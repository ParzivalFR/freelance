// next.config.mjs - Configuration OBLIGATOIRE pour React-PDF
/** @type {import('next').NextConfig} */

import nextPWA from "next-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";

const withPWA = nextPWA({
  dest: "public",
  skipWaiting: true,
  register: true,
  disable: process.env.NODE_ENV === "development",
});

// Sources que le site charge réellement (inventaire du 2026-09-11). Tout ajout
// de script ou de service tiers doit être déclaré ici.
const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' : Next injecte des scripts en ligne pour l'hydratation.
  "script-src 'self' 'unsafe-inline' https://plausible.gael-dev.fr",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://plausible.gael-dev.fr wss: https:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  // La connexion Google et le paiement Stripe partent d'un formulaire puis
  // redirigent : Chrome applique form-action à ces redirections.
  "form-action 'self' https://accounts.google.com https://checkout.stripe.com",
].join("; ");

const securityHeaders = [
  // Interdit d'afficher le site dans un cadre sur un autre site (faux clics).
  { key: "X-Frame-Options", value: "DENY" },
  // Le navigateur ne devine plus le type d'un fichier.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Désactive l'ancien filtre XSS des navigateurs, lui-même source de failles.
  { key: "X-XSS-Protection", value: "0" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // En observation : le navigateur signale dans sa console ce qu'il aurait
  // bloqué, sans rien bloquer. À passer en Content-Security-Policy une fois
  // la liste validée en navigation réelle.
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  // Serveur autonome pour l'image Docker : seules les dépendances réellement
  // utilisées sont embarquées, au lieu de tout node_modules.
  output: "standalone",
  // Un package-lock.json traîne dans le dossier utilisateur : sans cette ligne,
  // Next le prend pour la racine du projet et imbrique mal le build autonome.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),

  // Configuration pour les images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "syuntuolmcrumibzzxrl.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  // IMPORTANT: Désactiver swcMinify si problèmes de build
  // swcMinify: false, // Décommentez si vous avez des erreurs de build
};

export default withPWA(nextConfig);
