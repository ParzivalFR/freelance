// auth.ts
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const AUTHORIZED_EMAIL = "parzivaleu@gmail.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin?error=AccessDenied",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        // Vérifier que l'email est autorisé ET vérifié
        const isAuthorized =
          profile?.email === AUTHORIZED_EMAIL && profile?.email_verified;

        if (!isAuthorized) {
          console.log(`Tentative de connexion refusée pour: ${profile?.email}`);
          return false; // Refuse la connexion
        }

        return true;
      }
      return false; // Refuse tous les autres providers
    },
    async session({ session, user }) {
      // Vérification supplémentaire côté session
      if (session?.user?.email !== AUTHORIZED_EMAIL) {
        throw new Error("Accès non autorisé");
      }

      if (session?.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    // SUPPRIME le callback authorized - c'est ça qui pose problème avec le middleware
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  // events: {
  //   async signOut() {
  //     console.log("Utilisateur déconnecté");
  //   },
  //   async signIn({ user }) {
  //     console.log(`Connexion réussie pour: ${user.email}`);
  //   },
  // },
  // debug: process.env.NODE_ENV === "development",
});
