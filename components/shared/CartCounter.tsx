"use client";
import { useCartStore } from '@/lib/stores/cart';

interface CartCounterProps {
  onClick?: () => void;
}

export const CartCounter = ({ onClick }: CartCounterProps) => {
  const itemCount = useCartStore((state) => state.getItemCount());

  if (itemCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold shadow-lg z-50 hover:bg-orange-600 transition-colors"
    >
      {itemCount}
    </button>
  );
};