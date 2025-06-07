/** @type {import('next').NextConfig} */

import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  skipWaiting: true,
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  // experimental: {
  //   nodeMiddleware: true,
  // },

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
