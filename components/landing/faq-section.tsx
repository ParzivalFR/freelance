"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import Link from "next/link";

const faqs = [
  {
    question: "Combien coute un site web ?",
    answer:
      "Ça dépend du projet — une landing page simple commence à 1 200€, une application web complète peut dépasser 5 000€. Je fournis toujours un devis détaillé et gratuit avant de commencer.",
  },
  {
    question: "Quel est le delai de livraison ?",
    answer:
      "Une landing page : 1 à 2 semaines. Un site vitrine complet : 2 à 4 semaines. Une application web sur-mesure : à définir ensemble selon le périmètre. Je respecte les délais convenus.",
  },
  {
    question: "Comment se deroule un projet ?",
    answer:
      "Brief → devis → maquette → développement → révisions → livraison. Tu es impliqué à chaque étape. Je travaille en cycles courts avec des points réguliers pour rester aligné sur ta vision.",
  },
  {
    question: "Puis-je modifier mon site moi-meme ?",
    answer:
      "Oui. Selon tes besoins, j'intègre un CMS (Notion, Sanity, ou autre) pour que tu puisses gérer ton contenu en autonomie totale, sans toucher au code.",
  },
  {
    question: "Proposez-vous de la maintenance ?",
    answer:
      "Oui, chaque formule inclut au moins 1 mois de maintenance offert. Je propose ensuite des forfaits à partir de 20€/mois pour les mises à jour, la sécurité et le support.",
  },
  {
    question: "Les devis sont-ils gratuits ?",
    answer:
      "Totalement gratuits et sans engagement. Contacte-moi avec ton idée, je te réponds sous 24h avec une estimation claire et honnête.",
  },
  {
    question: "Quels modes de paiement acceptez-vous ?",
    answer:
      "Carte bancaire, virement SEPA, PayPal. Pour les projets supérieurs à 1 000€, paiement en 3 fois sans frais disponible.",
  },
  {
    question: "Travaillez-vous avec des associations ?",
    answer:
      "Oui — j'offre 1 site vitrine complet tous les 6 mois à une association à but non lucratif. Contacte-moi pour candidater.",
  },
];

export function FAQ() {
  return (
    <section id="faq">
      <div className="py-14">
        <div className="container mx-auto px-4 md:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-3xl text-center"
          >
            <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
              FAQ
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-foreground">
              Questions frequentes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tout ce que tu veux savoir avant de te lancer.
            </p>
          </motion.div>

          {/* Accordion grid */}
          <div className="mx-auto max-w-5xl grid grid-cols-1 gap-3 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Accordion type="single" collapsible>
                  <AccordionItem
                    value="item"
                    className="rounded-2xl border px-6 transition-colors data-[state=open]:border-[#7158ff]/40"
                  >
                    <AccordionTrigger className="font-[family-name:var(--font-display)] text-sm uppercase leading-snug text-foreground hover:no-underline [&>svg]:text-[#7158ff]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Une question pas dans la liste ?{" "}
            <Link
              href="#contact"
              className="font-semibold text-[#7158ff] underline-offset-4 hover:underline"
            >
              Écris-moi directement.
            </Link>
          </p>

        </div>
      </div>
    </section>
  );
}
