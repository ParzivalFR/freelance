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
        href: "#testimonials",
        name: "Témoignages",
      },
      {
        href: "#pricing",
        name: "Tarifs",
      },
      {
        href: "#faq",
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
        href: "/",
        name: "Twitter",
      },
      {
        href: "#contact",
        name: "Formulaire",
      },
      {
        href: "https://www.linkedin.com/in/ga%C3%ABl-richard-680b8a263/",
        name: "LinkedIn",
      },
      {
        href: "",
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
        name: "Politique de confidentialité",
      },
    ],
  },
];

const footerSocials = [
  {
    href: "https://discord.com/users/1017721923259613234",
    name: "Discord",
    icon: <DiscordLogoIcon className="h-4 w-4" />,
  },
  {
    href: "",
    name: "Twitter",
    icon: <TwitterLogoIcon className="h-4 w-4" />,
  },
  {
    href: "https://www.linkedin.com/in/ga%C3%ABl-richard-680b8a263/",
    name: "LinkedIn",
    icon: <LinkedInLogoIcon className="h-4 w-4" />,
  },
  {
    href: "",
    name: "Malt",
    icon: <SiMalt className="text-4xl" />,
  },
];

export function SiteFooter() {
  return (
    <footer className="footer-border">
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <div className="md:flex md:justify-between px-8 p-4 py-16 sm:pb-16 gap-4">
          <div className="mb-12 flex-col items-center flex gap-4">
            <Link href="/" className="flex items-center justify-center">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/photo-de-profil.jpg" />
                <AvatarFallback>GR</AvatarFallback>
              </Avatar>
            </Link>
            <p className="max-w-xs w-full self-center text-center text-primary/70">
              Partenaire de votre satisfaction.
            </p>
          </div>
          <div className="grid grid-cols-2 place-items-start sm:place-items-start gap-10 sm:grid-cols-3">
            {footerNavs.map((nav) => (
              <div
                key={nav.label}
                className="flex flex-col gap-1 items-center w-full"
              >
                <h2 className="mb-4 text-sm text-center tracking-tighter font-medium text-primary/80 uppercase dark:text-primary">
                  {nav.label}
                </h2>
                <ul className="flex flex-col gap-1 items-center text-center ">
                  {nav.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-primary/50 hover:text-primary duration-200 font-[450] text-sm"
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

        <div className="flex flex-col sm:flex-row sm:flex sm:items-center sm:justify-between rounded-md border-neutral-700/20 py-4 px-4 sm:px-8 gap-2">
          <div className="flex space-x-5 items-center justify-center sm:justify-start sm:mt-0">
            {footerSocials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-600 fill-gray-500 hover:fill-gray-900 dark:hover:fill-gray-600"
              >
                {social.icon}
                <span className="sr-only">{social.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 text-center dark:text-gray-400">
            Copyright © {new Date().getFullYear()}{" "}
            <Link href="/" className="cursor-pointer font-extrabold">
              Gael RICHARD.
            </Link>{" "}
            Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}
