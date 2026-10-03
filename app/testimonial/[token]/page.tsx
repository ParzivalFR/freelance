import { PublicFrame, PublicNotice } from "@/components/public-frame";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import TestimonialForm from "./testimonial-form";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function TestimonialPage({ params }: PageProps) {
  const { token } = await params;
  const tokenData = await prisma.testimonialToken.findUnique({ where: { token } });
  if (!tokenData) notFound();

  const home = (
    <Link
      href="/"
      className="rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-85"
    >
      Voir le site
    </Link>
  );

  if (tokenData.isUsed) {
    return (
      <PublicFrame>
        <PublicNotice
          kicker="avis déjà envoyé"
          title={
            <>
              Merci, c'est <span className="hl">déjà fait.</span>
            </>
          }
          text="Vous avez déjà laissé votre avis avec ce lien. Il est en ligne sur le site."
          action={home}
        />
      </PublicFrame>
    );
  }

  if (new Date() > tokenData.expiresAt) {
    return (
      <PublicFrame>
        <PublicNotice
          kicker="lien expiré"
          title={
            <>
              Ce lien n'est <span className="hl">plus valable.</span>
            </>
          }
          text="Il avait une date limite. Écrivez-moi et je vous en renvoie un nouveau tout de suite."
          action={
            <a
              href="mailto:gael_pro@ik.me"
              className="rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-85"
            >
              Demander un nouveau lien
            </a>
          }
        />
      </PublicFrame>
    );
  }

  return (
    <PublicFrame>
      <span className="note note-comment">votre avis</span>
      <h1 className="mt-5 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.08]">
        Merci {tokenData.clientName.split(" ")[0]}, <span className="hl">à vous.</span>
      </h1>
      <p className="mt-5 max-w-[50ch] text-lg text-muted-foreground">
        Quelques lignes sur notre collaboration
        {tokenData.projectName && (
          <>
            {" "}
            autour de <strong className="font-semibold text-foreground">{tokenData.projectName}</strong>
          </>
        )}
        . Ce que vous écrivez sera publié tel quel sur le site, avec votre nom et votre fonction.
      </p>
      <TestimonialForm token={token} clientName={tokenData.clientName} />
    </PublicFrame>
  );
}
