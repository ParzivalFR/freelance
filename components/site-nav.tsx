"use client";

import { MenuItemTypes } from "@/types/MenuItemsTypes";
import { AvatarImage } from "@radix-ui/react-avatar";
import { AvatarIcon } from "@radix-ui/react-icons";
import {
  CircleHelp,
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
import { Button } from "./ui/button";

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

export default function SiteNav() {
  return (
    <>
      <NavMobile />
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
      <ThemeToggle />
      <Button
        size={"icon"}
        variant={"ghost"}
        className="text-background hover:bg-secondary/20 hover:text-background"
        onClick={toggleMenu}
      >
        <Menu />
      </Button>
      <aside
        className={`fixed inset-0 z-40 bg-opacity-70 ${
          openMenu
            ? "translate-x-0 backdrop-blur-md bg-primary/10"
            : "translate-x-full"
        }`}
      >
        <div
          className={`fixed inset-0 z-40 transform ${
            openMenu ? "-translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out md:hidden bg-opacity-70 flex justify-end`}
        >
          <div className="w-4/5 bg-background h-full p-5 shadow-black/25 shadow-lg">
            <div className="flex justify-end items-center mb-5">
              <Button size="icon" variant="ghost" onClick={toggleMenu}>
                <XIcon />
              </Button>
            </div>
            <ul className="flex flex-col items-start space-y-4 mt-10">
              {menuItem.map((item, index) => (
                <Link href={item.href} key={index} className="w-full">
                  <Button
                    className="w-full flex items-center justify-start space-x-2 hover:text-secondary/60"
                    onClick={toggleMenu}
                  >
                    <span>{item.icon()}</span>
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </aside>
      {/* <AnimatePresence>
        <motion.nav
          initial="initial"
          exit="exit"
          variants={mobilenavbarVariant}
          animate={openMenu ? "animate" : "exit"}
          className={cn(
            `fixed left-0 top-0 z-50 h-screen w-full overflow-auto bg-background/70 backdrop-blur-[12px] `,
            {
              "pointer-events-none": !openMenu,
            }
          )}
        >
          <div className="container flex h-[3.5rem] p-10 items-center justify-end">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              <span className="sr-only">Toggle menu</span>
              <XIcon
                size={36}
                className="transition hover:rotate-180 duration-500"
              />
            </Button>
          </div>
          <motion.ul
            className={`pt-12 flex flex-col md:flex-row md:items-center uppercase md:normal-case ease-in`}
            variants={containerVariants}
            initial="initial"
            animate={openMenu ? "animate" : "exit"}
          >
            {menuItem.map((item, i) => (
              <motion.li
                variants={mobileLinkVar}
                key={i + item.label}
                className="px-6 py-2 md:border-none"
              >
                <Link
                  className={`hover:text-grey flex gap-4 h-[var(--navigation-height)] w-full items-center text-xl transition-[color,transform] duration-500 md:translate-y-0 md:text-sm md:transition-colors hover:bg-secondary/40 rounded-md transtion-colors  ${
                    openMenu ? "[&_a]:translate-y-0" : ""
                  }`}
                  href={item.href}
                  onClick={() => setOpenMenu(false)}
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
      </AnimatePresence> */}
    </header>
  );
};
