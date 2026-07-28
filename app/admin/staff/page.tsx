"use client";
import { useState, useEffect, useCallback } from "react";
import { UserPlus, Loader2, Mail, User, Lock, Shield, ChefHat } from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"staff" | "admin" | "chef">("staff");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
                  <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Rol</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Creado</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{s.name}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-stone-400">{s.email}</td>
                    <td className="px-4 py-3">
                      {s.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400">
                          <Shield size={12} />
                          Admin
                        </span>
                      ) : s.role === "chef" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400">
                          <ChefHat size={12} />
                          Cocinero
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
                          <ChefHat size={12} />
                          Mesero
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-stone-500 text-xs">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
