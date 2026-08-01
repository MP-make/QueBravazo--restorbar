"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, X, Check, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
  menu_type: string;
  image: string;
}

const BASE_MENU_TYPES = [
  { value: "criollo", label: "Criollo", color: "bg-amber-500/10 text-amber-400" },
  { value: "rapida", label: "Rápida", color: "bg-orange-500/10 text-orange-400" },
  { value: "ambos", label: "Ambos", color: "bg-blue-500/10 text-blue-400" },
];

function getMenuStyle(value: string, extraTypes: { value: string; label: string; color: string }[] = []) {
  const all = [...BASE_MENU_TYPES, ...extraTypes];
  return all.find((m) => m.value === value) || { value, label: value.charAt(0).toUpperCase() + value.slice(1), color: "bg-purple-500/10 text-purple-400" };
}

const emptyForm = { name: "", slug: "", description: "", menu_type: "ambos", display_order: 0, is_active: true, image: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [scheduleTypes, setScheduleTypes] = useState<{ value: string; label: string; color: string }[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const [catRes, schedRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/schedules"),
      ]);
      const catJson = await catRes.json();
      const schedJson = await schedRes.json();
      setCategories(catJson.data || []);
      const seen = new Set<string>();
      const types: { value: string; label: string; color: string }[] = [];
      for (const s of schedJson.data || []) {
        const t = s.menu_type as string;
        if (seen.has(t) || BASE_MENU_TYPES.some((b) => b.value === t)) continue;
        seen.add(t);
        types.push({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1), color: "bg-purple-500/10 text-purple-400" });
      }
      setScheduleTypes(types);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  async function handleSeed() {
    setSeeding(true);
    setSeedError("");
    try {
      const res = await fetch("/api/admin/categories/seed", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setSeedError(json.error || "Error al restaurar categorías");
      } else {
        setCategories(json.data || []);
      }
    } catch {
      setSeedError("Error de red al restaurar categorías");
    } finally {
      setSeeding(false);
    }
  }

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      menu_type: cat.menu_type,
      display_order: cat.display_order,
      is_active: cat.is_active,
      image: cat.image || "",
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug }),
      });
      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        await fetchCategories();
      }
    } catch {} finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      setDeleteId(null);
      await fetchCategories();
    } catch {}
  }

  async function handleToggle(cat: Category) {
    try {
      await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !cat.is_active }),
      });
      await fetchCategories();
    } catch {}
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const newOrder = [...categories];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setCategories(newOrder);
    await Promise.all([
      fetch(`/api/admin/categories/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: swapIdx }),
      }),
      fetch(`/api/admin/categories/${newOrder[idx].id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: idx }),
      }),
    ]);
    await fetchCategories();
  }

  function getMenuLabel(value: string) {
    return getMenuStyle(value, scheduleTypes);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorías</h1>
          <p className="text-stone-400 text-sm mt-0.5">{categories.length} categorías</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors text-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          Nueva categoría
        </button>
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
          <p className="text-stone-400 mb-4">No hay categorías en la base de datos.</p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-black font-semibold rounded-xl transition-colors text-sm"
          >
            {seeding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Restaurar categorías por defecto
          </button>
          {seedError && (
            <p className="text-rose-400 text-sm mt-3">{seedError}</p>
          )}
        </div>
      )}

      {/* Table */}
      {categories.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider w-12 sm:w-16">Orden</th>
                <th className="text-left px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Nombre</th>
                <th className="text-left px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-left px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Menú</th>
                <th className="text-left px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider w-16 sm:w-20">Activo</th>
                <th className="text-right px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider w-20 sm:w-24">Acciones</th>
              </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => {
                  const menu = getMenuLabel(cat.menu_type);
                  return (
                    <tr key={cat.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <button
                            onClick={() => handleReorder(cat.id, "up")}
                            disabled={i === 0}
                            className="p-0.5 sm:p-1 text-stone-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <span className="text-stone-400 text-[10px] sm:text-xs w-3 sm:w-4 text-center">{i + 1}</span>
                          <button
                            onClick={() => handleReorder(cat.id, "down")}
                            disabled={i === categories.length - 1}
                            className="p-0.5 sm:p-1 text-stone-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <span className="text-white font-medium text-sm">{cat.name}</span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                        <code className="text-stone-400 text-xs bg-stone-800 px-2 py-0.5 rounded">{cat.slug}</code>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${menu.color}`}>
                          {menu.label}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <button
                          onClick={() => handleToggle(cat)}
                          className={`w-8 h-4 sm:w-9 sm:h-5 rounded-full transition-colors relative ${
                            cat.is_active ? "bg-emerald-500" : "bg-stone-700"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow transition-transform ${
                              cat.is_active ? "translate-x-3 sm:translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-1 sm:p-2 text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(cat.id)}
                            className="p-1 sm:p-2 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setShowForm(false)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-stone-800">
              <h2 className="text-lg font-bold text-white">
                {editing ? "Editar categoría" : "Nueva categoría"}
              </h2>
              <button onClick={() => setShowForm(false)} disabled={saving} className="text-stone-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">Nombre *</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })}
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  placeholder="Ej: Broaster"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">Slug</label>
                <input
                  type="text" value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  placeholder="Auto-generado"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">Descripción</label>
                <textarea
                  value={form.description} rows={2}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">Tipo de menú</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[...BASE_MENU_TYPES, ...scheduleTypes].map((mt) => (
                    <button
                      key={mt.value} type="button"
                      onClick={() => setForm({ ...form, menu_type: mt.value })}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                        form.menu_type === mt.value
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-600"
                      }`}
                    >
                      {mt.label}
                    </button>
                  ))}
                </div>
                <input type="text" value={![...BASE_MENU_TYPES, ...scheduleTypes].some(m => m.value === form.menu_type) ? form.menu_type : ''}
                  onChange={(e) => setForm({ ...form, menu_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  placeholder="O escribe un tipo personalizado"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-stone-300">Activo</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      form.is_active ? "bg-emerald-500" : "bg-stone-700"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.is_active ? "translate-x-4" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                <div className="w-20">
                  <label className="block text-xs text-stone-500 mb-1">Orden</label>
                  <input
                    type="number" min={0} value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setShowForm(false)} disabled={saving}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={saving || !form.name.trim()}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-black font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editing ? "Guardar cambios" : "Crear categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar categoría?</h3>
            <p className="text-stone-400 text-sm mb-6">Esta acción no se puede deshacer. Los productos asociados quedarán sin categoría.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors text-sm font-medium">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors text-sm">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
