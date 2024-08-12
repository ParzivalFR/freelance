"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import TextShimmer from "@/components/magicui/text-shimmer";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useInView } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function HeroSection() {
  const router = useRouter();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  function handleRedirect() {
    router.push("#contact");
  }

  return (
    <section
      id="hero"
      className="relative mx-auto mt-20 max-w-7xl px-6 text-center md:px-8"
    >
      <div className="backdrop-filter-[12px] group inline-flex h-7 -translate-y-4 animate-fade-in items-center justify-between gap-1 rounded-full border border-primary/10 bg-foreground/5 px-3 text-[10px] text-primary opacity-0 transition-all ease-in hover:cursor-pointer hover:bg-primary/20 dark:text-foreground sm:text-xs">
        <TextShimmer className="inline-flex items-center justify-center">
          <Sparkles className="mr-1 size-4 animate-pulse text-yellow-400" />
          <span>Votre satisfaction est mon principal objectif</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </TextShimmer>
      </div>
      <h1 className="-translate-y-4 animate-fade-in text-balance bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent opacity-0 [--animation-delay:200ms] dark:from-white dark:to-white/40 sm:text-6xl md:text-7xl lg:text-8xl">
        Propulsez votre présence sur le web.
      </h1>
      <p className="mb-12 -translate-y-4 animate-fade-in text-balance text-lg tracking-tight text-gray-400 opacity-0 [--animation-delay:400ms] md:text-xl">
        Des solutions sur mesure pour vos projets web,
        <br className="hidden md:block" /> développées avec passion et expertise
        avec une attention particulière pour l'expérience utilisateur.
      </p>
      <Button
        className="-translate-y-4 animate-fade-in gap-1 rounded-lg text-white opacity-0 ring-4 ring-primary/20 duration-300 ease-in-out [--animation-delay:600ms] hover:bg-foreground/70 dark:text-black"
        onClick={handleRedirect}
      >
        <span>Lancer votre projet</span>
        <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
      </Button>
      <div
        ref={ref}
        className="relative mt-32 animate-fade-up opacity-0 [--animation-delay:400ms] [perspective:2000px] after:absolute after:inset-0 after:z-50 after:[background:linear-gradient(to_top,hsl(var(--background))_20%,transparent)]"
      >
        <div
          className={`rounded-xl border border-white/10 bg-white bg-opacity-[0.01] before:absolute before:bottom-1/2 before:left-0 before:top-0 before:size-full before:opacity-0 before:[background-image:linear-gradient(to_bottom,var(--color-one),var(--color-one),transparent_80%)] before:[filter:blur(210px)] ${
            inView ? "before:animate-image-glow" : ""
          }`}
        >
          <BorderBeam
            size={200}
            duration={12}
            delay={11}
            colorFrom="var(--color-one)"
            colorTo="var(--color-two)"
          />

          <Image
            src="/hero-dark.png"
            alt="Hero Image"
            className="relative hidden size-full rounded-[inherit] border object-contain dark:block"
            width={1152}
            height={648}
          />
          <Image
            src="/hero-light.png"
            alt="Hero Image"
            className="relative block size-full rounded-[inherit]  border object-contain dark:hidden"
            width={1152}
            height={648}
          />
        </div>
      </div>
    </section>
  );
}
