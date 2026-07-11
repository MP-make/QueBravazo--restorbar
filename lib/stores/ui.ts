import { create } from 'zustand';

interface UIState {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  setIsCartOpen: (open) => set({ isCartOpen: open }),
}));