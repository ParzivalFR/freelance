/** @type {import('next').NextConfig} */

import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  skipWaiting: true,
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Configuration pour React-PDF
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Éviter les erreurs avec React-PDF côté serveur
    if (isServer) {
      config.externals = [...config.externals, "@react-pdf/renderer"];
    }

    return config;
  },

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
};

export default withPWA(nextConfig);
