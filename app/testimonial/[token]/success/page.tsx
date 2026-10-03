import { PublicFrame, PublicNotice } from "@/components/public-frame";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <PublicFrame>
      <PublicNotice
        kicker="avis envoyé"
        title={
          <>
            Merci, <span className="hl">vraiment.</span>
          </>
        }
        text="Votre avis est en ligne sur le site. C'est ce qui compte le plus pour convaincre les prochains clients, alors merci d'avoir pris le temps."
        action={
          <Link
            href="/#avis"
            className="rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-85"
          >
            Voir les avis sur le site
          </Link>
        }
      />
    </PublicFrame>
  );
}
