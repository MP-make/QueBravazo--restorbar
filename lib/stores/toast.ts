import { create } from 'zustand';

interface Toast {
  id: string;
  title: string;
  subtitle?: string;
  type: 'success' | 'error';
}

interface ToastState {
  toasts: Toast[];
  addToast: (input: string | { title: string; subtitle?: string }, type?: 'success' | 'error') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (input, type = 'success') => {
    const id = Date.now().toString();
    const title = typeof input === 'string' ? input : input.title;
    const subtitle = typeof input === 'string' ? undefined : input.subtitle;
    set((state) => ({
      toasts: [...state.toasts, { id, title, subtitle, type }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3200);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
