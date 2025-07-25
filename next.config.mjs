// next.config.mjs - Configuration OBLIGATOIRE pour React-PDF
/** @type {import('next').NextConfig} */

import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  skipWaiting: true,
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
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
    ],
  },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  // IMPORTANT: Désactiver swcMinify si problèmes de build
  // swcMinify: false, // Décommentez si vous avez des erreurs de build
};

export default withPWA(nextConfig);
