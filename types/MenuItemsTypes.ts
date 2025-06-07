import type { JSX } from "react";
export interface MenuItemTypes {
  label: string;
  href: string;
  icon: () => JSX.Element;
}
