// lib/hooks/useProductActions.ts
import { useCartStore } from '@/lib/stores/cart';
import { useToastStore } from '@/lib/stores/toast';
import { Product, CartItem } from '@/types';

export function useProductActions() {
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  const handleAddToCart = (product: Product, mode: 'delivery' | 'waiter' | 'menu' = 'delivery') => {
    const cartItem: CartItem = {
      ...product,
      quantity: 1,
      notes: '',
    };
    
    addItem(cartItem);

    // Mostrar toast según el modo
    const messages = {
      delivery: `${product.title} agregado al carrito`,
      waiter: `${product.title} agregado a la comanda`,
      menu: `${product.title} agregado`,
    };

    addToast(messages[mode], 'success');
  };

  return {
    handleAddToCart,
  };
}