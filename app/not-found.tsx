import { LogoMark } from "@/components/logo";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="landing grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-[560px]">
        <Link href="/" className="inline-block">
          <LogoMark className="size-12" />
        </Link>
        <span className="note note-comment mt-8 block w-max">erreur 404</span>
        <h1 className="mt-4 text-[clamp(2.2rem,6vw,3.8rem)] font-extrabold leading-[1.08]">
          Cette page <span className="hl">n'existe pas.</span>
        </h1>
        <p className="mt-5 max-w-[44ch] text-lg text-muted-foreground">
          Le lien est peut-être périmé, ou l'adresse a été mal recopiée. Rien de grave.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-85"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/#contact"
            className="rounded-full border bg-card px-6 py-3.5 font-semibold transition-colors hover:bg-muted"
          >
            Me contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
