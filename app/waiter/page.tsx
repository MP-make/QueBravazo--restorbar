"use client";
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cart';
import { Users, UtensilsCrossed, Clock, ChefHat, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WaiterPage() {
  const router = useRouter();
  const setTable = useCartStore((state) => state.setTable);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [occupiedTables, setOccupiedTables] = useState<number[]>([]);

  // Cargar mesas ocupadas desde localStorage al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('occupiedTables');
      if (saved) {
        setOccupiedTables(JSON.parse(saved));
      } else {
        // Inicializar con algunas mesas ocupadas por defecto
        const initial = [3, 7, 12];
        setOccupiedTables(initial);
        localStorage.setItem('occupiedTables', JSON.stringify(initial));
      }
    }
  }, []);

  const handleTableSelect = (tableId: number) => {
    setSelectedTable(tableId);
    setTable(tableId.toString());
    setTimeout(() => {
      router.push(`/waiter/${tableId}`);
    }, 300);
  };

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      // Limpiar carrito y datos
      useCartStore.getState().clearCart();
      router.push('/');
    }
  };

  // Genera 20 mesas (4 filas de 5)
  const tables = Array.from({ length: 20 }, (_, i) => i + 1);
  const availableTables = tables.filter(t => !occupiedTables.includes(t));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Superior Mejorado */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Meseros</h1>
                <p className="text-sm text-gray-500">Ventify Restaurante</p>
              </div>
            </div>
            
            {/* Stats y botón de cerrar sesión */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
                  <p className="text-xs text-gray-500">Mesas Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{availableTables.length}</p>
                  <p className="text-xs text-gray-500">Disponibles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{occupiedTables.length}</p>
                  <p className="text-xs text-gray-500">Ocupadas</p>
                </div>
              </div>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título de Sección */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-3">
            <Users className="w-4 h-4" />
            Selección de Mesa
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Elige la Mesa del Cliente
          </h2>
          <p className="text-gray-600">
            Haz clic en una mesa para comenzar a tomar el pedido
          </p>
        </div>

        {/* Grid de Mesas - Responsivo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {tables.map((tableId) => {
            const isOccupied = occupiedTables.includes(tableId);
            const isSelected = selectedTable === tableId;

            return (
              <button
                key={tableId}
                onClick={() => handleTableSelect(tableId)}
                className={`
                  group relative aspect-square rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95
                  ${isSelected 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/50 scale-105' 
                    : isOccupied
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 hover:shadow-lg shadow-amber-500/30'
                    : 'bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg'
                  }
                `}
              >
                {/* Icono de Estado */}
                <div className="absolute top-2 right-2">
                  {isOccupied ? (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>

                {/* Contenido de la Mesa */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <UtensilsCrossed className={`
                    w-8 h-8 sm:w-10 sm:h-10 mb-2 transition-colors
                    ${isSelected 
                      ? 'text-white' 
                      : isOccupied 
                      ? 'text-white' 
                      : 'text-gray-400 group-hover:text-blue-500'
                    }
                  `} />
                  
                  <span className={`
                    text-2xl sm:text-3xl font-bold transition-colors
                    ${isSelected 
                      ? 'text-white' 
                      : isOccupied 
                      ? 'text-white' 
                      : 'text-gray-700 group-hover:text-blue-600'
                    }
                  `}>
                    {tableId}
                  </span>
                  
                  <span className={`
                    text-xs font-medium mt-1 transition-colors
                    ${isSelected 
                      ? 'text-blue-100' 
                      : isOccupied 
                      ? 'text-orange-100' 
                      : 'text-gray-500 group-hover:text-blue-500'
                    }
                  `}>
                    {isOccupied ? 'Ocupada' : 'Disponible'}
                  </span>

                  {/* Tiempo si está ocupada */}
                  {isOccupied && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-white/80">
                      <Clock className="w-3 h-3" />
                      <span>25 min</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Seleccionada</span>
          </div>
        </div>
      </div>
    </div>
  );
}