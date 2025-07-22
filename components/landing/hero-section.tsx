"use client";

import TextShimmer from "@/components/magicui/text-shimmer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";
import TypewriterTerminal from "./typewriter-terminal";

export default function HeroSection() {
  const router = useRouter();

  function handleRedirect() {
    router.push("#contact");
  }

  return (
    <RoughNotationGroup show={true}>
      <section
        id="hero"
        className="relative mx-auto mt-20 max-w-7xl px-6 text-center md:px-8"
      >
        <Badge
          variant="outline"
          className="group -translate-y-4 animate-fade-in cursor-pointer rounded-xl px-4 py-2 opacity-0 transition-all duration-300 [--animation-delay:0ms] hover:bg-primary/10"
        >
          <TextShimmer className="inline-flex items-center justify-center">
            <Sparkles className="mr-1 size-4 animate-pulse text-yellow-400" />
            <span>Votre satisfaction est mon principal objectif</span>
            <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </TextShimmer>
        </Badge>
        <h1 className="-translate-y-4 animate-fade-in text-balance bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent opacity-0 [--animation-delay:200ms] dark:from-white dark:to-white/40 sm:text-6xl md:text-7xl lg:text-8xl">
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
        <p className="mb-12 -translate-y-4 animate-fade-in text-balance text-lg tracking-tight text-gray-400 opacity-0 [--animation-delay:400ms] md:text-xl">
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
          className="-translate-y-4 animate-fade-in gap-1 text-white opacity-0 ring-4 ring-primary/20 duration-300 ease-in-out [--animation-delay:600ms] hover:bg-foreground/70 dark:text-black"
          onClick={handleRedirect}
        >
          Lancer votre projet
          <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
        </Button>
        <div className="relative mt-32 animate-fade-up opacity-0 [--animation-delay:800ms]">
          <TypewriterTerminal />
        </div>
      </section>
    </RoughNotationGroup>
  );
}
