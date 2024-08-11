"use client";

import { cn } from "@/lib/utils";
import { MenuItemTypes } from "@/types/MenuItemsTypes";
import { AvatarImage } from "@radix-ui/react-avatar";
import { AvatarIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleHelp,
  ClipboardPen,
  Fingerprint,
  Home,
  Mailbox,
  Menu,
  PiggyBank,
  Star,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button, buttonVariants } from "./ui/button";

const menuItem: MenuItemTypes[] = [
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

export default function SiteNav() {
  return (
    <>
      <NavMobile />
      <NavDesktop />
    </>
  );
}

const NavMobile = () => {
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const toggleMenu = () => setOpenMenu((prev) => !prev);

  return (
    <header className="md:hidden bg-primary fixed z-[500] right-4 top-4 rounded-2xl px-1.5 py-1 flex justify-between space-x-2 items-center">
      <Avatar>
        <AvatarImage className="w-full" src="/photo-de-profil.jpg" />
        <AvatarFallback>
          <AvatarIcon className="h-full w-full text-white" />
        </AvatarFallback>
      </Avatar>
      <Button
        size={"icon"}
        variant={"ghost"}
        className="text-background hover:bg-secondary/20 hover:text-background"
        onClick={toggleMenu}
      >
        <Menu />
      </Button>

      {/* OUVERTURE MENU */}

      <AnimatePresence>
        {openMenu && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-primary/10 backdrop-blur-md"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-40 w-4/5 bg-background h-full p-5 shadow-black/25 shadow-lg"
            >
              {/* Contenu du menu */}
              <div className="flex justify-between items-center mb-5">
                <ThemeToggle align="start" />
                <Button size="icon" variant="ghost" onClick={toggleMenu}>
                  <XIcon />
                </Button>
              </div>
              <div className="flex flex-col items-start mt-10 gap-4">
                {menuItem.map((item, index) => (
                  <Link href={item.href} key={index} className="w-full">
                    <Button
                      className="w-full flex items-center justify-start space-x-2 transition-colors hover:bg-secondary hover:text-primary duration-300 ease-in-out"
                      onClick={toggleMenu}
                    >
                      <span>{item.icon()}</span>
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                ))}
                <div className="w-full flex items-center justify-between gap-4 mt-16">
                  <Button className="w-full">
                    <Fingerprint className="mr-2" />
                    Connexion
                  </Button>
                  <Button className="w-full">
                    <ClipboardPen className="mr-2" />
                    S'inscrire
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

const NavDesktop = () => {
  return (
    <header className="hidden md:flex w-8/12 bg-foreground shadow-pxl shadow-primary/20 mx-auto p-1 mt-4 rounded-xl">
      <nav className="w-full flex items-center justify-between">
        <Link href={"/"}>
          <Avatar className="p-0 m-0">
            <AvatarImage className="w-full" src="/photo-de-profil.jpg" />
            <AvatarFallback>
              <AvatarIcon className="h-full w-full text-white" />
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="hidden md:flex h-full items-center gap-2 mr-2">
          <Link className="text-secondary text-md mr-4" href="/signin">
            Connexion
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "secondary" }), "text-sm")}
            href="/signup"
          >
            S'inscrire
          </Link>
          <ThemeToggle align="end" />
        </div>
      </nav>
    </header>
  );
};
