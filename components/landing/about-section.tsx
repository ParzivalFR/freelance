"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CodeIcon, HeartIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const techStack = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "Prisma",
  "Supabase",
];

export default function AboutSection() {
  const router = useRouter();

  return (
    <section id="about" className="py-14">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
              À propos
            </h4>
            <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
              Une reconversion, une passion
            </h2>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative mx-auto size-80 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                <Image
                  src="/photo-de-profil.jpg"
                  alt="Gael Richard - Développeur Freelance"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-primary">
                <HeartIcon className="size-5" />
                <span className="font-semibold">Une histoire de passion</span>
              </div>

              <div className="space-y-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                <p>
                  Après <strong>10 années passionnées</strong> dans la
                  boulangerie, une allergie aux farines m'a contraint à repenser
                  ma carrière. Mais cette épreuve s'est transformée en
                  opportunité !
                </p>

                <p>
                  Passionné d'informatique depuis toujours, j'ai saisi cette
                  chance pour me reconvertir dans le{" "}
                  <strong>développement web</strong>. Cette transition m'a
                  apporté une approche unique : la même rigueur et le même souci
                  du détail qu'en boulangerie, appliqués au code.
                </p>

                <p>
                  Je me spécialise dans la création de{" "}
                  <strong>sites vitrines</strong> et d'
                  <strong>applications web simples</strong> avec React et
                  Next.js. L'IA m'accompagne quotidiennement pour optimiser mon
                  travail et rester à la pointe des dernières technologies.
                </p>
              </div>

              {/* Tech Stack */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <CodeIcon className="size-5" />
                  <span className="font-semibold">Technologies favorites</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="border-primary/20 bg-primary/10 px-3 py-1 text-primary"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button
                  onClick={() => router.push("#contact")}
                  className="group inline-flex items-center gap-2 px-6 py-3 ring-4 ring-primary/20 transition-all duration-300 hover:bg-foreground/70"
                >
                  <span>Parlons de votre projet</span>
                  <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
