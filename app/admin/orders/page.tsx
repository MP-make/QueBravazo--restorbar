"use client";

import { useState } from "react";
import { Smartphone, X } from "lucide-react";
import AdminOrders from "@/components/admin/sections/OrdersSection";
import AdminYape from "@/components/admin/sections/YapeSection";

export default function AdminOrdersPage() {
  const [showYape, setShowYape] = useState(false);

  return (
    <div>
      <AdminOrders onOpenYape={() => setShowYape(true)} />

      {showYape && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowYape(false)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-stone-800 sticky top-0 bg-stone-900 z-10">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Smartphone size={18} className="text-sky-400" />
                  Configuración de Yape
                </h2>
                <p className="text-sm text-stone-400 mt-1">
                  Los meseros verán estos datos al cobrar con Yape
                </p>
              </div>
              <button onClick={() => setShowYape(false)} className="text-stone-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <AdminYape />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
