"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/auth";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ImageIcon,
  LogOut,
  ChevronRight,
  AlertTriangle,
  Menu,
  X,
  Users,
  ClipboardList,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/admin/staff", label: "Usuarios", icon: Users },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout, isHydrated } = useAuthStore();
  const [verifying, setVerifying] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [verifyError, setVerifyError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
      return;
    }
    fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.admin) {
          setAuthorized(true);
        } else if (res.error) {
          setVerifyError(true);
        } else {
          setAuthorized(false);
        }
      })
      .catch(() => {
        setVerifyError(true);
      })
      .finally(() => setVerifying(false));
  }, [isHydrated, isLoggedIn, user, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!authorized && !verifyError) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-8">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acceso denegado</h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-6">
            Tu email <span className="text-amber-400 font-semibold">{user?.email}</span> no está registrado como administrador.
            <br /><br />
            Para obtener acceso, agrega tu email a la tabla <code className="text-amber-300 bg-stone-800 px-2 py-0.5 rounded text-xs">admin_users</code> en Supabase:
          </p>
          <pre className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-left text-xs text-stone-300 mb-6 overflow-x-auto">
            {`INSERT INTO admin_users (email, name, role)
VALUES ('${user?.email || 'tu@email.com'}', 'Admin', 'superadmin');`}
          </pre>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl transition-colors text-sm font-medium"
          >
            Intentar con otro usuario
          </button>
        </div>
      </div>
    );
  }

  const isActiveRoute = (item: typeof NAV_ITEMS[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="min-h-screen bg-stone-950 flex">
      {/* Tablet overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 hidden md:block lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: hidden on mobile, drawer on tablet, inline on desktop */}
      <aside className={`
        max-md:hidden
        flex-col bg-stone-900/95 border-r border-stone-800/80 flex-shrink-0

        /* Tablet: fixed drawer with slide animation */
        md:flex md:flex-col
        md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64
        md:transition-transform md:duration-300 md:ease-out
        ${sidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}

        /* Desktop: always visible, inline in flow, no animation */
        lg:relative lg:inset-auto lg:z-auto lg:w-56
        lg:transition-none lg:translate-x-0 lg:flex
        lg:shadow-[4px_0_20px_rgba(0,0,0,0.3)]
      `}>
        <div className="h-14 lg:h-16 flex items-center gap-3 px-4 lg:px-5 border-b border-stone-800/80 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/30 flex-shrink-0 shadow-lg shadow-amber-500/10">
            <Image
              src="/logo_que_bravazo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight">
              <span className="text-gradient-amber">¡Qué Bravazo!</span>
            </span>
            <span className="text-[10px] text-stone-500 font-semibold tracking-[0.15em] uppercase">Panel Admin</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 border border-amber-500/15 shadow-sm"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 border border-transparent"
                }`}
              >
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-500 rounded-full shadow-sm shadow-amber-500/50" />}
                <Icon size={18} className={active ? "text-amber-500" : "text-stone-500 group-hover:text-stone-300 transition-colors"} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto text-amber-500/60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800/80 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black text-xs font-bold uppercase shadow-lg shadow-amber-500/20">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{user?.name}</p>
              <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-2 px-3 py-2 w-full text-stone-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl text-sm transition-all duration-200 group"
          >
            <LogOut size={16} className="group-hover:scale-110 transition-transform" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full">
        {/* Top bar (with sidebar toggle) */}
        <header className="h-14 lg:h-16 flex items-center gap-3 px-3 lg:px-6 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md flex-shrink-0 shadow-sm">
          {/* Hamburger: tablet only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors hidden md:flex lg:hidden"
            aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <Menu size={20} />
          </button>
          {/* Page title: mobile + tablet */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-amber-500/30 flex-shrink-0">
              <Image
                src="/logo_que_bravazo.png"
                alt="Logo"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[120px] md:max-w-[200px]">
              {NAV_ITEMS.find(i => isActiveRoute(i))?.label || "Panel Admin"}
            </span>
          </div>
          {/* Page title: desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">
              {NAV_ITEMS.find(i => isActiveRoute(i))?.label || "Panel Admin"}
            </span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-stone-400 font-medium">{user?.name}</span>
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black text-xs font-bold shadow-lg shadow-amber-500/20">
              {user?.name?.charAt(0) || "A"}
            </div>
            <button onClick={() => { logout(); router.push("/login"); }} className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200" title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 md:pb-6">
          {verifyError && !authorized && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-300">
                <span className="font-semibold">Verificación de servidor no disponible.</span>{" "}
                Accediendo con credenciales locales.{" "}
                <button
                  onClick={() => { logout(); router.push("/login"); }}
                  className="underline hover:text-amber-200"
                >
                  Iniciar sesión con otro usuario
                </button>
              </div>
            </div>
          )}
          {children}
        </main>

        {/* Bottom nav (mobile only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-900 border-t border-stone-800 safe-area-bottom">
          <div className="flex items-center overflow-x-auto no-scrollbar h-16 px-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] px-2 h-full transition-colors flex-shrink-0 ${
                    active ? "text-amber-400" : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[9px] font-medium leading-tight text-center whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
