"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { Code2, MessageCircle, Target, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const techStack = [
  { label: "Next.js", category: "web" },
  { label: "React", category: "web" },
  { label: "TypeScript", category: "web" },
  { label: "Tailwind CSS", category: "web" },
  { label: "Node.js", category: "web" },
  { label: "Prisma", category: "web" },
  { label: "Supabase", category: "web" },
  { label: "PostgreSQL", category: "web" },
  { label: "Electron", category: "desktop" },
  { label: "Expo", category: "mobile" },
  { label: "React Native", category: "mobile" },
];

const values = [
  { icon: Zap, label: "Livraison rapide" },
  { icon: Target, label: "Sur-mesure" },
  { icon: Code2, label: "Code propre" },
  { icon: MessageCircle, label: "Dispo & réactif" },
];

export default function AboutSection() {
  const router = useRouter();

  return (
    <section id="about" className="py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">

        {/* Header */}
        <div className="mb-14 text-center">
          <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
            À propos de moi
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-foreground">
            Un dev freelance,{" "}
            <span className="text-[#7158ff]">pas une agence.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-start">

          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="space-y-5 text-lg leading-relaxed text-muted-foreground"
          >
            <p>
              Passionné d'informatique depuis toujours, je me suis lancé dans
              le développement web il y a{" "}
              <strong className="text-foreground">3 ans</strong>.
              Depuis, j'ai travaillé sur des dizaines de projets — sites vitrines,
              applications web, outils internes, logiciels desktop et apps mobiles.
            </p>
            <p>
              Ma stack principale c'est{" "}
              <strong className="text-foreground">Next.js + Tailwind CSS</strong>,
              mais je peux aussi livrer un logiciel desktop avec{" "}
              <strong className="text-foreground">Electron</strong> ou une app mobile avec{" "}
              <strong className="text-foreground">Expo</strong> selon ton besoin.
            </p>
            <p>
              Ce que je ne fais pas :{" "}
              <strong className="text-foreground">le design</strong>. Je code ce que tu imagines — si tu n'as pas de maquette, on peut trouver un designer ensemble.
            </p>

            <div className="pt-2">
              <Button
                onClick={() => router.push("#contact")}
                className="group inline-flex items-center gap-2 ring-4 ring-[#7158ff]/20"
              >
                Parlons de votre projet
                <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>

          {/* Valeurs + stack */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 gap-3">
              {values.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3"
                >
                  <Icon className="size-4 shrink-0 text-[#7158ff]" />
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-widest text-[#7158ff]">
                Stack technique
              </p>
              {[
                { cat: "web", label: "Web" },
                { cat: "desktop", label: "Desktop" },
                { cat: "mobile", label: "Mobile" },
              ].map(({ cat, label }) => (
                <div key={cat} className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 w-14 shrink-0">
                    {label}
                  </span>
                  {techStack.filter(t => t.category === cat).map((tech) => (
                    <span
                      key={tech.label}
                      className="rounded-full border border-[#7158ff]/25 bg-[#7158ff]/10 px-3 py-1 font-mono text-xs text-[#7158ff]"
                    >
                      {tech.label}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
