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
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";

export default function HeroSection() {
  const router = useRouter();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  function handleRedirect() {
    router.push("#contact");
  }

  return (
    <RoughNotationGroup show={true}>
      <section
        id="hero"
        className="relative mx-auto mt-20 max-w-7xl px-6 text-center md:px-8"
      >
        <div className="backdrop-filter-[12px] animate-fade-in border-primary/10 bg-foreground/5 text-primary hover:bg-primary/20 dark:text-foreground group inline-flex h-7 -translate-y-4 items-center justify-between gap-1 rounded-full border px-3 text-[10px] opacity-0 transition-all ease-in hover:cursor-pointer sm:text-xs">
          <TextShimmer className="inline-flex items-center justify-center">
            <Sparkles className="mr-1 size-4 animate-pulse text-yellow-400" />
            <span>Votre satisfaction est mon principal objectif</span>
            <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </TextShimmer>
        </div>
        <h1 className="animate-fade-in -translate-y-4 text-balance bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent opacity-0 [--animation-delay:200ms] sm:text-6xl md:text-7xl lg:text-8xl dark:from-white dark:to-white/40">
          <RoughNotation
            order={1}
            type="circle"
            color="gray"
            animationDelay={1000}
          >
            Propulsez
          </RoughNotation>{" "}
          votre présence sur le web.
        </h1>
        <p className="animate-fade-in mb-12 -translate-y-4 text-balance text-lg tracking-tight text-gray-400 opacity-0 [--animation-delay:400ms] md:text-xl">
          Des solutions sur mesure pour vos projets web,
          <br className="hidden md:block" /> développées avec{" "}
          <RoughNotation type="underline" order={2} animationDelay={1000}>
            passion
          </RoughNotation>{" "}
          et{" "}
          <RoughNotation type="underline" order={3}>
            expertise
          </RoughNotation>{" "}
          avec une attention particulière pour l'
          <RoughNotation type="underline" order={4}>
            expérience utilisateur
          </RoughNotation>
          .
        </p>
        <Button
          className="animate-fade-in ring-primary/20 hover:bg-foreground/70 -translate-y-4 gap-1 rounded-lg text-white opacity-0 ring-4 duration-300 ease-in-out [--animation-delay:600ms] dark:text-black"
          onClick={handleRedirect}
        >
          <span>Lancer votre projet</span>
          <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
        </Button>
        <div
          ref={ref}
          className="animate-fade-up relative mt-32 opacity-0 [--animation-delay:400ms] [perspective:2000px] after:absolute after:inset-0 after:z-50 after:[background:linear-gradient(to_top,hsl(var(--background))_10%,transparent)]"
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
              src="https://syuntuolmcrumibzzxrl.supabase.co/storage/v1/object/public/bucket-oasis/Images/kitilib-compress.webp?t=2024-10-31T13%3A06%3A12.606Z"
              alt="Hero Image"
              className="relative hidden size-full rounded-[inherit] border object-contain dark:block"
              width={1152}
              height={648}
            />
            <Image
              src="https://syuntuolmcrumibzzxrl.supabase.co/storage/v1/object/public/bucket-oasis/Images/stagey-compress.webp"
              alt="Hero Image"
              className="relative block size-full rounded-[inherit] border object-contain dark:hidden"
              width={1152}
              height={648}
            />
          </div>
        </div>
      </section>
    </RoughNotationGroup>
  );
}
