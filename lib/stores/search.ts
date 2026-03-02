import { create } from 'zustand';
import { Product } from '@/types';

interface SearchState {
  query: string;
  results: Product[];
  allProducts: Product[];
  isOpen: boolean;
  setQuery: (query: string) => void;
  setAllProducts: (products: Product[]) => void;
  setIsOpen: (open: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  allProducts: [],
  isOpen: false,
  setQuery: (query) => {
    const { allProducts } = get();
    const results = query.trim().length >= 1
      ? allProducts.filter((p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          (p.description || '').toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8)
      : [];
    set({ query, results });
  },
  setAllProducts: (products) => set({ allProducts: products }),
  setIsOpen: (isOpen) => set({ isOpen }),
  clearSearch: () => set({ query: '', results: [], isOpen: false }),
}));