import { cn } from "@/lib/utils";
import { useOpenModal } from "@/zustand/state-form-testimonials";
import { X } from "lucide-react";
import { Button } from "../ui/button";

const ModalTest = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, toggleModal } = useOpenModal();

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md",
        {
          hidden: !isOpen,
        }
      )}
      onClick={(e) => e.currentTarget === e.target && toggleModal()}
    >
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-foreground">
          Ajouter un témoignage
        </h3>
        {children}
        <Button
          onClick={() => toggleModal()}
          className="absolute top-8 right-8 text-background"
        >
          <X />
        </Button>
      </div>
    </div>
  );
};

export default ModalTest;
