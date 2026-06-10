import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Config edge-safe — pas de Prisma, utilisée par le middleware
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin?error=AccessDenied",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string;
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as string;
      return session;
    },
  },
};
