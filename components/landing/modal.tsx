import { useOpenModal } from "@/zustand/state-form-testimonials";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface ModalProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const Modal = ({ title, subtitle, children }: ModalProps) => {
  const { isOpen, toggleModal } = useOpenModal();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
          onClick={(e) => e.currentTarget === e.target && toggleModal()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-lg border border-primary/20 bg-background p-6"
          >
            <div className="mb-6 flex flex-col items-center justify-center">
              <h1 className="text-2xl font-semibold text-foreground">
                {title}
              </h1>
              <p className="ml-2 text-center text-sm text-muted-foreground">
                {subtitle}
              </p>
            </div>
            {children}
          </motion.div>
          <Button
            onClick={() => toggleModal()}
            className="absolute right-8 top-8 text-background"
          >
            <X />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
