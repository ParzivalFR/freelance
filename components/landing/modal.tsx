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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md px-4"
          onClick={(e) => e.currentTarget === e.target && toggleModal()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background rounded-lg p-6 w-full max-w-md border border-primary/20"
          >
            <div className="flex flex-col justify-center items-center mb-6">
              <h1 className="text-2xl font-semibold text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground text-center ml-2">
                {subtitle}
              </p>
            </div>
            {children}
          </motion.div>
          <Button
            onClick={() => toggleModal()}
            className="absolute top-8 right-8 text-background"
          >
            <X />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
