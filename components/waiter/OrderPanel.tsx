"use client";
import { useCartStore } from '@/lib/stores/cart';
import { createOrder } from '@/lib/api/ventify';
import { Trash2, Plus, Minus, Send, ShoppingCart, Receipt, Clock } from 'lucide-react';
import { useState } from 'react';

interface OrderPanelProps {
  tableId: string;
}

export const OrderPanel = ({ tableId }: OrderPanelProps) => {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [isSending, setIsSending] = useState(false);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const handleSendOrder = async () => {
    if (items.length === 0) {
      alert('No hay items en la comanda');
      return;
    }

    setIsSending(true);

    const payload = {
      customer: {
        name: `Mesa ${tableId}`,
        phone: '000000000',
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
      total: subtotal,
    };

    try {
      await createOrder(payload);
      clearCart();
      alert('✅ Comanda enviada a cocina exitosamente');
    } catch (error) {
      console.error('Error enviando comanda:', error);
      alert('❌ Error al enviar comanda. Intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 shadow-xl">
      {/* Header - Mesa Info */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Mesa {tableId}</h2>
              <p className="text-xs text-blue-100">Comanda Actual</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <p className="text-xs text-blue-100">Items</p>
              <p className="text-xl font-bold">{itemCount}</p>
            </div>
          </div>
        </div>
        
        {/* Hora */}
        <div className="flex items-center gap-2 text-xs text-blue-100 mt-2">
          <Clock className="w-3 h-3" />
          <span>{new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Lista de Items */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <p className="text-sm font-medium">Comanda vacía</p>
            <p className="text-xs mt-1">Agrega productos del menú</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
              >
                {/* Número de item */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    
                    {item.notes && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        📝 {item.notes}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600">
                        S/ {item.price.toFixed(2)}
                      </span>
                      
                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 bg-green-100 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Subtotal del item */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Subtotal:</span>
                      <span className="text-sm font-bold text-gray-900">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Total y Botón */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 bg-white p-4 shadow-lg">
          {/* Resumen */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Items ({itemCount})</span>
              <span className="text-sm font-medium text-gray-900">
                S/ {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-base font-bold text-gray-900">TOTAL</span>
              <span className="text-2xl font-bold text-blue-600">
                S/ {subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-2">
            <button
              onClick={handleSendOrder}
              disabled={isSending}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  ENVIAR A COCINA
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                if (confirm('¿Seguro que deseas limpiar toda la comanda?')) {
                  clearCart();
                }
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar Todo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};