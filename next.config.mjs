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
  // Configuration ESSENTIELLE pour React-PDF
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },

  // Webpack config pour React-PDF
  webpack: (config, { isServer }) => {
    // Configuration obligatoire pour React-PDF
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Éviter les erreurs avec les modules node
    config.externals = [...(config.externals || [])];

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
      };
    }

    return config;
  },

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
    ],
  },

  // IMPORTANT: Désactiver swcMinify si problèmes de build
  // swcMinify: false, // Décommentez si vous avez des erreurs de build
};

export default withPWA(nextConfig);
