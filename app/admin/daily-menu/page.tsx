"use client";
import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import ImagePicker from "@/components/shared/ImagePicker";

export default function AdminDailyMenu() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings?key=daily_menu")
      .then((r) => r.json())
      .then((res) => {
        if (res.value?.image_url) setImageUrl(res.value.image_url);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "daily_menu",
          value: { image_url: imageUrl },
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {} finally {
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
          <h1 className="text-2xl font-bold text-white">Menú del Día</h1>
          <p className="text-stone-400 text-sm mt-0.5">
            Imagen que aparece como ventana flotante en la página de inicio
          </p>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-xl">
        <div className="space-y-4">
          <ImagePicker
            value={imageUrl}
            onChange={setImageUrl}
            label="Imagen del Menú del Día"
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-black font-semibold rounded-xl transition-colors text-sm"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar
            </button>
            {saved && (
              <span className="text-emerald-400 text-sm font-medium">
                Guardado
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
