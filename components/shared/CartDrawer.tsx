"use client";
import Image from 'next/image';
import { X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cart';
import { Product } from '@/types';
import { useState, useEffect } from 'react';
import { fetchProducts } from '@/lib/api/ventify';

interface CartDrawerProps {
  visible: boolean;
  onClose: () => void;
  bebidas?: Product[];
}

export const CartDrawer = ({ visible, onClose, bebidas }: CartDrawerProps) => {
  const { items, updateQuantity, addItem } = useCartStore();
  const router = useRouter();
  const [localBebidas, setLocalBebidas] = useState<Product[]>([]);

  useEffect(() => {
    // Si nos llegan bebidas por prop (aunque sea tarde), úsalas
    if (bebidas && bebidas.length > 0) {
      setLocalBebidas(bebidas);
      return;
    }
    // Si no hay prop, cargamos directamente desde la API
    fetchProducts().then(products => {
      const filtered = products.filter(p => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('bebida') || cat.includes('gaseosa') || cat.includes('cerveza');
      });
      setLocalBebidas(filtered);
    });
  }, [bebidas]); // re-ejecuta cada vez que bebidas cambie

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal; // Assuming no taxes for now

  const handleCheckout = () => {
    onClose();
    router.push('/delivery/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {visible && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer - full screen mobile (con espacio para nav inferior), lateral desktop */}
      <div
        className={`fixed z-50 bg-white shadow-2xl transform transition-transform duration-300 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        } inset-0 bottom-16 md:bottom-0 md:inset-auto md:right-0 md:top-0 md:h-full md:w-[420px]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Tu Pedido</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center">Tu carrito está vacío</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-orange-600 font-bold">S/ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center bg-zinc-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold text-zinc-900 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upselling Section */}
          {localBebidas.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">¿Deseas algo de tomar? 🥤</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {localBebidas.map((bebida) => (
                  <div key={bebida.id} className="flex-shrink-0 w-24 snap-start flex flex-col items-center">
                    {/* Imagen con tamaño fijo y posición relative explícita */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden mb-1 bg-stone-100">
                      <Image
                        src={bebida.image || '/logo-que-bravazo.png'}
                        alt={bebida.title || 'Bebida'}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    {/* Nombre con wrap para que no se corte */}
                    <p className="text-xs font-semibold text-gray-800 text-center leading-tight mb-0.5 w-full line-clamp-2">
                      {bebida.title}
                    </p>
                    <p className="text-xs text-orange-600 font-bold mb-1">S/ {bebida.price.toFixed(2)}</p>
                    <button
                      onClick={() => addItem(bebida)}
                      className="w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-700">Subtotal:</span>
                  <span className="text-orange-600 font-bold">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold">
                  <span className="text-zinc-900">Total:</span>
                  <span className="text-orange-600">S/ {total.toFixed(2)}</span>
                </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Ir a Pagar
            </button>
          </div>
        )}
      </div>
    </>
  );
};