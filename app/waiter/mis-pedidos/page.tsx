"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import Image from "next/image";
import { X, CheckCircle, QrCode, DollarSign, Plus, Minus, Clock, CookingPot, Pencil, Wallet, Package } from "lucide-react";
import DatePicker from "@/components/shared/DatePicker";

type DateFilterType = "today" | "yesterday" | "week" | "date";

interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  category?: string;
  category_slug?: string;
}

const DRINK_CATEGORIES = ["bebidas", "cocteles", "cerveza", "gaseosa", "agua", "vino", "tragos", "licor"];

function isTakeawayExempt(item: OrderItem): boolean {
  const slug = item.category_slug || "";
  const cat = (item.category || "").toLowerCase();
  return DRINK_CATEGORIES.includes(slug) || DRINK_CATEGORIES.some((e) => cat.includes(e));
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function orderMatchesFilter(order: WaiterOrder, filter: DateFilterType, customDate: string): boolean {
  const d = new Date(order.created_at);
  const now = new Date();
  switch (filter) {
    case "today":
      return isSameDay(d, now);
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return isSameDay(d, y);
    }
    case "week": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      return d >= start;
    }
    case "date": {
      if (!customDate) return true;
      const target = new Date(`${customDate}T00:00:00`);
      return isSameDay(d, target);
    }
    default:
      return true;
  }
}

interface WaiterOrder {
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
  customer_name?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "text-yellow-400" },
  confirmed: { label: "En cocina", color: "text-blue-400" },
  preparing: { label: "Preparando", color: "text-amber-400" },
  served: { label: "Listo para servir", color: "text-green-400" },
  cancelled: { label: "Cancelado", color: "text-rose-400" },
};

