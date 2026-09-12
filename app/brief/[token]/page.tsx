import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BriefForm from "./brief-form";

interface PageProps {
  params: Promise<{ token: string }>;
}

// Un lien privé n'a rien à faire dans les moteurs de recherche.
export const metadata: Metadata = {
  title: "Votre projet de site",
  robots: { index: false, follow: false },
};

function Message({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        {/* Titre sans capitale accentuee : voir brief-form.tsx. */}
        <h1 className="font-[family-name:var(--font-display)] pt-[0.14em] text-3xl uppercase leading-[1.25] text-foreground">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">{text}</p>
        <p className="mt-8 text-sm text-muted-foreground">
          Écrivez-moi à{" "}
          <a
            className="text-[#7158ff] underline"
            href="mailto:hello@gael-dev.fr"
          >
            hello@gael-dev.fr
          </a>{" "}
          et je vous renvoie un lien.
        </p>
      </div>
    </div>
  );
}

export default async function BriefPage({ params }: PageProps) {
  const { token } = await params;

  const brief = await prisma.brief.findUnique({ where: { token } });
  if (!brief) notFound();

  if (brief.status === "submitted") {
    return (
      <Message
        title="Tout est bon"
        text="J'ai bien reçu vos réponses, merci ! Je reviens vers vous très vite avec une proposition."
      />
    );
  }

  if (new Date() > brief.expiresAt) {
    return (
      <Message
        title="Lien trop ancien"
        text="Ce lien n'est plus valable. Pas d'inquiétude, il suffit d'en demander un nouveau."
      />
    );
  }

  return (
    <BriefForm
      token={brief.token}
      firstName={brief.firstName}
      company={brief.company}
    />
  );
}
