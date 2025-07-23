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
    id: "service_1",
    name: "Association",
    description: "Sites vitrines pour associations et événements locaux.",
    features: [
      "Site vitrine responsive",
      "Calendrier d'événements",
      "Galerie photos intégrée",
      "Formulaires d'adhésion",
      "2 cycles de révision",
      "Formation à la gestion",
      "Support email prioritaire",
    ],
    dailyRate: 120,
    projectRate: 800,
    isMostPopular: false,
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
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h4 className="text-lg font-bold tracking-tight text-black dark:text-white sm:text-xl">
            Services
          </h4>

          <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            Tarifs adaptés à vos besoins
          </h2>

          <p className="mt-6 text-lg leading-8 text-black/80 dark:text-white sm:text-xl">
            Des solutions web
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
          <span className="inline-block whitespace-nowrap rounded-xl bg-green-500 px-2.5 py-1 text-[11px] font-semibold uppercase leading-5 tracking-wide text-white">
            Forfaits actifs ✨
          </span>
        </div>

        <div className="mx-auto grid w-full flex-col justify-center gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {freelanceServices.map((service, idx) => (
            <div
              key={service.id}
              className={cn(
                "relative flex max-w-[400px] flex-col gap-8 rounded-2xl border p-4 text-black dark:text-white overflow-hidden",
                {
                  "border-2 border-foreground scale-[1.05]":
                    service.isMostPopular,
                  "border-2 border-green-500 bg-green-50/50 dark:bg-green-950/20":
                    service.isSpecial,
                }
              )}
            >
              <div className="flex items-center">
                <div className="ml-4">
                  <h2 className="text-base font-semibold leading-7">
                    {service.name}
                  </h2>
                  <p className="h-12 text-sm leading-5 text-black/70 dark:text-white/70">
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
                      <span className="text-green-600 dark:text-green-400">
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
                  "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2",
                  {
                    "bg-green-600 hover:bg-green-700 text-white":
                      service.isSpecial,
                  }
                )}
                disabled={isLoading}
                onClick={() => void onHireClick(service.id)}
              >
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 dark:bg-black" />
                {(!isLoading || (isLoading && id !== service.id)) && (
                  <p>{service.isSpecial ? "Postuler" : "Me contacter"}</p>
                )}

                {isLoading && id === service.id && <p>Traitement en cours</p>}
                {isLoading && id === service.id && <Loader />}
              </Button>

              <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
              {service.features && service.features.length > 0 && (
                <ul className="flex flex-col gap-2 font-normal">
                  {service.features.map((feature: any, idx: any) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-xs font-medium text-black dark:text-white"
                    >
                      <CheckIcon className="size-5 shrink-0 rounded-lg bg-green-400 p-[2px] text-black dark:text-white " />
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
    <div className="mx-auto mb-6 max-w-screen-md rounded-xl border-l-4 border-green-500 bg-green-50 p-4 text-green-800 dark:bg-green-950/30 dark:text-green-400">
      <p className="flex items-center gap-2 font-bold">
        <CheckIcon className="size-5" />
        Nouveau :
      </p>
      <p className="text-sm">
        Les forfaits projets sont désormais actifs ! Paiement possible en 3 fois
        sans frais pour les projets {">"}1000€. Devis détaillé gratuit sous 24h.
      </p>
    </div>
  );
};
