"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useState } from "react";

type Interval = "day" | "project";

export const toHumanPrice = (price: number, decimals: number = 0) => {
  return Number(price).toFixed(decimals);
};

const freelanceServices = [
  {
    id: "service_1",
    name: "Starter",
    description: "Idéal pour les sites vitrines et les projets simples",
    features: [
      "Développement web front-end",
      "Design responsive basique",
      "1 cycle de révision",
      "Support par email et/ou Discord",
    ],
    dailyRate: 250,
    projectRate: 2000,
    estimatedDays: 8,
    isMostPopular: false,
  },
  {
    id: "service_2",
    name: "Standard",
    description: "Parfait pour les projets de taille moyenne",
    features: [
      "Développement web full-stack",
      "Design responsive avancé",
      "2 cycles de révision",
      "Intégration API basique",
      "Support par email, Discord et téléphone",
    ],
    dailyRate: 300,
    projectRate: 4500,
    estimatedDays: 15,
    isMostPopular: true,
  },
  {
    id: "service_3",
    name: "Premium",
    description:
      "Pour les projets complexes nécessitant une attention particulière",
    features: [
      "Développement web full-stack",
      "Design personnalisé",
      "Cycles de révision illimités",
      "Intégration API avancée",
      "Optimisation des performances",
      "Support prioritaire 24/7",
    ],
    dailyRate: 350,
    projectRate: 8750,
    estimatedDays: 25,
    isMostPopular: false,
  },
];

export default function FreelanceServicesSection() {
  const [interval, setInterval] = useState<Interval>("day");
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState<string | null>(null);

  const onHireClick = async (serviceId: string) => {
    setIsLoading(true);
    setId(serviceId);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay
    setIsLoading(false);
  };

  return (
    <section id="services">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h4 className="text-lg sm:text-xl font-bold tracking-tight text-black dark:text-white">
            Services
          </h4>

          <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            Services de Développement Freelance
          </h2>

          <p className="mt-6 text-lgsm:text-xl leading-8 text-black/80 dark:text-white">
            Choisissez l'
            <u>
              <strong>offre idéale</strong>
            </u>{" "}
            pour votre projet. Je propose des solutions flexibles pour répondre
            à vos besoins de développement, que vous soyez une startup ou une
            entreprise établie.
          </p>
        </div>

        <div className="flex w-full items-center justify-center space-x-2">
          <Switch
            id="interval"
            onCheckedChange={(checked) => {
              setInterval(checked ? "project" : "day");
            }}
          />
          <span>
            {interval === "day" ? "Taux Journalier" : "Forfait Projet"}
          </span>
          <span className="inline-block whitespace-nowrap rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold uppercase leading-5 tracking-wide text-white dark:bg-white dark:text-black">
            Devis gratuit ✨
          </span>
        </div>

        <div className="mx-auto grid w-full justify-center sm:grid-cols-2 lg:grid-cols-3 flex-col gap-4">
          {freelanceServices.map((service, idx) => (
            <div
              key={service.id}
              className={cn(
                "relative flex max-w-[400px] flex-col gap-8 rounded-2xl border p-4 text-black dark:text-white overflow-hidden",
                {
                  "border-2 border-foreground dark:border-foreground":
                    service.isMostPopular,
                }
              )}
            >
              <div className="flex items-center">
                <div className="ml-4">
                  <h2 className="text-base font-semibold leading-7">
                    {service.name}
                  </h2>
                  <p className="h-12 text-sm leading-5 text-black/70 dark:text-white">
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
                  {interval === "project"
                    ? `${toHumanPrice(service.projectRate)}€`
                    : `${toHumanPrice(service.dailyRate)}€`}
                  <span className="text-xs">
                    {" "}
                    / {interval === "day" ? "jour" : "projet"}
                  </span>
                </span>
                {interval === "project" && (
                  <span className="text-sm text-black/70 dark:text-white/70">
                    Durée estimée : {service.estimatedDays} jours
                  </span>
                )}
              </motion.div>

              <Button
                className={cn(
                  "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                )}
                disabled={isLoading}
                onClick={() => void onHireClick(service.id)}
              >
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 dark:bg-black" />
                {(!isLoading || (isLoading && id !== service.id)) && (
                  <p>Me contacter</p>
                )}

                {isLoading && id === service.id && <p>Traitement en cours</p>}
                {isLoading && id === service.id && (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                )}
              </Button>

              <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
              {service.features && service.features.length > 0 && (
                <ul className="flex flex-col gap-2 font-normal">
                  {service.features.map((feature: any, idx: any) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-xs font-medium text-black dark:text-white"
                    >
                      <CheckIcon className="h-5 w-5 shrink-0 rounded-full bg-green-400 p-[2px] text-black dark:text-white" />
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
