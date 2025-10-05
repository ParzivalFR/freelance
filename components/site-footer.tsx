"use client";

import {
  DiscordLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiMalt } from "react-icons/si";
import { FaGithub } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Settings {
  fullName?: string;
  bio?: string;
  profileImage?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

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
  const [currentYear, setCurrentYear] = useState("");
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());

    // Charger les paramètres
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Construire dynamiquement les liens sociaux basés sur les paramètres
  const dynamicSocials = [
    settings.twitterUrl && {
      href: settings.twitterUrl,
      name: "Twitter",
      icon: <TwitterLogoIcon className="size-4" />,
    },
    settings.linkedinUrl && {
      href: settings.linkedinUrl,
      name: "LinkedIn",
      icon: <LinkedInLogoIcon className="size-4" />,
    },
    settings.githubUrl && {
      href: settings.githubUrl,
      name: "GitHub",
      icon: <FaGithub className="size-4" />,
    },
  ].filter(Boolean);

  const socialsToDisplay = dynamicSocials.length > 0 ? dynamicSocials : footerSocials;

  return (
    <footer className="footer-border">
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <div className="gap-4 p-4 px-8 py-16 sm:pb-16 md:flex md:justify-between">
          <div className="mb-12 flex flex-col items-center gap-4">
            <Link href="/" className="flex items-center justify-center">
              <Avatar className="size-20">
                <AvatarImage src={settings.profileImage || "/photo-de-profil.jpg"} />
                <AvatarFallback>
                  {settings.fullName
                    ? settings.fullName.split(" ").map(n => n[0]).join("")
                    : "GR"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <p className="w-full max-w-xs self-center text-center text-primary/70">
              {settings.bio || "Partenaire de votre satisfaction."}
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
            {socialsToDisplay.map((social: any) => (
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
            Copyright © {currentYear}{" "}
            <Link href="#" className="font-extrabold">
              {settings.fullName || "Gael RICHARD"}.
            </Link>{" "}
            Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}
