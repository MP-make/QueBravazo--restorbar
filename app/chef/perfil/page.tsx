"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { LogOut, Mail, Shield, Save, Eye, EyeOff, CheckCircle } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  staff: "Mesero",
  chef: "Cocinero",
  admin: "Administrador",
};

export default function ChefPerfilPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [editingDni, setEditingDni] = useState(false);
  const [dniInput, setDniInput] = useState(user?.dni || "");
  const [dniPassword, setDniPassword] = useState("");
  const [showDniPassword, setShowDniPassword] = useState(false);
  const [savingDni, setSavingDni] = useState(false);
  const [dniError, setDniError] = useState("");
  const [dniSaved, setDniSaved] = useState(false);

  if (!user) return null;

  async function handleSaveName() {
    if (!nameInput.trim() || !user) return;
    setSavingName(true);
    try {
      const res = await fetch(`/api/admin/staff/${user.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      user.name = nameInput.trim();
      setEditingName(false);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 3000);
    } catch {
      alert("Error al guardar nombre");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword || !user) return;
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/admin/staff/${user.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Error al cambiar contraseña");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSaveDni() {
    if (!user) return;
    setDniError("");
    const trimmed = dniInput.trim();
    if (!/^\d{8}$/.test(trimmed)) {
      setDniError("El DNI debe tener 8 dígitos");
      return;
    }
    if (!dniPassword) {
      setDniError("Ingresa tu contraseña para confirmar");
      return;
    }
    setSavingDni(true);
    try {
      const res = await fetch(`/api/admin/staff/${user.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: trimmed, current_password: dniPassword }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      user.dni = trimmed;
      setDniPassword("");
      setEditingDni(false);
      setDniSaved(true);
      setTimeout(() => setDniSaved(false), 3000);
    } catch (err: any) {
      setDniError(err.message || "Error al guardar DNI");
    } finally {
      setSavingDni(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-3xl font-black mb-3">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <h2 className="text-lg font-bold">{user.name}</h2>
        <p className="text-xs text-stone-500">{ROLE_LABELS[user.role] || user.role}</p>
      </div>

      {/* Editar nombre */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-stone-500 uppercase tracking-wider font-medium">Nombre</p>
          {!editingName && (
            <button onClick={() => { setNameInput(user.name); setEditingName(true); }} className="text-[11px] text-amber-400 underline">
              Editar
            </button>
          )}
        </div>
        {editingName ? (
          <div className="space-y-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingName(false)}
                className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveName}
                disabled={savingName || !nameInput.trim()}
                className="flex-1 py-2 bg-amber-500 text-black rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Save size={14} />
                {savingName ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium">{user.name}</p>
        )}
        {nameSaved && (
          <p className="text-green-400 text-[11px] mt-2 flex items-center gap-1">
            <CheckCircle size={12} /> Nombre actualizado
          </p>
        )}
      </div>

      {/* Email (read-only) */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center gap-3">
        <Mail size={18} className="text-amber-500 flex-shrink-0" />
        <div>
          <p className="text-[10px] text-stone-500 uppercase tracking-wider">Email</p>
          <p className="text-sm font-medium">{user.email}</p>
        </div>
      </div>

      {/* DNI */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-stone-500 uppercase tracking-wider font-medium">DNI</p>
          {!editingDni && (
            <button
              onClick={() => { setDniInput(user.dni || ""); setDniError(""); setDniPassword(""); setEditingDni(true); }}
              className="text-[11px] text-amber-400 underline"
            >
              Editar
            </button>
          )}
        </div>
        {editingDni ? (
          <div className="space-y-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={dniInput}
              onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ""))}
              placeholder="12345678"
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <div>
              <label className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">Contraseña para confirmar</label>
              <div className="relative">
                <input
                  type={showDniPassword ? "text" : "password"}
                  value={dniPassword}
                  onChange={(e) => setDniPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowDniPassword(!showDniPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showDniPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {dniError && <p className="text-rose-400 text-[11px]">{dniError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setEditingDni(false)}
                className="flex-1 py-2 bg-stone-800 text-stone-400 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDni}
                disabled={savingDni}
                className="flex-1 py-2 bg-amber-500 text-black rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Save size={14} />
                {savingDni ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium">{user.dni || "Sin DNI"}</p>
        )}
        {dniSaved && (
          <p className="text-green-400 text-[11px] mt-2 flex items-center gap-1">
            <CheckCircle size={12} /> DNI actualizado
          </p>
        )}
      </div>

      {/* Rol (read-only) */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center gap-3">
        <Shield size={18} className="text-amber-500 flex-shrink-0" />
        <div>
          <p className="text-[10px] text-stone-500 uppercase tracking-wider">Rol</p>
          <p className="text-sm font-medium capitalize">{ROLE_LABELS[user.role] || user.role}</p>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
        <button
          onClick={() => setShowChangePassword(!showChangePassword)}
          className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          {showChangePassword ? "Cancelar" : "Cambiar contraseña"}
        </button>

        {showChangePassword && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">Contraseña actual</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
              <div>
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">Confirmar nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Repite la contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {passwordError && (
                <p className="text-rose-400 text-[11px]">{passwordError}</p>
              )}
              <button
                onClick={handleChangePassword}
                disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full py-2 bg-amber-500 text-black rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {savingPassword ? "Cambiando..." : "Cambiar contraseña"}
              </button>
            {passwordSaved && (
              <p className="text-green-400 text-[11px] flex items-center gap-1">
                <CheckCircle size={12} /> Contraseña actualizada
              </p>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </div>
  );
}
