"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { FaDiscord } from "react-icons/fa";
import { motion } from "framer-motion";
import { CheckCircle2, Cpu, Settings2, Zap } from "lucide-react";
import { RoughNotation } from "react-rough-notation";

const features = [
  {
    title: "Moteur Proprietaire",
    description: "La puissance d'un moteur de bot de nouvelle génération, ultra-stable et performant.",
    icon: <Cpu className="size-5 text-[#7158ff]" />,
  },
  {
    title: "Modules Plug & Play",
    description: "Modération, économie, tickets, IA... activez ce dont vous avez besoin.",
    icon: <Zap className="size-5 text-[#7158ff]" />,
  },
  {
    title: "Deploiement en 1 clic",
    description: "Hébergement inclus sur infrastructure sécurisée 24/7.",
    icon: <CheckCircle2 className="size-5 text-[#7158ff]" />,
  },
];

export default function BotBuilderPreview() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-8">
      <div className="flex flex-col items-center text-center">
        <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
          Bot Builder
        </p>
        
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-foreground pb-4">
          Creez votre bot Discord <br />
          <span className="text-[#7158ff]">sans compromis.</span>
        </h2>
        
        <p className="max-w-2xl text-lg text-muted-foreground">
          Marre des bots génériques qui coûtent une fortune ? J'ai développé un outil qui permet de 
          générer des bots personnalisés basés sur <strong>mon propre moteur d'automatisation</strong>. 
          Vous choisissez, j'assemble, votre communauté profite.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        {/* Mockup de l'interface - Style Safari/Clean */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-4xl bg-[#7158ff] opacity-10 blur-2xl transition duration-1000 group-hover:opacity-20" />
          
          <div className="relative rounded-xl border bg-card text-card-foreground shadow-2xl">
            {/* Header style Safari */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="size-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="size-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Bot Configurator v2.0
              </div>
              <Settings2 className="size-4 text-muted-foreground" />
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {[
                  { name: "Système de Tickets", status: "Activé", color: "text-[#7158ff]" },
                  { name: "Paiements Stripe", status: "Désactivé", color: "text-muted-foreground" },
                  { name: "Modération IA", status: "Activé", color: "text-[#7158ff]" },
                  { name: "Logs Avancés", status: "Activé", color: "text-[#7158ff]" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-dashed p-3">
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase ${item.color}`}>{item.status}</span>
                        <div className={`size-2 rounded-full ${item.status === 'Activé' ? 'bg-[#7158ff] animate-pulse' : 'bg-muted-foreground/30'}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-lg bg-muted p-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#7158ff] text-white">
                    <MagicWandIcon className="size-5" />
                </div>
                <div>
                    <p className="text-xs font-bold leading-none">Status du Bot</p>
                    <p className="text-[10px] text-muted-foreground">Prêt pour le déploiement sur VPS-01</p>
                </div>
                <Button size="sm" className="ml-auto h-8 text-[10px] font-bold uppercase">
                    Déployer
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des features */}
        <div className="flex flex-col gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm">
                {f.icon}
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-base uppercase leading-none text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
              </div>
            </motion.div>
          ))}
          
          <div className="mt-4">
            <button
              onClick={() => window.location.href = "/dashboard/bot"}
              className="group inline-flex items-center gap-2 rounded-xl bg-[#7158ff] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-85 sm:w-auto"
            >
              Configurer mon bot
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
