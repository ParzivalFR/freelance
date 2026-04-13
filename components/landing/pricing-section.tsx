"use client";

import Loader from "@/components/loader";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Interval = "day" | "project";

export const toHumanPrice = (price: number, decimals: number = 0) => {
  return Number(price).toFixed(decimals);
};

const services = [
  {
    id: "landing",
    name: "Landing Page",
    description: "Une page claire et efficace pour te faire connaître en ligne.",
    dailyRate: 150,
    projectRate: 350,
    isMostPopular: false,
    features: [
      "Design responsive mobile/desktop",
      "Formulaire de contact",
      "SEO technique de base",
      "Mise en ligne incluse",
      "1 mois de support offert",
    ],
  },
  {
    id: "site-vitrine",
    name: "Site Vitrine",
    description: "Un vrai site pour présenter ton activité, tes services, ton équipe.",
    dailyRate: 150,
    projectRate: 800,
    isMostPopular: true,
    features: [
      "Tout de Landing Page",
      "Jusqu'à 5 pages",
      "Galerie photos / portfolio",
      "Formulaire de contact ou devis",
      "Google Maps & réseaux sociaux",
      "3 mois de support offert",
    ],
  },
  {
    id: "app-web",
    name: "Sur mesure",
    description: "Un outil web, un logiciel desktop ou une app mobile — on en parle.",
    dailyRate: 150,
    projectRate: null,
    isMostPopular: false,
    features: [
      "Application web (Next.js)",
      "Logiciel desktop (Electron)",
      "App mobile (Expo / React Native)",
      "Réservation, paiement, backoffice...",
      "Base de données & API",
      "Devis gratuit sous 24h",
    ],
  },
];

export default function FreelanceServicesSection() {
  const [interval, setInterval] = useState<Interval>("project");
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();

  const onHireClick = async (serviceId: string) => {
    setIsLoading(true);
    setId(serviceId);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    router.push("#contact");
  };

  return (
    <section id="pricing">
      <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-8 px-4 py-14 md:px-8">

        {/* Header */}
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
            Services
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-foreground">
            Ce que je construis
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des tarifs accessibles pour les artisans, commerçants et petites entreprises qui veulent une vraie présence en ligne.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className={cn("text-sm font-medium transition-colors", interval === "day" ? "text-foreground" : "text-muted-foreground")}>
              Taux journalier
            </span>
            <Switch
              checked={interval === "project"}
              onCheckedChange={(checked) => setInterval(checked ? "project" : "day")}
            />
            <span className={cn("text-sm font-medium transition-colors", interval === "project" ? "text-foreground" : "text-muted-foreground")}>
              Forfait projet
            </span>
          </div>
          <span className="rounded-full bg-[#7158ff]/10 border border-[#7158ff]/30 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-[#7158ff]">
            Paiement 3x dispo
          </span>
        </div>

        {/* Cards */}
        <div className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className={cn(
                "relative flex flex-col gap-5 rounded-2xl border p-6 transition-colors",
                service.isMostPopular
                  ? "border-2 border-[#7158ff] shadow-lg shadow-[#7158ff]/10"
                  : "hover:border-[#7158ff]/30"
              )}
            >
              {service.isMostPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#7158ff] px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-white">
                  Le plus demande
                </span>
              )}

              {/* Titre + description */}
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-xl uppercase leading-none text-foreground">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>

              {/* Prix */}
              <motion.div
                key={`${service.id}-${interval}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-baseline gap-1"
              >
                <span className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-foreground">
                  {interval === "project" && service.projectRate === null
                    ? "Sur devis"
                    : `${toHumanPrice(interval === "project" ? service.projectRate! : service.dailyRate)}€`}
                </span>
                {!(interval === "project" && service.projectRate === null) && (
                  <span className="text-xs text-muted-foreground">
                    / {interval === "day" ? "jour" : "projet"}
                  </span>
                )}
              </motion.div>

              {/* CTA */}
              <button
                disabled={isLoading}
                onClick={() => void onHireClick(service.id)}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50",
                  service.isMostPopular
                    ? "bg-[#7158ff] text-white"
                    : "border border-border text-foreground hover:bg-muted"
                )}
              >
                {isLoading && id === service.id ? (
                  <>
                    <Loader />
                    Traitement...
                  </>
                ) : (
                  "Démarrer ce projet"
                )}
              </button>

              <hr className="border-none h-px bg-linear-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />

              {/* Features */}
              <ul className="flex flex-col gap-2.5">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 rounded bg-[#7158ff]/10 p-[2px] text-[#7158ff]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Asso banner */}
        <div className="mx-auto max-w-5xl w-full rounded-2xl border border-[#7158ff]/30 bg-[#7158ff]/5 p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-widest text-[#7158ff]">Engagement solidaire</p>
            <p className="font-[family-name:var(--font-display)] text-lg uppercase leading-none text-foreground">
              1 site gratuit pour une association
            </p>
            <p className="text-sm text-muted-foreground">
              Tous les 6 mois, j'offre le développement complet d'un site vitrine à une association à but non lucratif.
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckIcon className="size-3.5 text-[#7158ff]" />
                Développement offert
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckIcon className="size-3.5 text-[#7158ff]" />
                Hébergement disponible à 20€/mois
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckIcon className="size-3.5 text-[#7158ff]" />
                Domaine & base de données à votre charge
              </span>
            </div>
          </div>
          <button
            onClick={() => void onHireClick("asso")}
            className="mt-1 shrink-0 rounded-xl bg-[#7158ff] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85 sm:mt-0"
          >
            Postuler
          </button>
        </div>

      </div>
    </section>
  );
}
