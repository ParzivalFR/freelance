import { create } from "zustand";

interface OpenModal {
  isOpen: Boolean;
  toggleModal: () => void;
}

export const useOpenModal = create<OpenModal>((set) => ({
  isOpen: false,
  toggleModal: () => set((state) => ({ isOpen: !state.isOpen })),
}));
