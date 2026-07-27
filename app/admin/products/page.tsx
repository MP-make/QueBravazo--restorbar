"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Search, Loader2, RefreshCw, Filter, Check, X, Wand2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  ventify_id: string;
  sku: string;
  title: string;
  price: number;
  image: string;
  original_category: string;
  mapping_id: string | null;
  category_id: string | null;
  category_name: string | null;
  display_order: number;
  menu_types: string[];
  is_active: boolean;
  is_featured: boolean;
  is_mapped: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [autoMapping, setAutoMapping] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMapped, setFilterMapped] = useState<"all" | "mapped" | "unmapped">("all");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/product-mappings");
      const json = await res.json();
      setProducts(json.products || []);
      setCategories(json.categories || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAutoMap() {
    setAutoMapping(true);
    try {
      await fetch("/api/admin/product-mappings/auto-map", { method: "POST" });
      await fetchData();
    } catch {} finally {
      setAutoMapping(false);
    }
  }

  async function updateMapping(vp: ProductItem, updates: Record<string, any>) {
    setSaving(vp.ventify_id);
    try {
      await fetch(`/api/admin/product-mappings/${vp.ventify_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: vp.sku,
          title: vp.title,
          price: vp.price,
          image: vp.image,
          category_id: vp.category_id,
          display_order: vp.display_order,
          menu_types: vp.menu_types,
          is_active: vp.is_active,
          is_featured: vp.is_featured,
          ...updates,
        }),
      });
      await fetchData();
    } catch {} finally {
      setSaving(null);
    }
  }

  async function quickToggle(vp: ProductItem, field: "is_active" | "is_featured") {
    setSaving(vp.ventify_id);
    try {
      const ping = products.find((p) => p.ventify_id === vp.ventify_id);
      if (!ping) return;
      await fetch(`/api/admin/product-mappings/${vp.ventify_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: vp.sku,
          title: vp.title,
          price: vp.price,
          image: vp.image,
          category_id: ping.category_id,
          display_order: ping.display_order,
          menu_types: ping.menu_types,
          is_active: field === "is_active" ? !ping.is_active : ping.is_active,
          is_featured: field === "is_featured" ? !ping.is_featured : ping.is_featured,
        }),
      });
      await fetchData();
    } catch {} finally {
      setSaving(null);
    }
  }

  async function handleCategoryChange(vp: ProductItem, categoryId: string | null) {
    setSaving(vp.ventify_id);
    try {
      await fetch(`/api/admin/product-mappings/${vp.ventify_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: vp.sku,
          title: vp.title,
          price: vp.price,
          image: vp.image,
          category_id: categoryId,
          display_order: vp.display_order,
          menu_types: vp.menu_types,
          is_active: true,
          is_featured: vp.is_featured,
        }),
      });
      await fetchData();
    } catch {} finally {
      setSaving(null);
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch = search
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.original_category.toLowerCase().includes(search.toLowerCase())
      : true;
    if (filterMapped === "mapped") return matchesSearch && p.is_mapped;
    if (filterMapped === "unmapped") return matchesSearch && !p.is_mapped;
    return matchesSearch;
  });

  const mappedCount = products.filter((p) => p.is_mapped).length;
  const unmappedCount = products.filter((p) => !p.is_mapped).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="text-stone-400 text-sm mt-0.5">
            {products.length} productos en Ventify &middot; {mappedCount} mapeados &middot; {unmappedCount} sin mapear
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAutoMap}
            disabled={autoMapping}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-black font-semibold rounded-xl transition-colors text-sm"
          >
            {autoMapping ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            <span className="hidden sm:inline">Mapear </span>Auto
          </button>
          <button onClick={fetchData} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors text-sm border border-stone-700">
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos por nombre, SKU o categoria..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "mapped", "unmapped"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterMapped(f)}
              className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                filterMapped === f
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700"
              }`}
            >
              {f === "all" ? "Todos" : f === "mapped" ? "Mapeados" : "Sin mapear"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left px-2 sm:px-3 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider w-10 sm:w-12">Img</th>
                <th className="text-left px-2 sm:px-3 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Producto</th>
                <th className="text-left px-2 sm:px-3 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider w-14 sm:w-16">Precio</th>
                <th className="text-left px-2 sm:px-3 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Categoria Ventify</th>
                <th className="text-left px-2 sm:px-3 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Categoria local</th>
                <th className="text-left px-2 sm:px-3 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider w-20 hidden lg:table-cell">Estado</th>
                <th className="text-left px-2 sm:px-3 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider w-14 sm:w-16">Activo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-500">
                    No se encontraron productos
                  </td>
                </tr>
              )}
              {filtered.map((vp) => (
                <tr
                  key={vp.ventify_id}
                  className={`border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors ${
                    !vp.is_mapped ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-2 sm:px-3 py-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                      <Image
                        src={vp.image}
                        alt={vp.title}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-2.5 min-w-0">
                    <div>
                      <p className="text-white font-medium text-xs sm:text-sm leading-tight truncate max-w-[120px] sm:max-w-none">{vp.title}</p>
                      <code className="text-[10px] text-stone-600">{vp.sku}</code>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-2.5">
                    <span className="text-stone-300 font-mono text-xs sm:text-sm">S/{vp.price.toFixed(2)}</span>
                  </td>
                  <td className="px-2 sm:px-3 py-2.5 hidden md:table-cell">
                    <span className="text-stone-500 text-xs">{vp.original_category}</span>
                  </td>
                  <td className="px-2 sm:px-3 py-2.5">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <select
                        value={vp.category_id || ""}
                        onChange={(e) => handleCategoryChange(vp, e.target.value || null)}
                        disabled={saving === vp.ventify_id}
                        className={`w-full max-w-[100px] sm:max-w-none px-2 py-1.5 rounded-lg text-[10px] sm:text-xs border transition-all ${
                          vp.is_mapped
                            ? "bg-stone-800 border-stone-700 text-white"
                            : "bg-stone-800/50 border-stone-800 text-stone-400"
                        } focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50`}
                      >
                        <option value="">Sin categoria</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {saving === vp.ventify_id && (
                        <Loader2 size={12} className="animate-spin text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-2.5 hidden lg:table-cell">
                    {vp.is_mapped ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                        <Check size={10} /> Mapeado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-800 text-stone-500">
                        <X size={10} /> Sin mapa
                      </span>
                    )}
                  </td>
                  <td className="px-2 sm:px-3 py-2.5">
                    <button
                      onClick={() => quickToggle(vp, "is_active")}
                      disabled={!vp.is_mapped || saving === vp.ventify_id}
                      className={`w-8 h-4 sm:w-9 sm:h-5 rounded-full transition-colors relative ${
                        vp.is_active ? "bg-emerald-500" : "bg-stone-700"
                      } ${!vp.is_mapped ? "opacity-30 cursor-not-allowed" : ""} cursor-pointer`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow transition-transform ${
                          vp.is_active ? "translate-x-3 sm:translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
