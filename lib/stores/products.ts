import { create } from 'zustand';
import { Product } from '@/types';
import { fetchProducts } from '@/lib/api/ventify';

interface ProductsState {
  products: Product[];
  loading: boolean;
  loaded: boolean;
  init: () => void;
}

export const useProductStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  loaded: false,
  init: () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    fetchProducts()
      .then((data) => set({ products: data, loaded: true, loading: false }))
      .catch(() => set({ loading: false }));
  },
}));
