"use client";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
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

const freelanceServices = [
  {
    id: "service_4",
    name: "Association Gratuite",
    description:
      "Engagement solidaire : 1 site associatif gratuit tous les 6 mois.",
    features: [
      "Développement 100% gratuit",
      "Site vitrine responsive",
      "Calendrier d'événements",
      "Galerie photos",
      "Formulaires de contact/adhésion",
      "Formation à la gestion",
      "Maintenance à 20€/mois (optionnelle)",
      "Hébergement et domaine à vos frais",
    ],
    dailyRate: 0,
    projectRate: 0,
    isMostPopular: false,
    isSpecial: true,
  },
  {
    id: "service_2",
    name: "Startup",
    description: "Lance ta présence web rapidement et efficacement.",
    features: [
      "Landing page moderne",
      "CMS simple pour blog",
      "Formulaires de contact avancés",
      "Analytics et tracking",
      "Optimisation SEO de base",
      "3 cycles de révision",
      "Support Discord",
      "1 mois de maintenance offert",
    ],
    dailyRate: 150,
    projectRate: 1200,
    isMostPopular: true,
  },
  {
    id: "service_3",
    name: "PME",
    description: "Solution complète pour petites et moyennes entreprises.",
    features: [
      "Site multi-pages professionnel",
      "Système de réservation/devis",
      "Intégration réseaux sociaux",
      "SEO avancé et sitemap",
      "Espace client sécurisé",
      "Formation complète équipe",
      "Support prioritaire multi-canal",
      "3 mois de maintenance inclus",
    ],
    dailyRate: 180,
    projectRate: 2000,
    isMostPopular: false,
  },
];

export default function FreelanceServicesSection() {
  const [interval, setInterval] = useState<Interval>("day");
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();

  const onHireClick = async (serviceId: string) => {
    setIsLoading(true);
    setId(serviceId);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay
    setIsLoading(false);
    router.push("#contact");
  };

  return (
    <section id="pricing">
      <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-8 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
            Services
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-foreground">
            Tarifs adaptes a vos besoins
          </h2>

          <p className="mt-6 text-lg leading-8 text-black/80 dark:text-white sm:text-xl">
            Des solutions web & automation
            <u>
              <strong> abordables et sur mesure</strong>
            </u>{" "}
            pour associations, startups et PME. Développement professionnel sans
            compromis sur la qualité.
          </p>
        </div>

        <AlerteNote />

        <div className="mb-6 flex w-full items-center justify-center space-x-2">
          <Switch
            id="interval"
            onCheckedChange={(checked) => {
              setInterval(checked ? "project" : "day");
            }}
          />
          <span>
            {interval === "day" ? "Taux Journalier" : "Forfait Projet"}
          </span>
          <span className="inline-block whitespace-nowrap rounded-full bg-[#7158ff]/10 border border-[#7158ff]/30 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-[#7158ff]">
            Forfaits actifs
          </span>
        </div>

        <div className="mx-auto grid w-full flex-col justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {freelanceServices.map((service, idx) => (
            <div
              key={service.id}
              className={cn(
                "relative flex max-w-[400px] flex-col gap-6 rounded-2xl border p-6 overflow-hidden transition-all duration-300",
                {
                  "border-2 border-[#7158ff] scale-[1.03] shadow-lg shadow-[#7158ff]/10":
                    service.isMostPopular,
                  "border-2 border-[#7158ff]/50 bg-[#7158ff]/5":
                    service.isSpecial,
                }
              )}
            >
              <div className="flex items-center">
                <div className="ml-4">
                  <h2 className="font-[family-name:var(--font-display)] text-lg uppercase leading-none text-foreground">
                    {service.name}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </div>

              <motion.div
                key={`${service.id}-${interval}`}
                initial="initial"
                animate="animate"
                variants={{
                  initial: {
                    opacity: 0,
                    y: 12,
                  },
                  animate: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + idx * 0.05,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="flex flex-col gap-1"
              >
                <span className="text-4xl font-bold text-black dark:text-white">
                  {service.isSpecial ? (
                    <>
                      <span className="text-[#7158ff]">
                        Gratuit
                      </span>
                      <span className="text-xs"> / projet</span>
                    </>
                  ) : (
                    <>
                      {interval === "project"
                        ? `${toHumanPrice(service.projectRate)}€`
                        : `${toHumanPrice(service.dailyRate)}€`}
                      <span className="text-xs">
                        {" "}
                        / {interval === "day" ? "jour" : "projet"}
                      </span>
                    </>
                  )}
                </span>
              </motion.div>

              <Button
                className={cn(
                  "w-full rounded-xl font-semibold transition-opacity hover:opacity-85",
                  service.isSpecial
                    ? "bg-[#7158ff] text-white"
                    : service.isMostPopular
                    ? "bg-[#7158ff] text-white"
                    : ""
                )}
                disabled={isLoading}
                onClick={() => void onHireClick(service.id)}
              >
                {(!isLoading || (isLoading && id !== service.id)) && (
                  <p>{service.isSpecial ? "Postuler" : "Me contacter"}</p>
                )}

                {isLoading && id === service.id && <p>Traitement en cours</p>}
                {isLoading && id === service.id && <Loader />}
              </Button>

              <hr className="m-0 h-px w-full border-none bg-linear-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
              {service.features && service.features.length > 0 && (
                <ul className="flex flex-col gap-2 font-normal">
                  {service.features.map((feature: any, idx: any) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-xs text-foreground"
                    >
                      <CheckIcon className="size-5 shrink-0 rounded-lg bg-[#7158ff] p-[2px] text-white" />
                      <span className="flex">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const AlerteNote = () => {
  return (
    <div className="mx-auto mb-6 max-w-(--breakpoint-md) rounded-xl border-l-4 border-[#7158ff] bg-[#7158ff]/5 p-4">
      <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-[#7158ff]">
        <CheckIcon className="size-4" />
        Nouveau
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Les forfaits projets sont désormais actifs ! Paiement possible en 3 fois
        sans frais pour les projets {">"}1000€. Devis détaillé gratuit sous 24h.
      </p>
    </div>
  );
};
