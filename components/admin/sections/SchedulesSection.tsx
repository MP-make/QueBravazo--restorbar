"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";

interface Schedule {
  id: string;
  menu_type: string;
  label: string;
  day_of_week: number | null;
  days_of_week: number[] | null;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

const MENU_STYLES: Record<string, { label: string; color: string }> = {
  criollo: { label: "Menu Criollo", color: "bg-amber-500/10 text-amber-400" },
  rapida: { label: "Comida Rapida", color: "bg-orange-500/10 text-orange-400" },
};

interface ScheduleForm {
  menu_type: string;
  label: string;
  days_of_week: number[];
  apply_all_days: boolean;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const emptyForm: ScheduleForm = { menu_type: "criollo", label: "", days_of_week: [...ALL_DAYS], apply_all_days: true, start_time: "12:00", end_time: "18:00", is_active: true };

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [form, setForm] = useState<ScheduleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/schedules");
      const json = await res.json();
      setSchedules(json.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(sched: Schedule) {
    const dw = sched.days_of_week || (sched.day_of_week !== null ? [sched.day_of_week] : [...ALL_DAYS]);
    setEditing(sched);
    setForm({
      menu_type: sched.menu_type,
      label: sched.label,
      days_of_week: dw,
      apply_all_days: dw.length === 7,
      start_time: sched.start_time.slice(0, 5),
      end_time: sched.end_time.slice(0, 5),
      is_active: sched.is_active,
    });
    setShowForm(true);
  }

  function toggleDay(day: number) {
    setForm((prev) => {
      const has = prev.days_of_week.includes(day);
      const next = has ? prev.days_of_week.filter((d) => d !== day) : [...prev.days_of_week, day].sort();
      return { ...prev, days_of_week: next, apply_all_days: next.length === 7 };
    });
  }

  function setAllDays(all: boolean) {
    setForm((prev) => ({
      ...prev,
      days_of_week: all ? [...ALL_DAYS] : [],
      apply_all_days: all,
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.days_of_week.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        menu_type: form.menu_type,
        label: form.label,
        days_of_week: form.apply_all_days ? ALL_DAYS : form.days_of_week,
        start_time: form.start_time,
        end_time: form.end_time,
        is_active: form.is_active,
      };
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/admin/schedules/${editing.id}` : "/api/admin/schedules";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        await fetchSchedules();
      }
    } catch {} finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/schedules/${id}`, { method: "DELETE" });
      setDeleteId(null);
      await fetchSchedules();
    } catch {}
  }

  async function handleToggle(sched: Schedule) {
    try {
      const res = await fetch(`/api/admin/schedules/${sched.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !sched.is_active }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Error al cambiar estado: " + (err.error || "Error desconocido"));
        return;
      }
      await fetchSchedules();
    } catch (e) {
      alert("Error de red al cambiar estado");
    }
  }

  function getDayLabel(sched: Schedule) {
    const dw = sched.days_of_week || (sched.day_of_week !== null ? [sched.day_of_week] : null);
    if (!dw || dw.length === 7) return "Todos los dias";
    if (dw.length <= 2) return dw.map((d) => DAYS[d]).join(", ");
    return `${dw.map((d) => DAYS[d].slice(0, 3)).join(", ")}`;
  }

  function getMenuStyle(type: string) {
    return MENU_STYLES[type] || { label: type.charAt(0).toUpperCase() + type.slice(1), color: "bg-purple-500/10 text-purple-400" };
  }

  function formatTime(t: string) {
    return t.slice(0, 5);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Horarios de Menu</h1>
          <p className="text-stone-400 text-sm mt-0.5">Controla que menu se muestra segun la hora y el dia</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors text-sm self-start sm:self-auto">
          <Plus size={16} />
          Nuevo horario
        </button>
      </div>

      {schedules.length === 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
          <p className="text-stone-400">No hay horarios configurados.</p>
        </div>
      )}

      {schedules.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Menu</th>
                  <th className="text-left px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Etiqueta</th>
                  <th className="text-left px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Dias</th>
                  <th className="text-left px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Horario</th>
                  <th className="text-left px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider w-16 sm:w-20">Activo</th>
                  <th className="text-right px-2 sm:px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider w-20 sm:w-24">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((sched) => {
                  const menu = getMenuStyle(sched.menu_type);
                  return (
                    <tr key={sched.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                      <td className="px-2 sm:px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${menu.color}`}>
                          {menu.label}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <span className="text-white text-sm">{sched.label || "-"}</span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 hidden md:table-cell text-stone-300 text-xs">{getDayLabel(sched)}</td>
                      <td className="px-2 sm:px-4 py-3">
                        <span className="text-white font-medium text-sm">
                          {formatTime(sched.start_time)} - {formatTime(sched.end_time)}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <button onClick={() => handleToggle(sched)}
                          className={`w-8 h-4 sm:w-9 sm:h-5 rounded-full transition-colors relative ${
                            sched.is_active ? "bg-emerald-500" : "bg-stone-700"
                          }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow transition-transform ${
                            sched.is_active ? "translate-x-3 sm:translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(sched)}
                            className="p-1 sm:p-2 text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          ><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteId(sched.id)}
                            className="p-1 sm:p-2 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          ><Trash2 size={14} /></button>
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

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setShowForm(false)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-stone-800">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar horario" : "Nuevo horario"}</h2>
              <button onClick={() => setShowForm(false)} disabled={saving} className="text-stone-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">Tipo de menu</label>
                <input type="text" value={form.menu_type} onChange={(e) => setForm({ ...form, menu_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  placeholder="Ej: criollo, rapida, tienda"
                />
                <p className="text-[11px] text-stone-500 mt-1">Escribe el nombre del tipo de menu (criollo, rapida, tienda, etc.)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">Etiqueta (opcional)</label>
                <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  placeholder="Ej: Menu Criollo (Lun-Vie 12-6pm)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">Dias</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button type="button" onClick={() => setAllDays(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      form.apply_all_days
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-600"
                    }`}
                  >
                    Todos los dias
                  </button>
                  {DAYS.map((d, i) => (
                    <button key={i} type="button" onClick={() => toggleDay(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        form.days_of_week.includes(i) && !form.apply_all_days
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-600"
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
                {!form.apply_all_days && form.days_of_week.length === 0 && (
                  <p className="text-[11px] text-rose-400">Selecciona al menos un dia</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1.5">Hora inicio</label>
                  <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1.5">Hora fin</label>
                  <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} disabled={saving}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saving || form.days_of_week.length === 0}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-black font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editing ? "Guardar cambios" : "Crear horario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Eliminar horario?</h3>
            <p className="text-stone-400 text-sm mb-6">Esta accion no se puede deshacer.</p>
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
