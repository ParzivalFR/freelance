"use client";

import {
  DiscordLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { SiMalt } from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const footerNavs = [
  {
    label: "Produits",
    items: [
      {
        href: "/#testimonials",
        name: "Témoignages",
      },
      {
        href: "/#pricing",
        name: "Tarifs",
      },
      {
        href: "/#faq",
        name: "FAQ",
      },
    ],
  },

  {
    label: "Contact",
    items: [
      {
        href: "https://discord.com/users/1017721923259613234",
        name: "Discord",
      },
      {
        href: "https://twitter.com/gaelprodev",
        name: "Twitter",
      },
      {
        href: "/#contact",
        name: "Formulaire",
      },
      {
        href: "https://www.linkedin.com/in/ga%C3%ABl-richard-680b8a263/",
        name: "LinkedIn",
      },
      {
        href: "https://www.malt.fr/profile/gaelrichard44",
        name: "Malt",
      },
    ],
  },
  {
    label: "Légal",
    items: [
      {
        href: "/terms",
        name: "Conditions d'utilisation",
      },

      {
        href: "/privacy",
        name: "Mentions légales",
      },
    ],
  },
];

const footerSocials = [
  {
    href: "https://discord.com/users/1017721923259613234",
    name: "Discord",
    icon: <DiscordLogoIcon className="size-4" />,
  },
  {
    href: "https://twitter.com/gaelprodev",
    name: "Twitter",
    icon: <TwitterLogoIcon className="size-4" />,
  },
  {
    href: "https://www.linkedin.com/in/ga%C3%ABl-richard-680b8a263/",
    name: "LinkedIn",
    icon: <LinkedInLogoIcon className="size-4" />,
  },
  {
    href: "https://www.malt.fr/profile/gaelrichard44",
    name: "Malt",
    icon: <SiMalt className="text-4xl" />,
  },
];

export function SiteFooter() {
  return (
    <footer className="footer-border">
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <div className="gap-4 p-4 px-8 py-16 sm:pb-16 md:flex md:justify-between">
          <div className="mb-12 flex flex-col items-center gap-4">
            <Link href="/" className="flex items-center justify-center">
              <Avatar className="size-20">
                <AvatarImage src="/photo-de-profil.jpg" />
                <AvatarFallback>GR</AvatarFallback>
              </Avatar>
            </Link>
            <p className="w-full max-w-xs self-center text-center text-primary/70">
              Partenaire de votre satisfaction.
            </p>
          </div>
          <div className="grid grid-cols-2 place-items-start gap-10 sm:grid-cols-3 sm:place-items-start">
            {footerNavs.map((nav) => (
              <div
                key={nav.label}
                className="flex w-full flex-col items-center gap-1"
              >
                <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-tighter text-primary/80 dark:text-primary">
                  {nav.label}
                </h2>
                <ul className="flex flex-col items-center gap-1 text-center ">
                  {nav.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm font-[450] text-primary/50 duration-200 hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md border-neutral-700/20 p-4 sm:flex sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center justify-center space-x-5 sm:mt-0 sm:justify-start">
            {footerSocials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="fill-gray-500 text-gray-500 hover:fill-gray-900 hover:text-gray-900 dark:hover:fill-gray-600 dark:hover:text-gray-600"
              >
                {social.icon}
                <span className="sr-only">{social.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Copyright © {new Date().getFullYear()}{" "}
            <Link href="#" className="font-extrabold">
              Gael RICHARD.
            </Link>{" "}
            Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}
