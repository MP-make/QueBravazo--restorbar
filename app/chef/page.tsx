"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import Image from "next/image";
import { X, Clock, CheckCircle, CookingPot, ChevronRight, DollarSign, QrCode } from "lucide-react";

interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

interface WaiterOrder {
  id: string;
  waiter_id: string;
  waiter_name: string;
  table_number: string | null;
  order_type: "mesa" | "llevar";
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
  payment_method: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Nuevos",
  confirmed: "Nuevos",
  preparing: "En preparación",
  served: "Listo para servir",
};

const TABS = [
  { key: "new", label: "Nuevos", statuses: ["pending", "confirmed"] },
  { key: "preparing", label: "En preparación", statuses: ["preparing"] },
  { key: "served", label: "Listo para servir", statuses: ["served"] },
];

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `${min} min`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}

export default function ChefPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WaiterOrder | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [activeTab, setActiveTab] = useState("new");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/waiter/orders");
      const json = await res.json();
      const all = (json.data || []) as WaiterOrder[];
      const validStatuses = TABS.flatMap((t) => t.statuses);
      setOrders(all.filter((o) => validStatuses.includes(o.status)));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function handleStatus(orderId: string, status: string) {
    try {
      const res = await fetch(`/api/waiter/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setSelectedOrder(null);
      setSelectedItem(null);
      fetchOrders();
    } catch {
      alert("Error al actualizar");
    }
  }

  const sections = TABS.map((t) => ({
    key: t.key,
    label: t.label,
    items: orders
      .filter((o) => t.statuses.includes(o.status))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
  }));

  const activeSection = sections.find((s) => s.key === activeTab) || sections[0];

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Section tabs */}
      <div className="flex gap-1.5 mb-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => { setActiveTab(s.key); setSelectedItem(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[11px] md:text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === s.key
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-stone-800 text-stone-400"
            }`}
          >
            {s.label}
            {s.items.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] ${
                activeTab === s.key ? "bg-black/20 text-black" : "bg-stone-700 text-stone-400"
              }`}>
                {s.items.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : activeSection.items.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle size={40} className="text-stone-700 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No hay pedidos {activeSection.label.toLowerCase()}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
          {activeSection.items.map((order) => {
            const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <button
                key={order.id}
                onClick={() => { setSelectedOrder(order); setSelectedItem(null); }}
                className="bg-stone-900 border border-stone-800 rounded-xl p-3 md:p-4 text-left active:scale-[0.98] hover:border-amber-500/30 transition-all text-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm md:text-base font-bold truncate">
                      {order.order_type === "mesa" ? `Mesa ${order.table_number || "?"}` : "Para llevar"}
                    </p>
                    <p className="text-[10px] md:text-[11px] text-stone-500 mt-0.5 truncate">{order.waiter_name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] md:text-[11px] text-stone-500 flex-shrink-0 ml-2">
                    <Clock size={10} />
                    {timeSince(order.created_at)}
                  </div>
                </div>

                <div className="space-y-0.5 mb-2 md:mb-3">
                  {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] md:text-xs">
                      <span className="text-amber-400 font-bold w-4 flex-shrink-0">{item.quantity}×</span>
                      <span className="text-stone-300 truncate">{item.title}</span>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <p className="text-[10px] md:text-[11px] text-stone-500">+{order.items.length - 4} más</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] md:text-xs text-stone-500">{totalQty} {totalQty === 1 ? "plato" : "platos"}</span>
                    {order.payment_method && (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium capitalize ${
                        order.payment_method === "yape" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {order.payment_method === "yape" ? <QrCode size={9} /> : <DollarSign size={9} />}
                        {order.payment_method}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] md:text-xs font-bold text-amber-500">S/ {order.total.toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedOrder(null); setSelectedItem(null); }} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold">
                    {selectedOrder.order_type === "mesa" ? `Mesa ${selectedOrder.table_number || "?"}` : "Para llevar"}
                  </h3>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    selectedOrder.status === "pending" || selectedOrder.status === "confirmed" ? "text-blue-400 bg-blue-500/10" :
                    selectedOrder.status === "preparing" ? "text-amber-400 bg-amber-500/10" :
                    "text-green-400 bg-green-500/10"
                  }`}>
                    {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{selectedOrder.waiter_name} — {new Date(selectedOrder.created_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</span>
                  {selectedOrder.payment_method && (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium capitalize ${
                      selectedOrder.payment_method === "yape" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {selectedOrder.payment_method === "yape" ? <QrCode size={9} /> : <DollarSign size={9} />}
                      {selectedOrder.payment_method}
                    </span>
                  )}
                </p>
              </div>
              <button onClick={() => { setSelectedOrder(null); setSelectedItem(null); }} className="p-1 text-stone-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedOrder.items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedItem(selectedItem?.product_id === item.product_id ? null : item)}
                  className={`flex items-center gap-3 bg-stone-800/50 rounded-xl p-3 cursor-pointer transition-all hover:bg-stone-800 ${
                    selectedItem?.product_id === item.product_id ? "ring-2 ring-amber-500/50 bg-stone-800" : ""
                  }`}
                >
                  {item.image && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                      <Image src={item.image} alt="" fill sizes="40px" className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{item.quantity}× {item.title}</p>
                  </div>
                  <ChevronRight size={14} className="text-stone-600 flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* Product description detail */}
            {selectedItem && (
              <div className="border-t border-stone-800/50 bg-stone-900 px-4 py-3 flex-shrink-0">
                <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Descripción</p>
                <p className="text-xs text-stone-300">{selectedItem.description || "Sin descripción"}</p>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-stone-800 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex-shrink-0">
              <div className="flex justify-between text-sm font-bold mb-3">
                <span>Total</span>
                <span className="text-amber-500">S/ {selectedOrder.total.toFixed(2)}</span>
              </div>
              {/* Actions */}
              {(selectedOrder.status === "pending" || selectedOrder.status === "confirmed") && (
                <button onClick={() => handleStatus(selectedOrder.id, "preparing")} className="w-full py-3 bg-amber-500 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <CookingPot size={16} />
                  Empezar preparación
                </button>
              )}
              {selectedOrder.status === "preparing" && (
                <button onClick={() => handleStatus(selectedOrder.id, "served")} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Marcar listo
                </button>
              )}
              {selectedOrder.status === "served" && (
                <p className="text-center text-green-400 text-sm flex items-center justify-center gap-1">
                  <CheckCircle size={16} /> Listo para servir
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
