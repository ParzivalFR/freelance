import { PageHeader, SectionTitle } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  BellRing,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import Link from "next/link";
import { SmtpCheck } from "./smtp-check";

/**
 * Inventaire des emails réellement envoyés par le site. Rien n'est édité ici :
 * le contenu vit dans le code, cette page sert à savoir ce qui part, quand,
 * et où le modifier.
 */
const emails = [
  {
    name: "Nouveau message de contact",
    icon: BellRing,
    recipient: "Vous",
    trigger: "À chaque envoi du formulaire de contact de la landing.",
    source: "app/api/contact/route.ts",
  },
  {
    name: "Accusé de réception",
    icon: CheckCircle2,
    recipient: "Le visiteur",
    trigger: "Envoyé dans la foulée, pour confirmer que le message est bien passé.",
    source: "app/api/contact/route.ts",
  },
  {
    name: "Demande de témoignage",
    icon: MessageSquare,
    recipient: "Le client",
    trigger:
      "Manuel, depuis la page Témoignages : contient le lien unique de dépôt d'avis.",
    source: "lib/email-templates/testimonial-request.ts",
    link: { href: "/admin/testimonials", label: "Envoyer un témoignage" },
  },
  {
    name: "Envoi de devis",
    icon: FileText,
    recipient: "Le client",
    trigger: "Manuel, depuis le générateur de devis : le PDF est joint à l'email.",
    source: "lib/email.ts",
    link: { href: "/admin/devis", label: "Créer un devis" },
  },
];

export default async function EmailTemplatesPage() {
  const [testimonialTokens, usedTokens] = await Promise.all([
    prisma.testimonialToken.count({ where: { emailSentAt: { not: null } } }).catch(() => 0),
    prisma.testimonialToken.count({ where: { isUsed: true } }).catch(() => 0),
  ]);

  const senderAddress = process.env.EMAIL_USER ?? null;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Ce qui part de votre boîte"
        title="E"
        titleAccent="mails"
        description="Les quatre emails que le site envoie réellement, avec leur déclencheur et le fichier où en modifier le contenu."
        actions={<SmtpCheck />}
      />

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Send className="size-4 text-[#7158ff]" />
            Expéditeur :
            <span className="font-medium text-foreground">
              {senderAddress ?? "non configuré (EMAIL_USER manquant)"}
            </span>
          </span>
          <span className="text-muted-foreground">
            Liens de témoignage envoyés :{" "}
            <span className="font-medium text-foreground">{testimonialTokens}</span>
            {testimonialTokens > 0 && ` · ${usedTokens} complété${usedTokens > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Les emails envoyés</SectionTitle>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {emails.map((email) => (
            <div
              key={email.name}
              className="flex flex-col rounded-2xl border bg-card p-5 transition-colors hover:border-[#7158ff]/40"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7158ff]/10 text-[#7158ff]">
                  <email.icon className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-foreground">{email.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    Destinataire : {email.recipient}
                  </Badge>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">{email.trigger}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <code className="truncate font-mono text-xs text-muted-foreground">
                  {email.source}
                </code>
                {email.link && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={email.link.href}>{email.link.label}</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-dashed bg-card p-5">
        <Mail className="mt-0.5 size-5 shrink-0 text-[#7158ff]" />
        <p className="text-sm text-muted-foreground">
          Le contenu de ces emails est écrit en dur dans le code, pas en base : pas d&apos;éditeur
          ici, mais aucun risque qu&apos;un template parte vide ou à moitié rempli. Le bouton
          ci-dessus ouvre juste la connexion SMTP pour vérifier que les identifiants passent —
          il n&apos;envoie rien.
        </p>
      </div>
    </div>
  );
}
