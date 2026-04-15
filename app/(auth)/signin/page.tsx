import { signIn } from "@/lib/auth";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion | Gael Richard",
  description: "Connectez-vous à votre compte",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh">

      {/* ── Panneau gauche ── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#7158ff] p-12 lg:flex">
        {/* Grille déco */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Cercle déco */}
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-[500px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-[350px] rounded-full border border-white/10" />

        <Link href="/" className="relative font-[family-name:var(--font-display)] text-2xl uppercase leading-none text-white">
          GR<span className="opacity-60">.</span>
        </Link>

        <div className="relative space-y-4">
          <p className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4rem)] uppercase leading-none text-white">
            Ton bot.<br />Tes regles.
          </p>
          <p className="font-mono text-sm text-white/60">
            Crée, configure et déploie ton bot Discord<br />en quelques minutes.
          </p>
        </div>
      </div>

      {/* ── Panneau droit ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6">

        <Link
          href="/"
          className="absolute left-6 top-6 flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground lg:left-auto lg:right-6"
        >
          <ArrowLeft className="size-3.5 lg:hidden" />
          <span className="hidden lg:inline">←</span>
          Retour
        </Link>

        <div className="w-full max-w-[340px] space-y-8">

          {/* Titre */}
          <div>
            <p className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,2.5rem)] uppercase leading-none text-foreground">
              Connexion
            </p>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Accède à ton espace de gestion
            </p>
          </div>

          {/* Bouton */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard/bot" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-4 font-mono text-sm font-semibold text-foreground transition-all duration-200 hover:border-[#7158ff]/40 hover:bg-[#7158ff]/5"
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

          <p className="font-mono text-[10px] leading-relaxed text-muted-foreground/50">
            En continuant, tu acceptes les{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-muted-foreground">CGU</Link>
            {" "}et la{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-muted-foreground">politique de confidentialité</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
