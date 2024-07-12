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
        question: "Qu'est que OASIS ?",
        answer: (
          <span>
            OASIS est une agence de développement web qui propose des solutions
            sur mesure pour vos projets web, développées avec passion et
            expertise avec une attention particulière pour l'expérience
            utilisateur.
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
        question: "Comment puis-je obtenir de l'aide avec OASIS ?",
        answer: (
          <span>
            Si vous avez besoin d'aide ou si vous avez des questions, n'hésitez
            pas à nous contacter. Notre équipe est là pour vous aider.
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
            Oui, les devis sont gratuits et sans engagement. Contactez-nous pour
            obtenir un devis personnalisé pour votre projet.
          </span>
        ),
      },
      {
        question: "Quels modes de paiement acceptez-vous ?",
        answer: (
          <span>
            Nous acceptons les paiements par carte de crédit et PayPal.
          </span>
        ),
      },
      {
        question: "Les paiements en plusieurs fois sont-ils possibles ?",
        answer: (
          <span>
            Oui, nous proposons des paiements en plusieurs fois pour les projets
            importants. Contactez-nous pour en savoir plus.
          </span>
        ),
      },
      {
        question: "Les paiements sont-ils sécurisés ?",
        answer: (
          <span>
            Oui, tous les paiements effectués sur notre site sont sécurisés
            grâce à notre partenaire Stripe.
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
              Consultez notre FAQ pour trouver les réponses à vos questions les
              plus courantes sur OASIS. Si vous ne trouvez pas ce que vous
              cherchez, n'hésitez pas à nous contacter.
            </p>
          </div>
          <div className="container mx-auto my-12 max-w-[600px] space-y-12">
            {faqs.map((faq, idx) => (
              <section key={idx} id={"faq-" + faq.section}>
                <h2 className="mb-4 text-left text-base font-semibold tracking-tight text-foreground/60">
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
                      className="w-full max-w-[600px]"
                    >
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
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
              Contactez-nous !
            </Link>
          </h4>
        </div>
      </div>
    </section>
  );
}
