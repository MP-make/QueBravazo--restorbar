"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import Image from "next/image";
import { X, CheckCircle, Archive, DollarSign, QrCode, Search, Filter } from "lucide-react";

interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  waiter_id: string;
  waiter_name: string;
  table_number: string | null;
  order_type: "mesa" | "llevar";
  items: OrderItem[];
  subtotal: number;
  takeaway_charge: number;
  total: number;
  status: string;
  payment_method: string | null;
  payment_status: string;
  archived: boolean;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?paid=true&archived=${showArchived}`);
      const json = await res.json();
      setOrders(json.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function handleArchive(orderId: string) {
    try {
      const res = await fetch(`/api/waiter/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      if (!res.ok) throw new Error();
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      alert("Error al archivar");
    }
  }

  async function handleUnarchive(orderId: string) {
    try {
      const res = await fetch(`/api/waiter/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      });
      if (!res.ok) throw new Error();
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      alert("Error al restaurar");
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const filtered = orders.filter((o) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.waiter_name.toLowerCase().includes(q) ||
      (o.table_number || "").includes(q) ||
      o.items.some((i) => i.title.toLowerCase().includes(q))
    );
  });

  const totalPaid = filtered.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-bold text-white">Pedidos pagados</h1>
          <p className="text-sm text-stone-400">{filtered.length} pedidos · S/ {totalPaid.toFixed(2)} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full sm:w-48 pl-8 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              showArchived ? "bg-stone-700 text-white" : "bg-stone-800 text-stone-400"
            }`}
          >
            <Archive size={14} />
            {showArchived ? "Archivados" : "Activos"}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-500 text-sm">No hay pedidos {showArchived ? "archivados" : "pagados"}</p>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left px-4 py-3 text-[10px] text-stone-500 uppercase tracking-wider font-medium">Mesa</th>
                  <th className="text-left px-4 py-3 text-[10px] text-stone-500 uppercase tracking-wider font-medium">Mesero</th>
                  <th className="text-left px-4 py-3 text-[10px] text-stone-500 uppercase tracking-wider font-medium hidden sm:table-cell">Productos</th>
                  <th className="text-left px-4 py-3 text-[10px] text-stone-500 uppercase tracking-wider font-medium">Monto</th>
                  <th className="text-left px-4 py-3 text-[10px] text-stone-500 uppercase tracking-wider font-medium hidden md:table-cell">Pago</th>
                  <th className="text-left px-4 py-3 text-[10px] text-stone-500 uppercase tracking-wider font-medium hidden md:table-cell">Fecha</th>
                  <th className="text-right px-4 py-3 text-[10px] text-stone-500 uppercase tracking-wider font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">
                        {order.order_type === "mesa" ? `Mesa ${order.table_number || "?"}` : "Llevar"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-400">{order.waiter_name}</td>
                    <td className="px-4 py-3 text-stone-400 hidden sm:table-cell">
                      {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-amber-500 font-bold">S/ {order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {order.payment_method && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize bg-emerald-500/10 text-emerald-400">
                          {order.payment_method === "yape" ? <QrCode size={10} /> : <DollarSign size={10} />}
                          {order.payment_method}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-[11px] hidden md:table-cell">
                      {new Date(order.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {order.archived ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUnarchive(order.id); }}
                          className="text-[11px] text-stone-500 hover:text-white underline"
                        >
                          Restaurar
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleArchive(order.id); }}
                          className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                        >
                          Archivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-800 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold">
                  {selectedOrder.order_type === "mesa" ? `Mesa ${selectedOrder.table_number || "?"}` : "Para llevar"}
                </h3>
                <p className="text-[10px] text-stone-500">{selectedOrder.waiter_name} · {formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-stone-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-stone-800/50 rounded-xl p-3">
                  {item.image && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                      <Image src={item.image} alt="" fill sizes="40px" className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{item.quantity}× {item.title}</p>
                    <p className="text-[11px] text-stone-400">S/ {item.price.toFixed(2)} c/u</p>
                  </div>
                  <p className="text-xs font-bold text-amber-500">S/ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-800 p-4 space-y-1 flex-shrink-0">
              <div className="flex justify-between text-xs text-stone-400">
                <span>Subtotal</span>
                <span>S/ {selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              {selectedOrder.takeaway_charge > 0 && (
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Envases</span>
                  <span>S/ {selectedOrder.takeaway_charge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-stone-800/50">
                <span>Total</span>
                <span className="text-amber-500">S/ {selectedOrder.total.toFixed(2)}</span>
              </div>
              {selectedOrder.payment_method && (
                <div className="flex items-center gap-2 text-xs text-green-400 pt-2">
                  <CheckCircle size={12} />
                  Pagado con {selectedOrder.payment_method === "yape" ? "Yape" : "Efectivo"}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {selectedOrder.archived ? (
                  <button onClick={() => { handleUnarchive(selectedOrder.id); }} className="flex-1 py-2.5 bg-stone-700 text-white rounded-xl text-xs font-medium">
                    Restaurar pedido
                  </button>
                ) : (
                  <button onClick={() => { handleArchive(selectedOrder.id); setSelectedOrder(null); }} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                    <Archive size={14} />
                    Archivar pedido
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
