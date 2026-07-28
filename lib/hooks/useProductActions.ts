// lib/hooks/useProductActions.ts
import { useCartStore } from '@/lib/stores/cart';
import { useToastStore } from '@/lib/stores/toast';
import { Product, CartItem } from '@/types';

const LOCAL_ONLY_KEYWORDS = ['pisco sour'];

export function useProductActions() {
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  const handleAddToCart = (product: Product, mode: 'delivery' | 'waiter' | 'menu' = 'delivery') => {
    const titleLower = product.title.toLowerCase();
    if (mode === 'delivery' && LOCAL_ONLY_KEYWORDS.some((k) => titleLower.includes(k))) {
      addToast(
        { title: 'Solo disponible en local', subtitle: 'Este producto solo puede reclamarse en el establecimiento' },
        'error'
      );
      return;
    }

    const cartItem: CartItem = {
      ...product,
      quantity: 1,
      notes: '',
    };
    
    addItem(cartItem);

    const titles: Record<string, string> = {
      delivery: '¡Añadido al carrito!',
      waiter: '¡Pedido enviado a cocina!',
      menu: '¡Agregado!',
    };
    const subtitles: Record<string, string> = {
      delivery: `1x ${product.title} listo para marchar`,
      waiter: `1x ${product.title} en la comanda`,
      menu: `1x ${product.title}`,
    };

    addToast({ title: titles[mode], subtitle: subtitles[mode] }, 'success');
  };

  return {
    handleAddToCart,
  };
}