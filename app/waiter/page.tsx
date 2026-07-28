"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/auth";
import { useProductStore } from "@/lib/stores/products";
import { Product } from "@/types";
import { Plus, Minus, X, ShoppingBag, LogOut, ChevronLeft, CheckCircle } from "lucide-react";

interface CategoryInfo {
  name: string;
  slug: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const EXEMPT_CATEGORIES = ["caldos", "hamburguesa"];

function isTakeawayExempt(product: Product): boolean {
  const slug = product.category_slug || "";
  const cat = (product.category || "").toLowerCase();
  return EXEMPT_CATEGORIES.includes(slug) || EXEMPT_CATEGORIES.some((e) => cat.includes(e));
}

export default function WaiterPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, isHydrated } = useAuthStore();
  const products = useProductStore((s) => s.products);
  const initProducts = useProductStore((s) => s.init);

  const [orderType, setOrderType] = useState<"mesa" | "llevar" | null>(null);
  const [tableNumber, setTableNumber] = useState("1");
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [scheduleError, setScheduleError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "staff" && user.role !== "admin") {
      router.replace("/");
      return;
    }

    initProducts();

    fetch("/api/schedules/active")
      .then((r) => r.json())
      .then(async (sched) => {
        if (!sched.active_types || sched.active_types.length === 0) {
          setScheduleError(true);
          return;
        }
        const results = await Promise.all(
          sched.active_types.map((type: string) =>
            fetch(`/api/categories?menu_type=${type}`).then((r) => r.json())
          )
        );
        const seen = new Set<string>();
        const merged: CategoryInfo[] = [];
        for (const r of results) {
          for (const c of r.data || []) {
            if (!seen.has(c.slug)) {
              seen.add(c.slug);
              merged.push({ name: c.name, slug: c.slug });
            }
          }
        }
        setCategories(merged);
        if (merged.length > 0) setActiveCategory(merged[0].slug);
      })
      .catch(() => setScheduleError(true));

    fetch("/api/waiter/orders?waiter_id=" + user.uid)
      .then((r) => r.json())
      .then((res) => {
        const orders = res.data || [];
        const mesaNumbers = orders
          .filter((o: any) => o.table_number)
          .map((o: any) => parseInt(o.table_number, 10))
          .filter((n: number) => !isNaN(n));
        const max = mesaNumbers.length > 0 ? Math.max(...mesaNumbers) : 0;
        setTableNumber(String(max + 1));
      })
      .catch(() => {});
  }, [isHydrated, isLoggedIn, user, router, initProducts]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const { slug } of categories) map.set(slug, []);
    for (const p of products) {
      const slug = p.category_slug || "";
      if (map.has(slug)) map.get(slug)!.push(p);
    }
    return map;
  }, [categories, products]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => (categoryMap.get(c.slug)?.length ?? 0) > 0),
    [categories, categoryMap]
  );

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.product.id === productId ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c
        )
        .filter((c) => c.quantity > 0)
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  }

  function clearCart() {
    setCart([]);
    setOrderType(null);
    setTableNumber("");
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  async function handleSubmitOrder() {
    if (!orderType) return;
    if (cart.length === 0) return;
    if (!user) return;

    setSubmitting(true);
    try {
      const items = cart.map((c) => ({
        product_id: c.product.id,
        title: c.product.title,
        price: c.product.price,
        quantity: c.quantity,
        image: c.product.image || "",
        description: c.product.description || "",
      }));

      const subtotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
      const takeawayCharge = orderType === "llevar"
        ? cart.reduce((sum, c) => sum + (isTakeawayExempt(c.product) ? 0 : c.quantity), 0)
        : 0;
      const total = subtotal + takeawayCharge;

      const res = await fetch("/api/waiter/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waiter_id: user.uid,
          waiter_name: user.name,
          table_number: orderType === "mesa" ? tableNumber.trim() : null,
          order_type: orderType,
          items,
          subtotal,
          takeaway_charge: takeawayCharge,
          total,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(errData.error || "Error al crear pedido");
      }

      setSuccess(true);
      clearCart();
      setShowCart(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error creando pedido:", err);
      alert("Error al enviar pedido: " + (err.message || "Intenta de nuevo."));
    } finally {
      setSubmitting(false);
    }
  }

  const productCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const takeawayCharge = orderType === "llevar"
    ? cart.reduce((sum, c) => sum + (isTakeawayExempt(c.product) ? 0 : c.quantity), 0)
    : 0;
  const subtotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
  const total = subtotal + takeawayCharge;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== "staff" && user?.role !== "admin") return null;

  return (
    // w-full max-w-full overflow-x-hidden: evita que este subárbol se
    // convierta en el "content culprit" que fuerza min-width:auto en el
    // flex item padre del layout.
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-black text-white flex flex-col pb-24 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-stone-900/95 backdrop-blur-sm border-b border-stone-800">
        <div className="flex items-center justify-between gap-2 px-4 h-14 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/30 flex-shrink-0">
              <Image src="/logo_que_bravazo.png" alt="" width={32} height={32} className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-amber-400 leading-tight truncate">¡Qué Bravazo!</p>
              <p className="text-[10px] text-stone-500 truncate">Mesero: {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {productCount > 0 && (
              <button onClick={() => setShowCart(true)} className="relative p-2 text-stone-400 hover:text-white">
                <ShoppingBag size={20} />
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-black text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center border border-black">
                  {productCount}
                </span>
              </button>
            )}
            <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-rose-400">
              <LogOut size={18} />
            </button>
          </div>
        </div>
        {scheduleError && (
          <div className="px-4 pb-3 max-w-7xl mx-auto">
            <p className="text-[11px] text-rose-400">
              No hay horarios activos. Contacta al administrador.
            </p>
          </div>
        )}
      </header>

      {/* Category pills */}
      {visibleCategories.length > 0 && (
        <nav className="sticky top-14 z-30 w-full max-w-full bg-black/90 backdrop-blur-sm border-b border-stone-800/50 overflow-x-auto">
          {/* flex-nowrap + w-max: la fila de pills puede ser más ancha que
              la pantalla; el scroll debe quedar contenido AQUÍ, dentro del
              overflow-x-auto del padre, en vez de expandir el documento. */}
          <div className="flex flex-nowrap gap-1 px-3 py-2 w-max min-w-full max-w-7xl mx-auto">
            {visibleCategories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActiveCategory(c.slug)}
                className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeCategory === c.slug
                    ? "bg-amber-500 text-black"
                    : "bg-stone-800 text-stone-400"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Success toast */}
      {success && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-bounce">
          <CheckCircle size={18} />
          Pedido enviado correctamente
        </div>
      )}

      {/* Product grid */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto px-3">
        <div className="max-w-7xl mx-auto w-full">
          {visibleCategories.length === 0 && !scheduleError && (
            <div className="text-center py-20">
              <p className="text-stone-500">Cargando productos...</p>
            </div>
          )}

          {visibleCategories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-2 py-3 px-0.5">
              {(categoryMap.get(activeCategory) || []).map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-500/30 active:border-amber-500/50 transition-all text-left active:scale-[0.97] min-w-0"
                >
                  {/* overflow-hidden agregado: recorta la imagen si por un
                      instante se renderiza a su tamaño intrínseco antes de
                      que el `fill` de next/image tome efecto. */}
                  <div className="relative w-full aspect-square bg-stone-800 overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-stone-600 text-xs">Sin imagen</div>
                    )}
                  </div>
                  <div className="p-2.5 sm:p-2">
                    <p className="text-xs sm:text-[11px] font-medium leading-tight line-clamp-2">{product.title}</p>
                    <p className="text-sm sm:text-xs font-black text-amber-500 mt-1.5 sm:mt-1">S/ {product.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart overlay */}
      {showCart && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 w-full max-w-full bg-stone-900 border-t border-stone-800 rounded-t-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden lg:absolute lg:right-4 lg:bottom-auto lg:top-20 lg:left-auto lg:w-96 lg:rounded-2xl lg:max-h-[calc(100vh-8rem)] lg:shadow-2xl lg:border">
            <div className="flex items-center justify-between px-4 py-3.5 sm:p-4 border-b border-stone-800 flex-shrink-0">
              <h3 className="text-sm font-bold">Pedido</h3>
              <div className="flex items-center gap-2">
                {productCount > 0 && (
                  <span className="text-[11px] text-stone-500">{productCount} producto{productCount !== 1 ? "s" : ""}</span>
                )}
                <button onClick={() => setShowCart(false)} className="p-1.5 text-stone-400 hover:text-white active:text-white">
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>

            {/* Order type - inside cart */}
            <div className="flex gap-2 px-4 pt-3 pb-2 flex-shrink-0">
              <button
                onClick={() => setOrderType("mesa")}
                className={`flex-1 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] ${
                  orderType === "mesa"
                    ? "bg-amber-500 text-black"
                    : "bg-stone-800 text-stone-400"
                }`}
              >
                Mesa
              </button>
              <button
                onClick={() => setOrderType("llevar")}
                className={`flex-1 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] ${
                  orderType === "llevar"
                    ? "bg-amber-500 text-black"
                    : "bg-stone-800 text-stone-400"
                }`}
              >
                Para llevar
              </button>
            </div>

            {orderType === "mesa" && (
              <div className="px-4 pb-2 flex-shrink-0">
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="N° de mesa"
                  className="w-full px-3 py-2.5 sm:py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            )}

            {orderType === "llevar" && (
              <div className="px-4 pb-2 flex-shrink-0">
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  S/1 por plato adicional, excepto caldos y hamburguesas
                </p>
              </div>
            )}

            {!orderType && (
              <div className="px-4 pb-2 flex-shrink-0">
                <p className="text-[11px] text-stone-500">Selecciona Mesa o Para llevar</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
              {cart.length === 0 && (
                <p className="text-stone-500 text-sm text-center py-8">Carrito vacío</p>
              )}
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 bg-stone-800/50 rounded-xl p-3 sm:p-2.5">
                  <div className="relative w-11 h-11 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                    {item.product.image && (
                      <Image src={item.product.image} alt="" fill sizes="44px" className="object-cover" unoptimized />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-xs font-medium truncate">{item.product.title}</p>
                    <p className="text-xs sm:text-[11px] text-amber-500 font-bold">
                      S/ {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    {orderType === "llevar" && !isTakeawayExempt(item.product) && (
                      <p className="text-[10px] text-stone-500">+ S/ 1 envase</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-stone-700 flex items-center justify-center text-stone-300 active:bg-stone-600">
                      <Minus size={14} />
                    </button>
                    <span className="w-7 sm:w-6 text-center text-sm sm:text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-amber-500 flex items-center justify-center text-black active:bg-amber-400">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-stone-500 hover:text-rose-400 active:text-rose-400 flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            {cart.length > 0 && (
              <div className="border-t border-stone-800 p-4 pb-6 sm:pb-4 space-y-2 flex-shrink-0 bg-stone-900">
                <div className="flex justify-between text-xs sm:text-[11px] text-stone-400">
                  <span>Subtotal</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                {orderType === "llevar" && takeawayCharge > 0 && (
                  <div className="flex justify-between text-xs sm:text-[11px] text-stone-400">
                    <span>Envases ({takeawayCharge} × S/1)</span>
                    <span>S/ {takeawayCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-xs font-bold pt-1">
                  <span>Total</span>
                  <span className="text-amber-500">S/ {total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={clearCart} className="flex-1 py-3 sm:py-2.5 bg-stone-800 text-stone-400 rounded-xl text-xs font-medium active:bg-stone-700">
                    Limpiar
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting || !orderType}
                    className="flex-1 py-3 sm:py-2.5 bg-amber-500 text-black rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed active:bg-amber-400"
                  >
                    {submitting ? "Enviando..." : "Confirmar pedido"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating cart button when cart has items but cart is closed */}
      {productCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-28 lg:bottom-6 right-4 z-30 bg-amber-500 text-black px-5 py-3.5 rounded-full shadow-lg shadow-amber-500/20 flex items-center gap-2 font-bold text-sm hover:bg-amber-400 active:scale-95 transition-all"
        >
          <ShoppingBag size={20} />
          <span>S/ {total.toFixed(2)}</span>
        </button>
      )}
    </div>
  );
}