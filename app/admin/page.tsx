"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderTree,
  UtensilsCrossed,
  Clock,
  ImageIcon,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const STAT_CARDS = [
  { label: "Categorías", href: "/admin/categories", icon: FolderTree, color: "text-emerald-400", bg: "bg-emerald-500/10", countKey: "categories" },
  { label: "Productos mapeados", href: "/admin/products", icon: UtensilsCrossed, color: "text-amber-400", bg: "bg-amber-500/10", countKey: "mapped" },
  { label: "Horarios", href: "/admin/schedules", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", countKey: "schedules" },
  { label: "Media", href: "/admin/media", icon: ImageIcon, color: "text-purple-400", bg: "bg-purple-500/10", countKey: "media" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/product-mappings").then((r) => r.json()),
      fetch("/api/admin/schedules").then((r) => r.json()),
      fetch("/api/admin/media").then((r) => r.json()),
    ])
      .then(([cat, prod, sched, med]) => {
        setStats({
          categories: cat.data?.length || 0,
          mapped: prod.mapped_count || 0,
          unmapped: prod.unmapped_count || 0,
          total_products: prod.total || 0,
          schedules: sched.data?.length || 0,
          media: med.data?.length || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">Panel de control del restobar</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const count = stats[card.countKey] ?? 0;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-stone-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-stone-400 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-white">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-stone-800 rounded animate-pulse" />
                ) : (
                  count
                )}
              </p>
              <p className="text-stone-400 text-sm mt-1">{card.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Resumen de productos
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-stone-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-stone-800">
                <span className="text-stone-300 text-sm">Total en Ventify</span>
                <span className="text-white font-bold">{stats.total_products || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone-800">
                <span className="text-stone-300 text-sm">Mapeados a categorías</span>
                <span className="text-emerald-400 font-bold">{stats.mapped || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-stone-300 text-sm">Sin mapear</span>
                <span className="text-rose-400 font-bold">{stats.unmapped || 0}</span>
              </div>
            </div>
          )}
          <Link
            href="/admin/products"
            className="mt-4 inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
          >
            Ir a productos <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Accesos rápidos</h2>
          <div className="space-y-2">
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 px-4 py-3 bg-stone-800/50 hover:bg-stone-800 rounded-xl transition-colors text-sm text-stone-300 hover:text-white"
            >
              <FolderTree size={16} className="text-emerald-400" />
              Gestionar categorías
            </Link>
            <Link
              href="/admin/schedules"
              className="flex items-center gap-3 px-4 py-3 bg-stone-800/50 hover:bg-stone-800 rounded-xl transition-colors text-sm text-stone-300 hover:text-white"
            >
              <Clock size={16} className="text-blue-400" />
              Configurar horarios de menú
            </Link>
            <Link
              href="/admin/media"
              className="flex items-center gap-3 px-4 py-3 bg-stone-800/50 hover:bg-stone-800 rounded-xl transition-colors text-sm text-stone-300 hover:text-white"
            >
              <ImageIcon size={16} className="text-purple-400" />
              Administrar media (hero/fondos)
            </Link>
          </div>
        </div>
      </div>

      {/* Info block */}
      <div className="mt-8 bg-stone-900/50 border border-stone-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">Cómo funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-stone-400">
          <div className="space-y-1">
            <p className="text-amber-400 font-medium">1. Crea categorías</p>
            <p>Define las categorías y asígnalas a un tipo de menú (criollo/rápido/ambos).</p>
          </div>
          <div className="space-y-1">
            <p className="text-amber-400 font-medium">2. Mapea productos</p>
            <p>Asocia los productos de Ventify a tus categorías y define su orden.</p>
          </div>
          <div className="space-y-1">
            <p className="text-amber-400 font-medium">3. Programa horarios</p>
            <p>Configura qué menú se muestra según la hora del día.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
