"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { ServerIcon, CloudIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const botPlans = [
  {
    id: "rar",
    name: "Livraison .zip",
    description: "Reçois les fichiers de ton bot configuré, tu héberges toi-même.",
    price: "49€",
    priceNote: "une seule fois",
    icon: ServerIcon,
    isMostPopular: false,
    cta: "Acheter",
    features: [
      "Fichiers source complets",
      "Configuration pré-remplie",
      "Module Welcome",
      "Module Modération",
      "Module Tickets",
      "Module XP / Niveaux",
      "README & .env.example inclus",
      "Support par email",
    ],
  },
  {
    id: "managed",
    name: "Managed",
    description: "On héberge et gère ton bot pour toi, sans prise de tête.",
    price: "19€",
    priceNote: "/ mois",
    icon: CloudIcon,
    isMostPopular: true,
    cta: "Commencer",
    features: [
      "Tout du plan Livraison",
      "Hébergement sur VPS dédié",
      "Dashboard de configuration",
      "Démarrage en 1 clic",
      "Redémarrage automatique",
      "Monitoring 24/7",
      "Mises à jour automatiques",
      "Support prioritaire Discord",
    ],
  },
];

export default function BotPricingSection() {
  const router = useRouter();

  return (
    <section id="bot-pricing" className="relative">
      <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-8 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h4 className="text-lg font-bold tracking-tight text-black dark:text-white sm:text-xl">
            Bot Discord
          </h4>
          <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            Un bot puissant,{" "}
            <span className="text-primary">deux façons de l'utiliser</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-black/80 dark:text-white sm:text-xl">
            Que tu sois développeur ou non, il y a une option faite pour toi.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2">
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
                    "border-2 border-foreground scale-[1.03]":
                      plan.isMostPopular,
                  }
                )}
              >
                {plan.isMostPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                    Recommandé ✨
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">{plan.name}</h2>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-black/60 dark:text-white/60">
                    {plan.priceNote}
                  </span>
                </div>

                <Button
                  className={cn(
                    "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                    "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                  )}
                  variant={plan.isMostPopular ? "default" : "outline"}
                  onClick={() => router.push("/signin")}
                >
                  <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 dark:bg-black" />
                  {plan.cta}
                </Button>

                <hr className="m-0 h-px w-full border-none bg-linear-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />

                <ul className="flex flex-col gap-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-xs font-medium"
                    >
                      <CheckIcon className="size-5 shrink-0 rounded-lg bg-green-400 p-[2px] text-black" />
                      <span>{feature}</span>
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
