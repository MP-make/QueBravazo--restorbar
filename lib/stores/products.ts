import { create } from 'zustand';
import { Product } from '@/types';
import { fetchProducts } from '@/lib/api/ventify';

interface ProductsState {
  products: Product[];
  loading: boolean;
  loaded: boolean;
  init: () => void;
  refresh: () => void;
}

async function doFetch(set: any) {
  set({ loading: true });
  try {
    const data = await fetchProducts();
    set({ products: data, loaded: true, loading: false });
  } catch {
    set({ loading: false });
  }
}

export const useProductStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  loaded: false,
  init: () => {
    if (get().loaded || get().loading) return;
    doFetch(set);
  },
  refresh: () => {
    if (get().loading) return;
    doFetch(set);
  },
}));
