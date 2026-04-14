// app/(auth)/signin/page.tsx
import { signIn } from "@/lib/auth";
import { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Connexion | Gael Richard",
  description: "Connectez-vous à votre compte",
};

export default function SignInPage() {
  return (
    <div className="w-full px-4 py-12">

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-[#7158ff]/20 bg-card p-8 shadow-xl shadow-[#7158ff]/5">

        {/* Logo / titre */}
        <div className="mb-8 text-center">
          <p className="font-[family-name:var(--font-display)] text-3xl uppercase leading-none">
            GR<span className="text-[#7158ff]">.</span>
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-xl uppercase leading-none text-foreground">
            Connexion
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Accède à ton espace pour gérer tes bots
          </p>
        </div>

        {/* Bouton Google */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard/bot" });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 font-mono text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuer avec Google
          </button>
        </form>

        {/* CGU */}
        <p className="mt-6 text-center font-mono text-[10px] leading-relaxed text-muted-foreground/60">
          En continuant, tu acceptes les{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-muted-foreground">
            conditions d'utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-muted-foreground">
            politique de confidentialité
          </Link>.
        </p>
      </div>
    </div>
  );
}
