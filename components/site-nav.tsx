// components/site-nav.tsx
"use client";

import { MenuItemTypes } from "@/types/MenuItemsTypes";
import { AvatarImage } from "@radix-ui/react-avatar";
import { AvatarIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleHelp,
  Fingerprint,
  Home,
  Mailbox,
  Menu,
  PiggyBank,
  Settings,
  Star,
  XIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

const menuItem: MenuItemTypes[] = [
  {
    label: "Accueil",
    href: "/",
    icon: () => <Home className="size-5" />,
  },
  {
    label: "Témoignages",
    href: "/#testimonials",
    icon: () => <Star className="size-5" />,
  },
  {
    label: "Tarifs",
    href: "/#pricing",
    icon: () => <PiggyBank className="size-5" />,
  },
  {
    label: "FAQs",
    href: "/#faq",
    icon: () => <CircleHelp className="size-5" />,
  },
  {
    label: "Contact",
    href: "/#contact",
    icon: () => <Mailbox className="size-5" />,
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
  const { data: session } = useSession();

  return (
    <header className="fixed right-4 top-4 z-[500] flex items-center justify-between space-x-2 rounded-2xl bg-primary px-1.5 py-1 md:hidden">
      <Avatar>
        <AvatarImage className="w-full" src="/photo-de-profil.jpg" />
        <AvatarFallback>
          <AvatarIcon className="size-full text-white" />
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
              className="shadow-lg fixed inset-y-0 right-0 z-40 h-full w-4/5 bg-background p-5 shadow-black/25"
            >
              <div className="mb-5 flex items-center justify-between">
                <ThemeToggle align="start" />
                <Button size="icon" variant="ghost" onClick={toggleMenu}>
                  <XIcon />
                </Button>
              </div>
              <div className="mt-10 flex flex-col items-start gap-4">
                {menuItem.map((item, index) => (
                  <Link href={item.href} key={index} className="w-full">
                    <Button
                      variant="ghost"
                      className="flex w-full items-center justify-start space-x-2 transition-colors duration-300 ease-in-out hover:bg-secondary hover:text-primary"
                      onClick={toggleMenu}
                    >
                      <span>{item.icon()}</span>
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                ))}
                <div className="mt-16 flex w-full items-center justify-between gap-4">
                  {session ? (
                    <Link href="/admin" className="w-full">
                      <Button className="w-full" onClick={toggleMenu}>
                        <Settings className="mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/signin" className="w-full">
                      <Button className="w-full" onClick={toggleMenu}>
                        <Fingerprint className="mr-2" />
                        Connexion
                      </Button>
                    </Link>
                  )}
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
  const { data: session } = useSession();

  return (
    <header className="mx-auto mt-4 hidden w-8/12 rounded-xl bg-foreground p-1 shadow-pxl shadow-primary/20 md:flex">
      <nav className="flex w-full items-center justify-between">
        <Link href={"/"}>
          <Avatar className="m-0 p-0">
            <AvatarImage className="w-full" src="/photo-de-profil.jpg" />
            <AvatarFallback>
              <AvatarIcon className="size-full text-white" />
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="mr-2 hidden h-full items-center gap-2 md:flex">
          {session ? (
            <Link href="/admin">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          ) : (
            <Link href="/signin">
              <Button variant="secondary">Connexion</Button>
            </Link>
          )}
          <ThemeToggle align="end" />
        </div>
      </nav>
    </header>
  );
};