export default function MisPedidosPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WaiterOrder | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [yapeConfig, setYapeConfig] = useState<{ qr_url: string; name: string } | null>(null);
  const [editItems, setEditItems] = useState<OrderItem[] | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showYapeModal, setShowYapeModal] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterType>("today");
  const [customDate, setCustomDate] = useState("");
  const [view, setView] = useState<"pedidos" | "total">("pedidos");
  const [totalStatus, setTotalStatus] = useState<"total" | "pendientes" | "pagados">("total");

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  useEffect(() => {
    fetch("/api/admin/yape-config")
      .then((r) => r.json())
      .then((res) => setYapeConfig(res.value))
      .catch(() => {});
  }, []);

  async function fetchOrders() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/waiter/orders?waiter_id=${user.uid}`);
      const json = await res.json();
      setOrders(json.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment(orderId: string, method: "efectivo" | "yape") {
    try {
      const res = await fetch(`/api/waiter/orders/${orderId}/payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method: method }),
      });
      if (!res.ok) throw new Error();
      setShowPayment(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      alert("Error al procesar pago");
    }
  }

  async function handleEditStatus(orderId: string, status: string) {
    try {
      const res = await fetch(`/api/waiter/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      alert("Error al actualizar pedido");
    }
  }

  function updateEditItemQuantity(index: number, delta: number) {
    if (!editItems) return;
    setEditItems((prev) => {
      if (!prev) return prev;
      return prev.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      );
    });
  }

  function removeEditItem(index: number) {
    if (!editItems) return;
    setEditItems((prev) => {
      if (!prev) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSaveEdit() {
    if (!selectedOrder || !editItems) return;
    if (editItems.length === 0) return;
    setSavingEdit(true);
    try {
      const subtotal = editItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const takeawayCharge = selectedOrder.order_type === "llevar"
        ? editItems.reduce((s, i) => s + (isTakeawayExempt(i) ? 0 : i.quantity), 0)
        : 0;
      const total = subtotal + takeawayCharge;

      const res = await fetch(`/api/waiter/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: editItems,
          subtotal,
          takeaway_charge: takeawayCharge,
          total,
        }),
      });
      if (!res.ok) throw new Error();
      setEditItems(null);
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      alert("Error al guardar cambios");
    } finally {
      setSavingEdit(false);
    }
  }

  const filteredOrders = useMemo(
    () => orders.filter((o) => orderMatchesFilter(o, dateFilter, customDate)),
    [orders, dateFilter, customDate]
  );
  const filteredPendingOrders = filteredOrders.filter((o) => o.payment_status === "pending" && o.status !== "cancelled");
  const filteredPaidOrders = filteredOrders.filter((o) => o.payment_status === "paid");

  const totalBaseOrders = useMemo(
    () => filteredOrders.filter((o) => o.status !== "cancelled"),
    [filteredOrders]
  );
  const totalCount = totalBaseOrders.length;
  const pendingCount = totalBaseOrders.filter((o) => o.payment_status === "pending").length;
  const paidCount = totalBaseOrders.filter((o) => o.payment_status === "paid").length;

  const statusOrders = useMemo(() => {
    if (totalStatus === "total") return totalBaseOrders;
    return totalBaseOrders.filter((o) => o.payment_status === (totalStatus === "pendientes" ? "pending" : "paid"));
  }, [totalBaseOrders, totalStatus]);

  const productTotals = useMemo(() => {
    const map = new Map<string, { title: string; quantity: number; amount: number }>();
    for (const o of statusOrders) {
      for (const item of o.items) {
        const key = item.product_id || item.title;
        const cur = map.get(key) || { title: item.title, quantity: 0, amount: 0 };
        cur.quantity += item.quantity;
        cur.amount += item.price * item.quantity;
        map.set(key, cur);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [statusOrders]);

  const orderCount = statusOrders.length;
  const productCount = productTotals.reduce((s, p) => s + p.quantity, 0);
  const paidAmount = statusOrders
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + o.total, 0);
  const pendingAmount = statusOrders
    .filter((o) => o.payment_status === "pending")
    .reduce((s, o) => s + o.total, 0);

  function handleDateFilterChange(next: DateFilterType, date?: string) {
    if (next === "date" && date) setCustomDate(date);
    setDateFilter(next);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 xl:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-sm border-b border-stone-800">
        <div className="flex items-center justify-between px-4 h-14 max-w-3xl mx-auto">
          <h1 className="text-sm sm:text-base font-bold">Mis Pedidos</h1>
          <button onClick={fetchOrders} className="text-[10px] sm:text-xs text-amber-400 underline">
            Recargar
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-3">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* View tabs */}
            <div className="flex gap-1.5 mb-4">
              {([
                { id: "pedidos", label: "Pedidos" },
                { id: "total", label: "Total" },
              ] as const).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                    view === v.id
                      ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/25"
                      : "bg-stone-800/80 text-stone-400 hover:text-stone-200 border border-stone-700/50"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <DateFilterBar value={dateFilter} customDate={customDate} onChange={handleDateFilterChange} />

            {view === "pedidos" ? (
              orders.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-stone-500 text-sm sm:text-base">No tienes pedidos aún</p>
                  <p className="text-stone-600 text-[11px] sm:text-sm mt-2">Crea un pedido desde la sección Pedidos</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-stone-500 text-sm sm:text-base">No hay pedidos para este filtro</p>
                  <p className="text-stone-600 text-[11px] sm:text-sm mt-2">Prueba con otro rango de fechas</p>
                </div>
              ) : (
                <>
                  {filteredPendingOrders.length > 0 && (
                    <section className="mb-6">
                      <h2 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-2.5">
                        Pendientes de pago ({filteredPendingOrders.length})
                      </h2>
                      <div className="space-y-2">
                        {filteredPendingOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onClick={() => { setSelectedOrder(order); setShowPayment(true); setEditItems(null); }}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {filteredPaidOrders.length > 0 && (
                    <section>
                      <h2 className="text-xs sm:text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">
                        Completados ({filteredPaidOrders.length})
                      </h2>
                      <div className="space-y-2">
                        {filteredPaidOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onClick={() => { setSelectedOrder(order); setShowPayment(false); setEditItems(null); }}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )
            ) : (
              <>
                {/* Status filter */}
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                  {([
                    { id: "total", label: `Total (${totalCount})` },
                    { id: "pendientes", label: `Pendientes (${pendingCount})` },
                    { id: "pagados", label: `Pagados (${paidCount})` },
                  ] as const).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setTotalStatus(s.id)}
                      className={`flex-shrink-0 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                        totalStatus === s.id
                          ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/25"
                          : "bg-stone-800/80 text-stone-400 hover:text-stone-200 border border-stone-700/50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 sm:p-4">
                    <p className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Package size={11} className="sm:w-4 sm:h-4" /> Pedidos
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-white mt-1.5 tabular-nums">{orderCount}</p>
                  </div>
                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 sm:p-4">
                    <p className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Package size={11} className="sm:w-4 sm:h-4" /> Productos
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-white mt-1.5 tabular-nums">{productCount}</p>
                  </div>
                  <div className="bg-stone-900 border border-emerald-500/20 rounded-xl p-3.5 sm:p-4">
                    <p className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Wallet size={11} className="sm:w-4 sm:h-4" /> Cobrado
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1.5 tabular-nums">S/ {paidAmount.toFixed(2)}</p>
                  </div>
                  <div className="bg-stone-900 border border-amber-500/20 rounded-xl p-3.5 sm:p-4">
                    <p className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Wallet size={11} className="sm:w-4 sm:h-4" /> Pendiente
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1.5 tabular-nums">S/ {pendingAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Product breakdown */}
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Productos</h2>
                  {productTotals.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-stone-500 text-sm sm:text-base">No hay productos para este filtro</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {productTotals.map((p) => (
                        <div key={p.title} className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3">
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate">{p.title}</p>
                            <p className="text-[10px] sm:text-xs text-stone-500 tabular-nums">{p.quantity} {p.quantity === 1 ? "unidad" : "unidades"}</p>
                          </div>
                          <p className="text-sm sm:text-base font-black text-amber-500 tabular-nums">S/ {p.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedOrder(null); setShowPayment(false); setEditItems(null); }} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800 flex-shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold">Detalle del pedido</h3>
                <p className="text-[10px] sm:text-xs text-stone-500">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => { setSelectedOrder(null); setShowPayment(false); setEditItems(null); }} className="p-1 text-stone-400 hover:text-white">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Order info */}
            <div className="px-4 py-3 border-b border-stone-800/50 flex-shrink-0 space-y-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                <span className={STATUS_MAP[selectedOrder.status]?.color || "text-stone-400"}>
                  {STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}
                </span>
                <span className="text-stone-600">•</span>
                <span className="text-stone-400">
                  {selectedOrder.order_type === "mesa"
                    ? `Mesa ${selectedOrder.table_number || "?"}`
                    : "Para llevar"}
                </span>
                {selectedOrder.payment_method && (
                  <>
                    <span className="text-stone-600">•</span>
                    <span className="text-stone-400 capitalize">{selectedOrder.payment_method}</span>
                  </>
                )}
                {(selectedOrder.payment_status === "paid") && (
                  <>
                    <span className="text-stone-600">•</span>
                    <span className="text-green-400">Pagado</span>
                  </>
                )}
              </div>
              {selectedOrder.customer_name && (
                <p className="text-[11px] sm:text-xs text-stone-400">
                  Cliente: {selectedOrder.customer_name}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(editItems || selectedOrder.items).map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-stone-800/50 rounded-xl p-3">
                  {item.image && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                      <Image src={item.image} alt="" fill sizes="40px" className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{item.title}</p>
                    {editItems ? (
                      <div className="flex items-center gap-1 mt-1">
                        <button onClick={() => updateEditItemQuantity(i, -1)} className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center text-stone-300">
                          <Minus size={10} />
                        </button>
                        <span className="w-5 text-center text-[11px] sm:text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateEditItemQuantity(i, 1)} className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-black">
                          <Plus size={10} />
                        </button>
                        <button onClick={() => removeEditItem(i)} className="ml-1 text-[10px] sm:text-xs text-rose-400 underline">quitar</button>
                      </div>
                    ) : (
                      <p className="text-[11px] sm:text-xs text-stone-400">{item.quantity} × S/ {item.price.toFixed(2)}</p>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-amber-500">S/ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-stone-800 p-4 space-y-1 flex-shrink-0">
              <div className="flex justify-between text-xs sm:text-sm text-stone-400">
                <span>Subtotal</span>
                <span>S/ {(editItems || selectedOrder.items).reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
              </div>
              {selectedOrder.takeaway_charge > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-stone-400">
                  <span>Envases</span>
                  <span>S/ {selectedOrder.takeaway_charge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-bold pt-1 border-t border-stone-800/50">
                <span>Total</span>
                <span className="text-amber-500">S/ {selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-stone-800 p-4 space-y-2 flex-shrink-0">
              {selectedOrder.payment_status !== "paid" && selectedOrder.status !== "cancelled" && (
                <>
                  {/* Status indicators (no edit after submission) */}
                  {selectedOrder.status === "confirmed" && (
                    <div className="py-2 px-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <p className="text-xs sm:text-sm text-blue-400 text-center flex items-center justify-center gap-1">
                        <Clock size={14} className="sm:w-4 sm:h-4" /> Enviado a cocina
                      </p>
                    </div>
                  )}

                  {selectedOrder.status === "preparing" && (
                    <div className="py-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-xs sm:text-sm text-amber-400 text-center flex items-center justify-center gap-1">
                        <CookingPot size={14} className="sm:w-4 sm:h-4" /> En preparación
                      </p>
                    </div>
                  )}

                  {selectedOrder.status === "served" && (
                    <div className="py-2 px-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <p className="text-xs sm:text-sm text-green-400 text-center flex items-center justify-center gap-1">
                        <CheckCircle size={14} className="sm:w-4 sm:h-4" /> Listo para servir
                      </p>
                    </div>
                  )}

                  {/* Cancel button (always available if unpaid) */}
                  {selectedOrder.payment_status !== "paid" && selectedOrder.status !== "cancelled" && (
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/${user?.role === "owner" ? "owner" : "waiter"}?edit=${selectedOrder.id}`)} className="flex-1 py-2 sm:py-2.5 bg-amber-600/20 text-amber-400 rounded-xl text-xs sm:text-sm font-medium hover:bg-amber-600/30 transition-colors flex items-center justify-center gap-1">
                        <Pencil size={14} className="sm:w-4 sm:h-4" /> Editar
                      </button>
                      <button onClick={() => handleEditStatus(selectedOrder.id, "cancelled")} className="flex-1 py-2 sm:py-2.5 bg-rose-600/20 text-rose-400 rounded-xl text-xs sm:text-sm font-medium hover:bg-rose-600/30 transition-colors">
                        Cancelar
                      </button>
                    </div>
                  )}

                  {/* Payment section */}
                  {showPayment && selectedOrder.payment_status === "pending" && (
                    <div className="space-y-2 pt-2 border-t border-stone-800/50">
                      <p className="text-[11px] sm:text-xs text-stone-400 text-center">Completar pago</p>
                      <div className="flex gap-2">
                        <button onClick={() => handlePayment(selectedOrder.id, "efectivo")} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                          <DollarSign size={16} className="sm:w-5 sm:h-5" />
                          Efectivo
                        </button>
                        <button
                          onClick={() => setShowYapeModal(true)}
                          className="flex-1 py-3 bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <QrCode size={16} className="sm:w-5 sm:h-5" />
                          Yape
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Paid badge */}
              {selectedOrder.payment_status === "paid" && (
                <div className="flex items-center justify-center gap-2 text-green-400 text-xs sm:text-sm font-medium pt-1">
                  <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                  Pagado
                </div>
              )}

              {selectedOrder.status === "cancelled" && (
                <p className="text-center text-rose-400 text-xs sm:text-sm">Pedido cancelado</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Yape QR Modal */}
      {showYapeModal && selectedOrder && yapeConfig && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowYapeModal(false)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-sm mx-auto overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <h3 className="text-sm font-bold">Pagar con Yape</h3>
              <button onClick={() => setShowYapeModal(false)} className="p-1 text-stone-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div>
                {yapeConfig.qr_url ? (
                  <Image src={yapeConfig.qr_url} alt="QR Yape" width={300} height={300} className="rounded-lg" unoptimized />
                ) : (
                  <div className="w-[300px] h-[300px] bg-stone-200 rounded-lg flex items-center justify-center text-stone-400 text-sm">
                    QR no configurado
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-white mt-4">{yapeConfig.name}</p>
              <p className="text-[11px] text-stone-500 mt-1 text-center">Escanea el código QR con tu app Yape para pagar</p>
            </div>
            <div className="px-6 pb-4 text-center">
              <p className="text-xs text-stone-400">Total a pagar</p>
              <p className="text-2xl font-black text-amber-500">S/ {selectedOrder.total.toFixed(2)}</p>
            </div>
            <div className="flex gap-3 px-4 pb-4">
              <button onClick={() => setShowYapeModal(false)} className="flex-1 py-3 bg-stone-800 text-stone-300 rounded-xl text-sm font-medium">
                Cancelar
              </button>
              <button onClick={() => { setShowYapeModal(false); handlePayment(selectedOrder.id, "yape"); }} className="flex-1 py-3 bg-sky-600 text-white rounded-xl text-sm font-bold">
                Confirmar pago
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function OrderCard({ order, onClick }: { order: WaiterOrder; onClick: () => void }) {
  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: "text-stone-400" };
  const borderColor = order.status === "served" ? "border-green-500/30" : order.status === "cancelled" ? "border-rose-500/20" : "border-stone-800";
  const bgColor = order.status === "served" ? "bg-green-500/5" : order.status === "cancelled" ? "bg-rose-500/5" : "bg-stone-900";

  return (
    <button onClick={onClick} className={`w-full ${bgColor} ${borderColor} border rounded-xl p-3 sm:p-4 text-left hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 group`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-base font-bold tracking-tight">
            {order.order_type === "mesa" ? `Mesa ${order.table_number || "?"}` : "Para llevar"}
          </p>
          <span className={`text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${statusInfo.color} bg-current/5`}>{statusInfo.label}</span>
        </div>
        <p className="text-[10px] sm:text-xs text-stone-500 tabular-nums">
          {new Date(order.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm text-stone-400">
          {order.customer_name ? (
            <><span className="text-stone-300">{order.customer_name}</span> · </>
          ) : null}
          {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
        </p>
        <div className="flex items-center gap-2">
          {order.payment_method && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[11px] font-medium capitalize ${
              order.payment_method === "yape" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
            }`}>
              {order.payment_method === "yape" ? <QrCode size={9} /> : <DollarSign size={9} />}
              {order.payment_method}
            </span>
          )}
          <p className="text-sm sm:text-lg font-black text-amber-500 tabular-nums">S/ {order.total.toFixed(2)}</p>
        </div>
      </div>
      {order.payment_status === "paid" && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-green-500/10 text-green-400 text-[10px] sm:text-xs font-medium">
          <CheckCircle size={10} /> Pagado
        </div>
      )}
    </button>
  );
}

const PRESETS: { key: DateFilterType; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "yesterday", label: "Ayer" },
  { key: "week", label: "Esta semana" },
];

function DateFilterBar({
  value,
  customDate,
  onChange,
}: {
  value: DateFilterType;
  customDate: string;
  onChange: (filter: DateFilterType, date?: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {/* Segmented presets */}
      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-stone-900 border border-stone-800">
        {PRESETS.map((f) => {
          const active = value === f.key;
          return (
            <button
              key={f.key}
              onClick={() => onChange(f.key)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                active
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/25"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Custom date picker */}
      <DatePicker
        value={value === "date" ? customDate : ""}
        onChange={(iso) => onChange("date", iso)}
        placeholder="Elegir fecha"
      />
    </div>
  );
}
