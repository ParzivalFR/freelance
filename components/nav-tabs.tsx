import { MenuItemTypes } from "@/types/MenuItemsTypes";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

interface TabProps {
  item: MenuItemTypes;
  selected: boolean;
  setSelected: (href: string) => void;
}

const Tab = ({ item, selected, setSelected }: TabProps) => {
  return (
    <Link
      href={item.href}
      passHref
      onClick={() => setSelected(item.href)}
      className={`${
        selected
          ? "text-background"
          : "text-foreground/50 hover:text-foreground dark:hover:text-primary/80"
      } relative rounded-md px-2 py-1 text-sm font-medium transition-colors flex items-center gap-2`}
    >
      <span className="relative z-10">{item.icon()}</span>
      <span className="relative z-10">{item.label}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          transition={{ type: "spring", duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-md bg-foreground"
        ></motion.span>
      )}
    </Link>
  );
};

interface TabsProps {
  menuItems: MenuItemTypes[];
}

export const Tabs = ({ menuItems }: TabsProps) => {
  const [selected, setSelected] = useState<string>(menuItems[0].href);
  return (
    <div className="md:flex flex-wrap items-center gap-2 hidden">
      {menuItems.map((item) => (
        <Tab
          item={item}
          selected={selected === item.href}
          setSelected={setSelected}
          key={item.href}
        />
      ))}
    </div>
  );
};
