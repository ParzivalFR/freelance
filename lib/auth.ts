import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

const ADMIN_EMAIL = "parzivaleu@gmail.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async signIn({ profile }) {
      // Tout compte Google vérifié peut se connecter
      return !!profile?.email_verified;
    },
    async jwt({ token, user }) {
      if (user) {
        // Premier sign-in : on encode l'id, l'email et le rôle dans le JWT
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.email === ADMIN_EMAIL ? "ADMIN" : "CLIENT";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = (token.role as string) ?? "CLIENT";
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // S'assurer que le rôle ADMIN est bien en base aussi
      if (user.email === ADMIN_EMAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
});
