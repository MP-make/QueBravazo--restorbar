"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImagePicker from "@/components/shared/ImagePicker";
import { Save } from "lucide-react";

export default function AdminYapePage() {
  const [qrUrl, setQrUrl] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/yape-config")
      .then((r) => r.json())
      .then((res) => {
        if (res.value) {
          setQrUrl(res.value.qr_url || "");
          setName(res.value.name || "¡Qué Bravazo! Restobar");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/yape-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_url: qrUrl, name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Error al guardar");
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
    <div className="max-w-lg mx-auto">
      <div className="space-y-6">
        {/* QR Image */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Código QR de Yape
          </label>
          <ImagePicker
            value={qrUrl}
            onChange={setQrUrl}
          />
          {qrUrl && (
            <div className="mt-3 inline-block">
              <Image
                src={qrUrl}
                alt="QR Yape"
                width={180}
                height={180}
                className="rounded-lg"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Nombre del titular
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: ¡Qué Bravazo! Restobar"
            className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full py-3 bg-amber-500 text-black rounded-xl font-bold text-sm hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar configuración"}
        </button>

        {saved && (
          <p className="text-center text-green-400 text-xs">Configuración guardada correctamente</p>
        )}
      </div>
    </div>
  );
}
