import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MenuIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DrawerDemo() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  function handleNavigation(href: string) {
    setIsOpen(false);
    setTimeout(() => {
      router.push(href);
    }, 5000);
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger>
        <MenuIcon />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex flex-col items-center justify-center">
          <DrawerTitle>Menu de navigation</DrawerTitle>
          <DrawerDescription>Choisissez où naviguer</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 flex flex-col gap-2 items-center justify-center">
          <a onClick={() => handleNavigation("/")}>Accueil</a>
          <a onClick={() => handleNavigation("#testimonials")}>Témoignages</a>
          <a onClick={() => handleNavigation("#pricing")}>Tarifs</a>
          <a onClick={() => handleNavigation("#faq")}>FAQs</a>
          <a onClick={() => handleNavigation("#contact")}>Contact</a>
        </div>
        <DrawerFooter>
          <DrawerClose>
            <Button>Fermer</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
