"use client";
import { useCartStore } from '@/lib/stores/cart';
import { createOrder } from '@/lib/api/ventify';

interface OrderSummaryProps {
  tableId: string;
}

export const OrderSummary = ({ tableId }: OrderSummaryProps) => {
  const { items, getTotal, clearCart } = useCartStore();

  const handleSendOrder = async () => {
    if (items.length === 0) {
      alert('No hay items en el pedido');
      return;
    }

    const payload = {
      customer: {
        name: `Mesa ${tableId}`,
        phone: '000000000', // Teléfono dummy para mesas
        address: `Mesa ${tableId} - Restaurante`,
      },
      tableNumber: tableId,
      type: 'DINE_IN' as const,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
      })),
      total: getTotal(),
    };

    try {
      await createOrder(payload);
      clearCart();
      alert('Pedido enviado a cocina exitosamente');
    } catch (error) {
      console.error('Error enviando pedido:', error);
      alert('Error al enviar pedido. Intenta de nuevo.');
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg p-4 z-40">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Comanda - Mesa {tableId}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              {item.title} x{item.quantity}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-800">Total: S/ {getTotal().toFixed(2)}</span>
          <button
            onClick={handleSendOrder}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-bold shadow-md transition-colors"
          >
            ENVIAR A COCINA
          </button>
        </div>
      </div>
    </div>
  );
};