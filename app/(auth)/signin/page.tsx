// app/(auth)/signin/page.tsx
import { buttonVariants } from "@/components/ui/button";
import { signIn } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Connexion | Gael Richard",
  description: "Connectez-vous à votre compte",
};

export default function SignInPage() {
  return (
    <div className="container flex h-dvh w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        <ChevronLeft className="mr-2 size-4" />
        Retour
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Connexion à votre compte
          </h1>
          <p className="text-sm text-muted-foreground">
            Connectez-vous pour accéder à votre espace personnel
          </p>
        </div>

        {/* Formulaire de connexion Google */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full gap-2"
            )}
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuer avec Google
          </button>
        </form>

        <p className="px-8 text-center text-sm text-muted-foreground">
          En vous connectant, vous acceptez nos{" "}
          <Link
            href="/terms"
            className="hover:text-brand underline underline-offset-4"
          >
            conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link
            href="/privacy"
            className="hover:text-brand underline underline-offset-4"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
