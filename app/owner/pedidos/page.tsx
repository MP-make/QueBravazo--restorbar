"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { X, CheckCircle, QrCode, DollarSign, Search } from "lucide-react";
import DatePicker from "@/components/shared/DatePicker";

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  created_at: string;
  updated_at: string;
  archived: boolean;
  customer_name?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; badge: string }> = {
  pending: { label: "Pendiente", color: "text-yellow-400", badge: "bg-yellow-500/10 text-yellow-400" },
  confirmed: { label: "En cocina", color: "text-blue-400", badge: "bg-blue-500/10 text-blue-400" },
  preparing: { label: "Preparando", color: "text-amber-400", badge: "bg-amber-500/10 text-amber-400" },
  served: { label: "Listo para servir", color: "text-green-400", badge: "bg-green-500/10 text-green-400" },
  cancelled: { label: "Cancelado", color: "text-rose-400", badge: "bg-rose-500/10 text-rose-400" },
};

type Tab = "todos" | "pendientes" | "pagados";

const TABS: { id: Tab; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "pendientes", label: "Pendientes" },
  { id: "pagados", label: "Pagados" },
];

export default function OwnerAllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tab, setTab] = useState<Tab>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(toIso(new Date()));

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/waiter/orders?archived=false");
      const json = await res.json();
      setOrders(json.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const dateFilteredOrders = useMemo(() => {
    const from = new Date(`${fromDate}T00:00:00`);
    return orders.filter((o) => new Date(o.created_at) >= from);
  }, [orders, fromDate]);

  const filtered = dateFilteredOrders.filter((o) => {
    if (o.status === "cancelled") return false;
    if (tab === "pendientes" && o.payment_status !== "pending") return false;
    if (tab === "pagados" && o.payment_status !== "paid") return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.waiter_name.toLowerCase().includes(q) ||
      (o.customer_name || "").toLowerCase().includes(q) ||
      (o.table_number || "").includes(q) ||
      o.items.some((i) => i.title.toLowerCase().includes(q))
    );
  });

  const totalRevenue = dateFilteredOrders
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + o.total, 0);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 xl:pb-0">
      <main className="w-full max-w-5xl mx-auto px-3 py-4">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Todos los pedidos</h1>
            <p className="text-xs text-stone-500 mt-1">
              <span className="font-medium text-stone-300">{dateFilteredOrders.length}</span> pedidos · <span className="font-medium text-amber-500">S/ {totalRevenue.toFixed(2)}</span> cobrado
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por mesero, cliente o producto..."
                className="w-full pl-8 pr-3 py-2.5 bg-stone-800/80 border border-stone-700/80 rounded-xl text-white text-xs placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="flex items-center justify-between gap-2 flex-shrink-0 sm:justify-start">
              <span className="text-[11px] font-semibold text-stone-500">Desde</span>
              <DatePicker value={fromDate} onChange={setFromDate} compact />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const count = t.id === "todos"
              ? dateFilteredOrders.filter((o) => o.status !== "cancelled").length
              : t.id === "pendientes"
                ? dateFilteredOrders.filter((o) => o.status !== "cancelled" && o.payment_status === "pending").length
                : dateFilteredOrders.filter((o) => o.status !== "cancelled" && o.payment_status === "paid").length;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  tab === t.id
                    ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/25"
                    : "bg-stone-800/80 text-stone-400 hover:text-stone-200 border border-stone-700/50"
                }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500 text-sm">No hay pedidos {tab !== "todos" ? TABS.find((t) => t.id === tab)?.label.toLowerCase() : ""}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filtered.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: "text-stone-400", badge: "bg-stone-500/10 text-stone-400" };
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-left hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 ${
                    order.status === "cancelled" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold tracking-tight">
                        {order.order_type === "mesa" ? `Mesa ${order.table_number || "?"}` : "Para llevar"}
                      </p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusInfo.badge}`}>{statusInfo.label}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 tabular-nums">{formatDate(order.created_at)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-400 mb-2">
                    <span>Mesero: <span className="text-stone-300">{order.waiter_name}</span></span>
                    {order.customer_name && (
                      <span>· Cliente: <span className="text-stone-300">{order.customer_name}</span></span>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-500 truncate mb-2">
                    {order.items.map((i) => `${i.quantity}× ${i.title}`).join(", ")}
                  </p>

                  <div className="flex items-center justify-between border-t border-stone-800/60 pt-2">
                    <div className="flex items-center gap-2">
                      {order.payment_method && (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium capitalize ${
                          order.payment_method === "yape" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {order.payment_method === "yape" ? <QrCode size={9} /> : <DollarSign size={9} />}
                          {order.payment_method}
                        </span>
                      )}
                      {order.payment_status === "paid" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-green-400">
                          <CheckCircle size={10} /> Pagado
                        </span>
                      ) : order.status !== "cancelled" ? (
                        <span className="text-[10px] text-yellow-400">Pendiente</span>
                      ) : null}
                    </div>
                    <p className="text-sm font-black text-amber-500 tabular-nums">S/ {order.total.toFixed(2)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-800 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold">
                  {selectedOrder.order_type === "mesa" ? `Mesa ${selectedOrder.table_number || "?"}` : "Para llevar"}
                </h3>
                <p className="text-[10px] text-stone-500">
                  {selectedOrder.waiter_name}
                  {selectedOrder.customer_name ? ` · ${selectedOrder.customer_name}` : ""}
                  {" · "}{formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-stone-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-stone-800/50 flex-shrink-0 flex items-center gap-2 flex-wrap">
              <span className={STATUS_MAP[selectedOrder.status]?.color || "text-stone-400"}>
                {STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}
              </span>
              {selectedOrder.payment_status === "paid" && (
                <>
                  <span className="text-stone-600">•</span>
                  <span className="text-green-400 capitalize">{selectedOrder.payment_method || "pagado"}</span>
                </>
              )}
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
                    <p className="text-xs font-medium truncate">{item.quantity}× {item.title}</p>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
