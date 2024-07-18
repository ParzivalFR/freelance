"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignJustify,
  CircleHelp,
  Home,
  Mailbox,
  PiggyBank,
  Star,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import Logo from "./logo";
import { ThemeToggle } from "./theme-toggle";

interface MenuItem {
  label: string;
  href: string;
  icon: () => JSX.Element;
}

const menuItem: MenuItem[] = [
  {
    label: "Accueil",
    href: "/",
    icon: () => <Home className="h-5 w-5" />,
  },
  {
    label: "Témoignages",
    href: "#testimonials",
    icon: () => <Star className="h-5 w-5" />,
  },
  {
    label: "Tarifs",
    href: "#pricing",
    icon: () => <PiggyBank className="h-5 w-5" />,
  },
  {
    label: "FAQs",
    href: "#faq",
    icon: () => <CircleHelp className="h-5 w-5" />,
  },
  {
    label: "Contact",
    href: "#contact",
    icon: () => <Mailbox className="h-5 w-5" />,
  },
];

export function SiteHeader() {
  const id = useId();
  const mobilenavbarVariant = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  const mobileLinkVar = {
    initial: {
      y: -20,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false);

  useEffect(() => {
    const html = document.querySelector("html");
    if (html) html.classList.toggle("overflow-hidden", hamburgerMenuIsOpen);
  }, [hamburgerMenuIsOpen]);

  useEffect(() => {
    const closeHamburgerNavigation = () => setHamburgerMenuIsOpen(false);
    window.addEventListener("orientationchange", closeHamburgerNavigation);
    window.addEventListener("resize", closeHamburgerNavigation);

    return () => {
      window.removeEventListener("orientationchange", closeHamburgerNavigation);
      window.removeEventListener("resize", closeHamburgerNavigation);
    };
  }, [setHamburgerMenuIsOpen]);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full translate-y-[-1rem] animate-fade-in border-b opacity-0 backdrop-blur-[12px] [--animation-delay:600ms]">
        <div className="container flex h-[3.5rem] items-center justify-between px-2">
          <Logo size={12} />
          <div className="hidden ml-auto md:flex h-full items-center">
            <Link className="mr-6 text-sm" href="/signin">
              Connexion
            </Link>
            <Link
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "mr-6 text-sm"
              )}
              href="/signup"
            >
              S'inscrire
            </Link>
            <ThemeToggle />
          </div>
          <div className="ml-6 md:hidden flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={() => setHamburgerMenuIsOpen((open) => !open)}
            >
              <span className="sr-only">Toggle menu</span>
              <AlignJustify />
            </Button>
          </div>
        </div>
      </header>

      {/* ANIMATION de FRAMER MOTION */}

      <AnimatePresence>
        <motion.nav
          initial="initial"
          exit="exit"
          variants={mobilenavbarVariant}
          animate={hamburgerMenuIsOpen ? "animate" : "exit"}
          className={cn(
            `fixed left-0 top-0 z-50 h-screen w-full overflow-auto bg-background/70 backdrop-blur-[12px] `,
            {
              "pointer-events-none": !hamburgerMenuIsOpen,
            }
          )}
        >
          <div className="container flex h-[3.5rem] py-10 items-center justify-between px-2">
            <Logo size={12} />
            <Button
              variant="ghost"
              onClick={() => setHamburgerMenuIsOpen((open) => !open)}
            >
              <span className="sr-only">Toggle menu</span>
              <XIcon
                size={36}
                className="transition hover:rotate-180 duration-500"
              />
            </Button>
          </div>
          <motion.ul
            className={`pt-12 pl-4 flex flex-col md:flex-row md:items-center uppercase md:normal-case ease-in`}
            variants={containerVariants}
            initial="initial"
            animate={hamburgerMenuIsOpen ? "animate" : "exit"}
          >
            {menuItem.map((item) => (
              <motion.li
                variants={mobileLinkVar}
                key={id + item.label}
                className="px-6 py-2 md:border-none"
              >
                <Link
                  className={`hover:text-grey flex gap-4 h-[var(--navigation-height)] w-full items-center text-xl transition-[color,transform] duration-500 md:translate-y-0 md:text-sm md:transition-colors hover:bg-secondary/40 rounded-md transtion-colors  ${
                    hamburgerMenuIsOpen ? "[&_a]:translate-y-0" : ""
                  }`}
                  href={item.href}
                  onClick={() => setHamburgerMenuIsOpen(false)}
                >
                  <span className="bg-secondary/60 p-2 rounded-md">
                    {item.icon()}
                  </span>
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </motion.nav>
      </AnimatePresence>
    </>
  );
}
