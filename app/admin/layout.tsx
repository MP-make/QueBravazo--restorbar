"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/auth";
import {
  LayoutDashboard,
  FolderTree,
  UtensilsCrossed,
  Clock,
  ImageIcon,
  LogOut,
  ChevronRight,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categorías", icon: FolderTree },
  { href: "/admin/products", label: "Productos", icon: UtensilsCrossed },
  { href: "/admin/schedules", label: "Horarios", icon: Clock },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout, isHydrated } = useAuthStore();
  const [verifying, setVerifying] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [verifyError, setVerifyError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        flex-col bg-stone-900 border-r border-stone-800 flex-shrink-0

        /* Mobile: fixed drawer with slide animation */
        fixed inset-y-0 left-0 z-40
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}

        /* Tablet+ : inline in flow, no animation */
        md:relative md:inset-auto md:z-auto
        md:transition-none md:translate-x-0
        ${sidebarOpen ? 'md:flex' : 'md:hidden'}
      `}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-stone-800 flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/30 flex-shrink-0">
            <Image
              src="/logo_que_bravazo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold">
              <span className="text-amber-400">¡Qué</span>
              <span className="text-white"> Bravazo!</span>
            </span>
            <span className="text-[10px] text-stone-500 font-medium tracking-wider uppercase">Panel Admin</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-transparent"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto text-amber-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold uppercase">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{user?.name}</p>
              <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-2 px-3 py-2 w-full text-stone-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (with sidebar toggle) */}
        <header className="h-14 md:h-16 flex items-center gap-3 px-4 border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-500/30">
              <Image
                src="/logo_que_bravazo.png"
                alt="Logo"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-bold text-white">Panel Admin</span>
          </div>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
            {user?.name?.charAt(0) || "A"}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
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
          <div className="flex items-center justify-around h-16">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full transition-colors ${
                    active ? "text-amber-400" : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
