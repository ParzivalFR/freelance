"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const faqs = [
  {
    section: "General",
    qa: [
      {
        question: "Qui suis-je ?",
        answer: (
          <span>
            Après 10 années de Boulangerie, j'ai été déclaré inapte suite à une
            allergie aux farines. Je me suis donc immédiatemment reconverti dans
            le Développement Web. J'ai suivi une formation, et me voila prêt à
            vous aider dans vos projets web !
          </span>
        ),
      },
      {
        question: "Comment puis-je demander un devis ?",
        answer: (
          <span>
            Pour demander un devis, il vous suffit de remplir notre formulaire
            de contact. Nous vous répondrons dans les plus brefs délais.
          </span>
        ),
      },
    ],
  },
  {
    section: "Support",
    qa: [
      {
        question: "Comment puis-je obtenir de l'aide ?",
        answer: (
          <span>
            Si vous avez besoin d'aide ou si vous avez des questions, n'hésitez
            pas à me contacter. Je suis là pour vous aider.
          </span>
        ),
      },
    ],
  },
  {
    section: "Paiements",
    qa: [
      {
        question: "Les devis sont-ils gratuits ?",
        answer: (
          <span>
            Oui, les devis sont gratuits et sans engagement. Contactez-moi pour
            obtenir un devis personnalisé pour votre projet.
          </span>
        ),
      },
      {
        question: "Quels modes de paiement acceptez-vous ?",
        answer: (
          <span>
            J'accepte les paiements par Carte Bancaire, Virement Bancaire et
            PayPal. Si vous avez d'autre préférence, on peut en discuter.
          </span>
        ),
      },
      {
        question: "Les paiements en plusieurs fois sont-ils possibles ?",
        answer: (
          <span>
            Je n'ai pas mis en place le système de paiement en plusieurs fois
            mais nous pouvons en discuter ensemble.
          </span>
        ),
      },
      {
        question: "Les paiements sont-ils sécurisés ?",
        answer: (
          <span>
            Oui, les paiements sont sécurisés par Stripe et PayPal. Vos
            informations bancaires sont cryptées et sécurisées.
          </span>
        ),
      },
      {
        question: "Puis-je obtenir une facture pour ma commande ?",
        answer: (
          <span>
            Oui, vous recevrez une facture obligatoirement pour chaque commande
            effectuée sur notre site.
          </span>
        ),
      },
    ],
  },
];

export function FAQ() {
  return (
    <section id="faq">
      <div className="py-14">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
              FAQs
            </h4>
            <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
              Questions fréquentes
            </h2>
            <p className="mt-6 text-xl leading-8 text-black/80 dark:text-white">
              Consultez la FAQ pour trouver les réponses à vos questions les
              plus courantes. Si vous ne trouvez pas ce que vous cherchez,
              n'hésitez pas à me contacter, je vous répondrais dans les
              meilleurs délais.
            </p>
          </div>
          <div className="container mx-auto my-12 max-w-screen-md space-y-12 px-4">
            {faqs.map((faq, idx) => (
              <section key={idx} id={"faq-" + faq.section}>
                <h2 className="mb-4 text-left text-base font-semibold tracking-tight text-muted-foreground">
                  {faq.section}
                </h2>
                <Accordion
                  type="single"
                  collapsible
                  className="flex w-full flex-col items-center justify-center"
                >
                  {faq.qa.map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={faq.question}
                      className="w-full"
                    >
                      <AccordionTrigger className="font-bold text-start">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
          <h4 className="mb-12 text-center text-sm font-medium tracking-tight text-foreground/80">
            Vous avez d'autres questions ?{" "}
            <Link
              href="#contact"
              className="underline text-primary hover:text-primary-dark transition-colors"
            >
              Contactez-moi !
            </Link>
          </h4>
        </div>
      </div>
    </section>
  );
}
