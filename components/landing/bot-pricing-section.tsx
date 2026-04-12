"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { ServerIcon, CloudIcon, BotIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const botPlans = [
  {
    id: "free",
    name: "Free",
    description: "Lance ton bot gratuitement et découvre la plateforme.",
    price: "0€",
    priceNote: "pour toujours",
    icon: BotIcon,
    isMostPopular: false,
    cta: "Commencer gratuitement",
    features: [
      "1 bot hébergé",
      "Module Welcome",
      "Module Logs",
      "Dashboard de configuration",
      "Démarrage en 1 clic",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Tous les modules, bots illimités, support prioritaire.",
    price: "5€",
    priceNote: "/ mois",
    icon: CloudIcon,
    isMostPopular: true,
    cta: "Passer Pro",
    features: [
      "Tout du plan Free",
      "Bots illimités",
      "Module Modération",
      "Module Tickets",
      "Module XP / Niveaux",
      "Module Survey",
      "Module Monitor",
      "Support prioritaire Discord",
      "Mises à jour automatiques",
    ],
  },
  {
    id: "zip",
    name: "Livraison .zip",
    description: "Reçois les fichiers de ton bot configuré, tu héberges toi-même.",
    price: "49€",
    priceNote: "une seule fois",
    icon: ServerIcon,
    isMostPopular: false,
    cta: "Acheter",
    features: [
      "Fichiers source complets",
      "Tous les modules inclus",
      "Configuration pré-remplie",
      "README & .env.example inclus",
      "Support par email",
    ],
  },
];

export default function BotPricingSection() {
  const router = useRouter();

  return (
    <section id="bot-pricing" className="relative">
      <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-8 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
            Bot Discord
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-foreground">
            Un bot puissant,{" "}
            <span className="text-[#7158ff]">au prix que tu veux</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-black/80 dark:text-white sm:text-xl">
            Commence gratuitement, passe Pro quand tu es prêt.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-6 py-4 sm:grid-cols-3">
          {botPlans.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={cn(
                  "relative flex flex-col gap-6 rounded-2xl border p-6 text-black dark:text-white",
                  {
                    "border-2 border-[#7158ff] sm:scale-[1.03] shadow-lg shadow-[#7158ff]/10":
                      plan.isMostPopular,
                  }
                )}
              >
                {plan.isMostPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#7158ff] px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-white">
                    Recommandé
                  </span>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#7158ff]/10">
                    <Icon className="size-5 text-[#7158ff]" />
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-base uppercase leading-none text-foreground">{plan.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-foreground">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.priceNote}
                  </span>
                </div>

                <button
                  className={cn(
                    "w-full rounded-xl py-2.5 font-semibold transition-opacity hover:opacity-85",
                    plan.isMostPopular
                      ? "bg-[#7158ff] text-white"
                      : "border border-border text-foreground hover:bg-muted"
                  )}
                  onClick={() => router.push("/signin")}
                >
                  {plan.cta}
                </button>

                <hr className="m-0 h-px w-full border-none bg-linear-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />

                <ul className="flex flex-col gap-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-xs font-medium"
                    >
                      <CheckIcon className="size-5 shrink-0 rounded-lg bg-[#7158ff] p-[2px] text-white" />
                      <span className="text-xs text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
