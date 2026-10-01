import ContactSection from "@/components/landing/contact-section";
import ProjectsSection, { BrowserShot } from "@/components/landing/projects-section";
import ReviewsSection from "@/components/landing/reviews-section";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

// Projets et avis sont lus en base à chaque visite : pas de base disponible
// pendant le build Docker, et une modification dans l'admin apparaît tout de suite.
export const dynamic = "force-dynamic";

const services = [
  {
    title: "Un site vitrine",
    text: "Pour présenter votre activité, vos réalisations et recevoir des demandes. En ligne en 2 à 4 semaines.",
    price: "dès 800 €",
  },
  {
    title: "Une landing page",
    text: "Une seule page, claire et efficace, pour vous faire connaître. En ligne en 1 à 2 semaines.",
    price: "dès 350 €",
  },
  {
    title: "Une application web",
    text: "Réservation, paiement, espace client, outil interne. Ce que les sites tout faits ne savent pas faire.",
    price: "sur devis",
  },
  {
    title: "Une application mobile",
    text: "Sur iPhone et Android, comme Fleetly.",
    price: "sur devis",
  },
];

// Position de chaque capture dans l'éventail du héros
const fan = [
  "left-0 top-[4%] w-[74%] -rotate-[5deg]",
  "right-0 top-[30%] w-[66%] rotate-[4deg]",
  "bottom-0 left-[10%] w-[58%] -rotate-2",
];

export default async function Page() {
  const [projects, reviews] = await Promise.all([
    prisma.project.findMany({
      where: { isPublished: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }],
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        url: true,
        label: true,
        category: true,
        featured: true,
      },
    }),
    // Sans imgUrl : certaines photos sont stockées en base64 et pèseraient dans la page.
    prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, role: true, review: true },
    }),
  ]);

  const heroShots = projects.filter((p) => p.image).slice(0, 3);

  return (
    <>
      <section className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-10 px-5 pb-14 pt-12 md:grid-cols-2 md:gap-16 md:pb-24 md:pt-24">
        <div>
          <p className="mb-5 flex items-center gap-2 text-[15px] text-muted-foreground">
            <span className="size-2 rounded-full bg-[#5e9a76]" />
            Développeur freelance · disponible
          </p>
          <h1 className="text-[clamp(2.3rem,5.2vw,3.9rem)] font-extrabold leading-[1.12]">
            Je fabrique des sites et des applications{" "}
            <span className="hl">qu'on a envie d'utiliser.</span>
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg text-muted-foreground">
            Moi c'est Gaël. Je conçois, je développe et je mets en ligne votre
            projet, du premier croquis au dernier détail.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#contact"
              className="rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Parlons de votre projet
            </Link>
            <Link
              href="#realisations"
              className="rounded-full border bg-card px-6 py-3.5 font-semibold transition-transform hover:-translate-y-0.5"
            >
              Voir mes réalisations
            </Link>
            <span className="note note-comment -rotate-2">devis gratuit</span>
          </div>
        </div>

        {heroShots.length > 0 && (
          <div aria-hidden className="relative aspect-[1/0.92] w-full max-w-[520px] md:max-w-none">
            {heroShots.map((p, i) => (
              <div
                key={p.id}
                className={`absolute rounded-2xl bg-card p-2 shadow-[0_22px_50px_-26px_rgba(30,31,36,0.5)] ${fan[i]}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt=""
                  className="block aspect-[16/10] w-full rounded-[10px] object-cover object-top"
                />
              </div>
            ))}
            <span className="note note-comment absolute bottom-[7%] right-0 z-10 -rotate-[5deg]">
              tout est en ligne
            </span>
          </div>
        )}
      </section>

      <ProjectsSection projects={projects} />

      <section id="services" className="scroll-mt-24 pb-16 md:pb-28">
        <div className="mx-auto max-w-[1120px] px-5">
          <h2 className="text-[clamp(1.9rem,4.4vw,3rem)] font-bold leading-[1.08]">
            Ce que je peux faire <span className="hl">pour vous</span>
          </h2>
          <ul className="mt-9 border-t-[1.5px] border-foreground">
            {services.map((s) => (
              <li
                key={s.title}
                className="grid grid-cols-1 items-baseline gap-x-7 gap-y-2 border-b py-6 md:grid-cols-[1.1fr_1.4fr_auto]"
              >
                <h3 className="text-[clamp(1.3rem,2.6vw,1.9rem)] font-bold leading-tight">
                  {s.title}
                </h3>
                <p className="text-muted-foreground">{s.text}</p>
                <span className="note justify-self-start">{s.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="a-propos" className="scroll-mt-24 pb-16 md:pb-28">
        <div className="mx-auto max-w-[1120px] px-5">
          <div className="grid grid-cols-1 items-start gap-6 rounded-[28px] bg-card p-7 sm:grid-cols-[auto_1fr] sm:gap-12 md:p-14">
            <div className="size-24 overflow-hidden rounded-full">
              <Image
                src="/photo-de-profil.jpg"
                alt="Gaël Richard"
                width={192}
                height={192}
                className="size-full origin-[50%_34%] scale-[1.9] object-cover"
              />
            </div>
            <div>
              <h2 className="text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold leading-[1.08]">
                Un développeur, pas une agence.
              </h2>
              <div className="mt-4 grid max-w-[60ch] gap-3.5 text-muted-foreground">
                <p>
                  Quand vous m'écrivez,{" "}
                  <strong className="font-semibold text-foreground">
                    c'est moi qui réponds, et c'est moi qui fabrique.
                  </strong>{" "}
                  Pas d'intermédiaire, pas de jargon.
                </p>
                <p>
                  Vous n'avez pas besoin d'arriver avec une maquette. Je m'occupe
                  du design, du développement, de la mise en ligne et de
                  l'hébergement. Vous validez chaque étape.
                </p>
                <p>Et chaque semestre, j'offre un site à une association.</p>
              </div>
              <span className="note note-comment mt-5">Gaël</span>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection reviews={reviews} />
      <ContactSection />
    </>
  );
}
