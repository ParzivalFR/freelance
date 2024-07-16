import { Button } from "@/components/ui/button";
import { AlignJustify, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "./ui/badge";

interface MenuItem {
  id: number;
  label: string;
  href: string;
}

interface BottomDrawerProps {
  menuItems: MenuItem[];
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({ menuItems }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const drawerContent = (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleDrawer}
      />
      <div
        className={`fixed  border border-foreground/70 left-0 right-0 -bottom-4 bg-background z-50 transition-transform duration-300 ease-in-out transform ${
          isOpen ? "-translate-y-4" : "translate-y-full"
        }`}
        style={{
          maxHeight: "80svh",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        <div className="p-4">
          <div className="relative flex justify-end items-center mb-4">
            <Badge
              color="primary"
              className="absolute -top-6 right-1/2 translate-x-1/2 px-6 text-base uppercase font-black"
            >
              MENU
            </Badge>
            <Button variant="ghost" onClick={toggleDrawer}>
              <X />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                className="w-full justify-start"
                variant="ghost"
                onClick={() => handleLinkClick(item.href)}
              >
                <span className="hover:text-grey uppercase font-black">
                  {item.label}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Button variant="ghost" onClick={toggleDrawer}>
        <AlignJustify />
      </Button>
      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
};

export default BottomDrawer;
