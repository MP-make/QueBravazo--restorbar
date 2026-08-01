"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { UserPlus, Loader2, Mail, User, Lock, Shield, ChefHat, Check, X, Trash2, ToggleLeft, ToggleRight, CreditCard } from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  name: string;
  dni?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_OPTIONS = ["admin", "staff", "chef"] as const;

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  staff: "Mesero",
  chef: "Cocinero",
};

const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  staff: ChefHat,
  chef: ChefHat,
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-amber-500/10 text-amber-400",
  staff: "bg-emerald-500/10 text-emerald-400",
  chef: "bg-sky-500/10 text-sky-400",
};

export default function AdminStaff() {
  const { user: currentUser } = useAuthStore();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"staff" | "admin" | "chef">("staff");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [savingRole, setSavingRole] = useState(false);
  const [editingDni, setEditingDni] = useState<string | null>(null);
  const [dniValue, setDniValue] = useState<string>("");
  const [savingDni, setSavingDni] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const json = await res.json();
      setStaff(json.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          dni: dni.trim(),
          password,
          role,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "Error al crear");
      } else {
        const label = role === "admin" ? "Admin" : role === "chef" ? "Cocinero" : "Mesero";
        setSuccess(`${label} "${name}" creado exitosamente`);
        setName("");
        setEmail("");
        setDni("");
        setPassword("");
        setRole("staff");
        setShowForm(false);
        await fetchStaff();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleSave(member: StaffMember) {
    if (editingValue === member.role) {
      setEditingRole(null);
      return;
    }
    setSavingRole(true);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editingValue }),
      });
      const json = await res.json();
      if (!json.ok) {
        alert(json.error || "Error al actualizar rol");
      } else {
        setSuccess(`Rol de "${member.name}" actualizado a ${ROLE_LABELS[editingValue]}`);
        await fetchStaff();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setSavingRole(false);
      setEditingRole(null);
    }
  }

  async function handleDniSave(member: StaffMember) {
    const trimmed = dniValue.trim();
    if (trimmed === (member.dni || "")) {
      setEditingDni(null);
      return;
    }
    setSavingDni(true);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: trimmed }),
      });
      const json = await res.json();
      if (!json.ok) {
        alert(json.error || "Error al actualizar DNI");
      } else {
        setSuccess(`DNI de "${member.name}" actualizado exitosamente`);
        await fetchStaff();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setSavingDni(false);
      setEditingDni(null);
    }
  }

  async function handleToggleActive(member: StaffMember) {
    setToggling(member.id);
    try {
      const newState = !member.is_active;
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newState }),
      });
      const json = await res.json();
      if (!json.ok) {
        alert(json.error || "Error al cambiar estado");
      } else {
        const label = newState ? "activado" : "desactivado";
        setSuccess(`"${member.name}" ${label} exitosamente`);
        await fetchStaff();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(member: StaffMember) {
    if (!confirm(`¿Eliminar a "${member.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(member.id);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.ok) {
        alert(json.error || "Error al eliminar");
      } else {
        setSuccess(`"${member.name}" eliminado exitosamente`);
        await fetchStaff();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setDeleting(null);
    }
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
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-stone-400 text-sm mt-0.5">Gestiona administradores y meseros</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors text-sm self-start sm:self-auto"
        >
          <UserPlus size={16} />
          Nuevo usuario
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <p className="text-emerald-400 text-sm">{success}</p>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 mb-6 max-w-lg">
          <h3 className="text-sm font-bold text-white mb-4">Nuevo usuario</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Nombre</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">DNI</label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                  placeholder="12345678"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Con este DNI se iniciará sesión</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Rol</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("staff")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    role === "staff"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-600"
                  }`}
                >
                  <ChefHat size={16} />
                  Mesero
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    role === "admin"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-600"
                  }`}
                >
                  <Shield size={16} />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole("chef")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    role === "chef"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-600"
                  }`}
                >
                  <ChefHat size={16} />
                  Cocinero
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 bg-stone-800 text-stone-400 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      {staff.length === 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
          <p className="text-stone-400">No hay usuarios registrados.</p>
        </div>
      )}

      {staff.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">DNI</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Rol</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Creado</th>
                  <th className="px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => {
                  const RoleIcon = ROLE_ICONS[s.role] || ChefHat;
                  const isEditing = editingRole === s.id;
                  const isEditingDni = editingDni === s.id;
                  const isSelf = s.id === currentUser?.uid;
                  return (
                    <tr key={s.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${s.is_active ? "text-white" : "text-stone-500"}`}>{s.name}</span>
                          {!s.is_active && (
                            <span className="text-[10px] text-stone-600 bg-stone-800 px-1.5 py-0.5 rounded">inactivo</span>
                          )}
                          {isSelf && s.is_active && (
                            <span className="text-[10px] text-stone-500 bg-stone-800 px-1.5 py-0.5 rounded">tú</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isEditingDni ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={8}
                              value={dniValue}
                              onChange={(e) => setDniValue(e.target.value.replace(/\D/g, ""))}
                              className="w-24 bg-stone-800 border border-stone-700 rounded-lg text-white text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                            <button
                              onClick={() => handleDniSave(s)}
                              disabled={savingDni}
                              className="p-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                            >
                              {savingDni ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button
                              onClick={() => setEditingDni(null)}
                              className="p-1 text-stone-500 hover:text-stone-300"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingDni(s.id);
                              setDniValue(s.dni || "");
                            }}
                            className={`font-mono text-xs ${s.dni ? "text-stone-300 hover:text-amber-400" : "text-stone-600 italic hover:text-amber-400"} transition-colors`}
                            title="Editar DNI"
                          >
                            {s.dni || "Sin DNI"}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-stone-400">{s.email}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="bg-stone-800 border border-stone-700 rounded-lg text-white text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleRoleSave(s)}
                              disabled={savingRole}
                              className="p-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                            >
                              {savingRole ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button
                              onClick={() => setEditingRole(null)}
                              className="p-1 text-stone-500 hover:text-stone-300"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingRole(s.id);
                              setEditingValue(s.role);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${ROLE_COLORS[s.role] || ROLE_COLORS.staff} hover:opacity-80 transition-opacity`}
                          >
                            <RoleIcon size={12} />
                            {ROLE_LABELS[s.role] || s.role}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-stone-500 text-xs">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => handleToggleActive(s)}
                              disabled={toggling === s.id}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all disabled:opacity-50 ${
                                s.is_active
                                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-stone-800 text-stone-500 hover:bg-stone-700"
                              }`}
                              title={s.is_active ? "Desactivar usuario" : "Activar usuario"}
                            >
                              {toggling === s.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : s.is_active ? (
                                <ToggleRight size={14} />
                              ) : (
                                <ToggleLeft size={14} />
                              )}
                              {s.is_active ? "Activo" : "Inactivo"}
                            </button>
                            <button
                              onClick={() => handleDelete(s)}
                              disabled={deleting === s.id}
                              className="inline-flex items-center p-1.5 text-stone-500 hover:text-rose-400 disabled:opacity-50 transition-colors rounded-lg"
                              title="Eliminar usuario"
                            >
                              {deleting === s.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
