"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth";
import { CookingPot, User, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/chef", label: "Pedidos", icon: CookingPot },
  { href: "/chef/perfil", label: "Perfil", icon: User },
];

export default function ChefLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "chef" && user.role !== "admin") {
      router.replace("/");
      return;
    }
  }, [isHydrated, isLoggedIn, user, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== "chef" && user?.role !== "admin") return null;

  const isActiveRoute = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-stone-900/95 border-r border-stone-800/80 flex-shrink-0 shadow-[4px_0_20px_rgba(0,0,0,0.3)]">
        <div className="h-14 flex items-center gap-3 px-4 border-b border-stone-800/80">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/30 flex-shrink-0 shadow-lg shadow-amber-500/10">
            <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black text-xs font-bold">
              QB
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-gradient-amber leading-tight">Cocina</p>
            <p className="text-[9px] text-stone-500 font-semibold tracking-[0.15em] uppercase">Panel</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.href);
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
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800/80 flex-shrink-0 hidden lg:block">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black text-xs font-bold uppercase shadow-lg shadow-amber-500/20">
              {user?.name?.charAt(0) || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{user?.name}</p>
              <p className="text-[11px] text-stone-500 truncate">{user?.role === "chef" ? "Cocinero" : "Admin"}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-2 px-3 py-2 w-full text-stone-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl text-sm transition-all duration-200 group"
          >
            <LogOut size={16} className="group-hover:scale-110 transition-transform" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile only) */}
        <header className="lg:hidden flex items-center gap-3 px-3 h-12 bg-stone-900/95 backdrop-blur-sm border-b border-stone-800 flex-shrink-0">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-500/30 flex-shrink-0">
            <div className="w-full h-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-bold">
              QB
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-amber-400 leading-tight">Cocina</p>
            <p className="text-[9px] text-stone-500 truncate">{user?.name}</p>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }} className="p-1.5 text-stone-400 hover:text-rose-400">
            <LogOut size={16} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-14 lg:pb-0">
          {children}
        </main>

        {/* Bottom nav (mobile only) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-900 border-t border-stone-800 safe-area-bottom">
          <div className="flex items-center justify-around h-14">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full transition-colors ${
                    active ? "text-amber-400" : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[9px] font-medium leading-tight text-center">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
