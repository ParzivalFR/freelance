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
    title: "Moteur Propriétaire",
    description: "La puissance d'un moteur de bot de nouvelle génération, ultra-stable et performant.",
    icon: <Cpu className="size-5 text-blue-500" />,
  },
  {
    title: "Modules Plug & Play",
    description: "Modération, économie, tickets, IA... activez ce dont vous avez besoin.",
    icon: <Zap className="size-5 text-yellow-500" />,
  },
  {
    title: "Déploiement en 1 clic",
    description: "Hébergement inclus sur infrastructure sécurisée 24/7.",
    icon: <CheckCircle2 className="size-5 text-green-500" />,
  },
];

export default function BotBuilderPreview() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-8">
      <div className="flex flex-col items-center text-center">
        <Badge variant="outline" className="mb-4 rounded-xl border-blue-500/50 bg-blue-500/10 px-4 py-1 text-blue-600 dark:text-blue-400">
          <FaDiscord className="mr-2 size-4" />
          Nouveauté : Bot Builder
        </Badge>
        
        <h2 className="text-balance bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text pb-6 text-4xl font-medium tracking-tighter text-transparent dark:from-white dark:to-white/40 sm:text-5xl md:text-6xl">
          Créez votre bot Discord <br />
          <RoughNotation type="highlight" show={true} color="#bfdbfe" strokeWidth={2} animationDelay={1000}>
            <span className="text-black dark:text-white">sans compromis.</span>
          </RoughNotation>
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
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-2xl transition duration-1000 group-hover:opacity-30" />
          
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
                  { name: "Système de Tickets", status: "Activé", color: "text-green-500" },
                  { name: "Paiements Stripe", status: "Désactivé", color: "text-muted-foreground" },
                  { name: "Modération IA", status: "Activé", color: "text-green-500" },
                  { name: "Logs Avancés", status: "Activé", color: "text-green-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-dashed p-3">
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase ${item.color}`}>{item.status}</span>
                        <div className={`size-2 rounded-full ${item.status === 'Activé' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-lg bg-muted p-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="text-muted-foreground">{f.description}</p>
              </div>
            </motion.div>
          ))}
          
          <div className="mt-4">
            <Button size="lg" className="group rounded-xl px-8" onClick={() => window.location.href = "/dashboard/bot"}>
              Configurer mon bot personnalisé
              <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
