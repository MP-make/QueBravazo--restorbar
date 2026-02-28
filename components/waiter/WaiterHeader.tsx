"use client";
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { useState } from 'react';

interface WaiterHeaderProps {
  tableId: string;
}

export const WaiterHeader = ({ tableId }: WaiterHeaderProps) => {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [tableStatus, setTableStatus] = useState<'disponible' | 'ocupada'>('ocupada');

  const handleBack = () => {
    if (items.length > 0) {
      if (confirm('¿Regresar a la selección de mesas? Se perderá la comanda actual.')) {
        clearCart();
        router.push('/waiter');
      }
    } else {
      router.push('/waiter');
    }
  };

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión? Se perderá la comanda actual.')) {
      clearCart();
      router.push('/');
    }
  };

  const toggleTableStatus = () => {
    const newStatus = tableStatus === 'disponible' ? 'ocupada' : 'disponible';
    setTableStatus(newStatus);
    
    // Aquí podrías sincronizar con un backend o localStorage
    if (typeof window !== 'undefined') {
      const occupiedTables = JSON.parse(localStorage.getItem('occupiedTables') || '[]');
      const tableNum = parseInt(tableId);
      
      if (newStatus === 'ocupada') {
        if (!occupiedTables.includes(tableNum)) {
          occupiedTables.push(tableNum);
        }
      } else {
        const index = occupiedTables.indexOf(tableNum);
        if (index > -1) {
          occupiedTables.splice(index, 1);
        }
      }
      
      localStorage.setItem('occupiedTables', JSON.stringify(occupiedTables));
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Lado izquierdo: Botón regresar e info de mesa */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Regresar</span>
          </button>
          
          <div className="h-8 w-px bg-gray-300"></div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Mesa</span>
              <span className="text-lg font-bold text-gray-900">{tableId}</span>
            </div>
            
            {/* Toggle de estado */}
            <button
              onClick={toggleTableStatus}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                tableStatus === 'ocupada'
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {tableStatus === 'ocupada' ? (
                <>
                  <XCircle className="w-3 h-3" />
                  Ocupada
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Disponible
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lado derecho: Info y cerrar sesión */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{items.length}</span>
            <span>productos en comanda</span>
          </div>
          
          <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};