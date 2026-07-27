"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Loader2, ImageIcon, Video, Film, Upload, Wand2, Save, GripVertical } from "lucide-react";
import Image from "next/image";
import ImagePicker from "@/components/shared/ImagePicker";

interface MediaItem {
  id: string;
  type: "image" | "video" | "gif";
  url: string;
  alt_text: string;
  section: string;
  display_order: number;
  is_active: boolean;
}

interface HomepageContent {
  hero_subtitle: string;
  hero_description: string;
  hero_video_desktop: string;
  hero_video_mobile: string;
  fuego_title: string;
  fuegio_subtitle: string;
  fuego_description: string;
  fuego_card_1_image: string;
  fuego_card_2_image: string;
  fuego_card_3_image: string;
  community_handle: string;
  community_title: string;
  community_description: string;
  contact_handle: string;
  contact_description: string;
  contact_address: string;
  contact_whatsapp: string;
  contact_email: string;
  contact_hours: string[];
}

const DEFAULT_CONTENT: HomepageContent = {
  hero_subtitle: "Tus favoritos en un solo lugar",
  hero_description: "Broaster, hamburguesas artesanales, alitas BBQ y la mejor barra de tragos del barrio.",
  hero_video_desktop: "/HAMBURGUESAS - HORIZONTAL.mp4",
  hero_video_mobile: "/HAMBURGUESAS - VERTICAL.mp4",
  fuego_title: "¿Por qué somos bravazos?",
  fuegio_subtitle: "",
  fuego_description: "Hamburguesas 100% artesanales, alitas BBQ adictivas y la mejor barra de tragos de Pisco. Todo hecho con sazón peruana y el fuelle que solo un verdadero bravazo puede dar.",
  fuego_card_1_image: "",
  fuego_card_2_image: "",
  fuego_card_3_image: "",
  community_handle: "@quebravazorestobar",
  community_title: "El muro de la comunidad",
  community_description: "Mira cómo disfruta nuestra gente y comparte tu momento más bravazo.",
  contact_handle: "@quebravazorestobar",
  contact_description: "Visítanos en nuestro local o pide por delivery. ¡También puedes escribirnos al WhatsApp!",
  contact_address: "Urb. Los Jardines de San Andrés, Pisco, Ica",
  contact_whatsapp: "+51 946 826 535",
  contact_email: "quebravazorestobar@gmail.com",
  contact_hours: ["Lun – Sáb: 12pm – 11pm", "Dom: 12pm – 9pm"],
};

const SECTIONS = [
  { value: "hero", label: "Hero principal", icon: "🎬", color: "from-purple-600/20 to-purple-900/10 border-purple-500/20" },
  { value: "logo", label: "Logo", icon: "🏷️", color: "from-amber-600/20 to-amber-900/10 border-amber-500/20" },
  { value: "background", label: "Fondo", icon: "🖼️", color: "from-blue-600/20 to-blue-900/10 border-blue-500/20" },
  { value: "gallery", label: "Galería", icon: "📸", color: "from-green-600/20 to-green-900/10 border-green-500/20" },
  { value: "promo", label: "Promoción", icon: "🔥", color: "from-rose-600/20 to-rose-900/10 border-rose-500/20" },
  { value: "other", label: "Otro", icon: "📁", color: "from-stone-600/20 to-stone-900/10 border-stone-500/20" },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon size={14} />,
  video: <Video size={14} />,
  gif: <Film size={14} />,
};

const TYPE_COLORS: Record<string, string> = {
  image: "bg-blue-500/10 text-blue-400",
  video: "bg-purple-500/10 text-purple-400",
  gif: "bg-green-500/10 text-green-400",
};

interface MediaForm {
  type: "image" | "video" | "gif";
  url: string;
  alt_text: string;
  section: string;
  display_order: number;
  is_active: boolean;
}

const emptyForm: MediaForm = { type: "image", url: "", alt_text: "", section: "hero", display_order: 0, is_active: true };

type Tab = "media" | "content";

export default function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [form, setForm] = useState<MediaForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("media");
  const [content, setContent] = useState<HomepageContent>(DEFAULT_CONTENT);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentSaving, setContentSaving] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      setItems(json.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings?key=homepage");
      const json = await res.json();
      if (json.value) {
        setContent({ ...DEFAULT_CONTENT, ...json.value });
      }
    } catch {} finally {
      setContentLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedia(); fetchContent(); }, [fetchMedia, fetchContent]);

  async function handleSeed() {
    setSeeding(true);
    setSeedError("");
    try {
      const res = await fetch("/api/admin/media/seed", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setSeedError(json.error || "Error al restaurar medios");
      } else {
        setItems(json.data || []);
      }
    } catch {
      setSeedError("Error de red al restaurar medios");
    } finally {
      setSeeding(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) setForm({ ...form, url: json.url });
    } catch {} finally {
      setUploading(false);
    }
  }

  function openCreate(section?: string) {
    setEditing(null);
    setForm({ ...emptyForm, section: section || "hero" });
    setShowForm(true);
  }

  function openEdit(item: MediaItem) {
    setEditing(item);
    setForm({
      type: item.type,
      url: item.url,
      alt_text: item.alt_text || "",
      section: item.section,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.url.trim()) return;
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/admin/media/${editing.id}` : "/api/admin/media";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        await fetchMedia();
      }
    } catch {} finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      setDeleteId(null);
      await fetchMedia();
    } catch {}
  }

  async function handleToggle(item: MediaItem) {
    try {
      await fetch(`/api/admin/media/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      await fetchMedia();
    } catch {}
  }

  async function handleSaveContent() {
    setContentSaving(true);
    setContentSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "homepage", value: content }),
      });
      if (res.ok) {
        setContentSaved(true);
        setTimeout(() => setContentSaved(false), 3000);
      }
    } catch {} finally {
      setContentSaving(false);
    }
  }

  function getSectionConfig(value: string) {
    return SECTIONS.find((s) => s.value === value) || SECTIONS[SECTIONS.length - 1];
  }

  function groupedMedia() {
    const groups: Record<string, MediaItem[]> = {};
    for (const s of SECTIONS) {
      groups[s.value] = [];
    }
    for (const item of items) {
      if (!groups[item.section]) groups[item.section] = [];
      groups[item.section].push(item);
    }
    return groups;
  }

  if (loading || contentLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 sm:mb-6 border-b border-stone-800 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <button
          onClick={() => setTab("media")}
          className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            tab === "media"
              ? "text-amber-400 border-amber-500"
              : "text-stone-500 hover:text-stone-300 border-transparent"
          }`}
        >
          <span className="flex items-center gap-2">
            <ImageIcon size={16} />
            Multimedia
          </span>
        </button>
        <button
          onClick={() => setTab("content")}
          className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            tab === "content"
              ? "text-amber-400 border-amber-500"
              : "text-stone-500 hover:text-stone-300 border-transparent"
          }`}
        >
          <span className="flex items-center gap-2">
            <Edit2 size={16} />
            Contenido del inicio
          </span>
        </button>
      </div>

      {/* === TAB: MEDIA === */}
      {tab === "media" && (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Multimedia</h1>
              <p className="text-stone-400 text-xs sm:text-sm mt-0.5">{items.length} archivos en total</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-800/50 disabled:text-stone-600 text-stone-300 rounded-xl transition-colors text-xs sm:text-sm flex-1 sm:flex-none justify-center"
              >
                {seeding ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                Restaurar
              </button>
              <button
                onClick={() => openCreate()}
                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors text-xs sm:text-sm flex-1 sm:flex-none justify-center"
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>
          </div>

          {seedError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400">
              {seedError}
            </div>
          )}

          {items.length === 0 && !seedError && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
              <ImageIcon className="w-12 h-12 text-stone-700 mx-auto mb-3" />
              <p className="text-stone-400 mb-4">No hay media en la base de datos.</p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-black font-semibold rounded-xl transition-colors text-sm"
              >
                {seeding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Wand2 size={16} />
                )}
                Restaurar medios por defecto
              </button>
            </div>
          )}

          {/* Sections */}
          {items.length > 0 && (
            <div className="space-y-8">
              {SECTIONS.filter(s => s.value !== "other" || groupedMedia()[s.value].length > 0).map((section) => {
                const sectionItems = groupedMedia()[section.value];
                return (
                  <div key={section.value}>
                    <div className={`flex items-center justify-between mb-3 p-4 rounded-xl border bg-gradient-to-r ${section.color}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{section.icon}</span>
                        <div>
                          <h3 className="text-white font-bold text-base">{section.label}</h3>
                          <p className="text-stone-400 text-xs">{sectionItems.length} archivo{sectionItems.length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openCreate(section.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Plus size={14} />
                        Agregar
                      </button>
                    </div>

                    {sectionItems.length === 0 ? (
                      <div className="bg-stone-900/50 border border-dashed border-stone-800 rounded-xl p-8 text-center">
                        <p className="text-stone-600 text-sm">No hay archivos en esta sección</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sectionItems.map((item) => (
                          <div key={item.id} className="group bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-stone-600 transition-all hover:shadow-lg hover:shadow-black/20">
                            {/* Preview */}
                            <div className="relative aspect-video bg-stone-800 overflow-hidden">
                              {item.type === "image" || item.type === "gif" ? (
                                <Image
                                  src={item.url}
                                  alt={item.alt_text || "Media"}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  unoptimized
                                />
                              ) : (
                                <div className="relative w-full h-full bg-stone-800">
                                  <video
                                    src={item.url}
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-cover"
                                    onMouseEnter={(e) => e.currentTarget.play()}
                                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                      <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="absolute top-2 left-2 flex gap-1.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_COLORS[item.type] || TYPE_COLORS.image}`}>
                                  {item.type.toUpperCase()}
                                </span>
                              </div>
                              {!item.is_active && (
                                <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                                  <span className="text-xs text-stone-400 font-medium bg-stone-900/80 px-3 py-1 rounded-full">Inactivo</span>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                              <p className="text-sm text-white font-medium truncate mb-2">{item.alt_text || "Sin descripción"}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-stone-500">#{item.display_order}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleToggle(item)}
                                    className={`w-8 h-4 rounded-full transition-colors relative ${
                                      item.is_active ? "bg-emerald-500" : "bg-stone-700"
                                    } cursor-pointer`}
                                  >
                                    <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                                      item.is_active ? "translate-x-4" : "translate-x-0"
                                    }`} />
                                  </button>
                                  <button
                                    onClick={() => openEdit(item)}
                                    className="p-1.5 text-stone-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteId(item.id)}
                                    className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* === TAB: CONTENT === */}
      {tab === "content" && (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Contenido del inicio</h1>
              <p className="text-stone-400 text-xs sm:text-sm mt-0.5">Personaliza los textos e imágenes de la página principal</p>
            </div>
            <button
              onClick={handleSaveContent}
              disabled={contentSaving}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl transition-colors text-sm font-semibold w-full sm:w-auto justify-center ${
                contentSaved
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-black"
              }`}
            >
              {contentSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {contentSaved ? "¡Guardado!" : "Guardar cambios"}
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Hero Section */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-800 bg-gradient-to-r from-purple-600/10 to-transparent">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-base sm:text-lg">🎬</span> Hero principal
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">Subtítulo (arriba del título)</label>
                  <input
                    type="text"
                    value={content.hero_subtitle}
                    onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">Descripción (debajo del título)</label>
                  <textarea
                    value={content.hero_description}
                    onChange={(e) => setContent({ ...content, hero_description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm resize-none"
                  />
                </div>
                <div className="border-t border-stone-800 pt-4">
                  <p className="text-xs text-stone-500 font-medium mb-3">🎥 Video / Imagen de fondo</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImagePicker
                      value={content.hero_video_desktop}
                      onChange={(url) => setContent({ ...content, hero_video_desktop: url })}
                      label="Escritorio (horizontal)"
                    />
                    <ImagePicker
                      value={content.hero_video_mobile}
                      onChange={(url) => setContent({ ...content, hero_video_mobile: url })}
                      label="Móvil (vertical)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fuego Section */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-800 bg-gradient-to-r from-amber-600/10 to-transparent">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-base sm:text-lg">🔥</span> "¿Por qué somos bravazos?" — Cards
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">Título</label>
                    <input
                      type="text"
                      value={content.fuego_title}
                      onChange={(e) => setContent({ ...content, fuego_title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">Subtítulo</label>
                    <input
                      type="text"
                      value={content.fuegio_subtitle}
                      onChange={(e) => setContent({ ...content, fuegio_subtitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">Descripción</label>
                  <textarea
                    value={content.fuego_description}
                    onChange={(e) => setContent({ ...content, fuego_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm resize-none"
                  />
                </div>

                <div className="border-t border-stone-800 pt-4">
                  <p className="text-xs text-stone-500 font-medium mb-3">🖼️ Imágenes de las 3 cards</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <ImagePicker
                      value={content.fuego_card_1_image}
                      onChange={(url) => setContent({ ...content, fuego_card_1_image: url })}
                      label="Card #1"
                      compact
                    />
                    <ImagePicker
                      value={content.fuego_card_2_image}
                      onChange={(url) => setContent({ ...content, fuego_card_2_image: url })}
                      label="Card #2"
                      compact
                    />
                    <ImagePicker
                      value={content.fuego_card_3_image}
                      onChange={(url) => setContent({ ...content, fuego_card_3_image: url })}
                      label="Card #3"
                      compact
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Community Section */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-800 bg-gradient-to-r from-green-600/10 to-transparent">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-base sm:text-lg">📸</span> Comunidad / Instagram
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">Handle de Instagram</label>
                    <input
                      type="text"
                      value={content.community_handle}
                      onChange={(e) => setContent({ ...content, community_handle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">Título</label>
                    <input
                      type="text"
                      value={content.community_title}
                      onChange={(e) => setContent({ ...content, community_title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">Descripción</label>
                  <textarea
                    value={content.community_description}
                    onChange={(e) => setContent({ ...content, community_description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-800 bg-gradient-to-r from-blue-600/10 to-transparent">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-base sm:text-lg">📞</span> Contacto
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">Dirección</label>
                    <input
                      type="text"
                      value={content.contact_address}
                      onChange={(e) => setContent({ ...content, contact_address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">WhatsApp</label>
                    <input
                      type="text"
                      value={content.contact_whatsapp}
                      onChange={(e) => setContent({ ...content, contact_whatsapp: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">Email</label>
                    <input
                      type="text"
                      value={content.contact_email}
                      onChange={(e) => setContent({ ...content, contact_email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">Handle redes</label>
                    <input
                      type="text"
                      value={content.contact_handle}
                      onChange={(e) => setContent({ ...content, contact_handle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">Descripción</label>
                  <textarea
                    value={content.contact_description}
                    onChange={(e) => setContent({ ...content, contact_description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">Horarios (uno por línea)</label>
                  <textarea
                    value={content.contact_hours.join('\n')}
                    onChange={(e) => setContent({ ...content, contact_hours: e.target.value.split('\n') })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview info */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-stone-900/50 border border-stone-800 rounded-xl">
            <p className="text-[11px] sm:text-xs text-stone-500">
              <span className="text-amber-400 font-medium">💡</span> Los cambios se aplican al recargar la página de inicio.
            </p>
          </div>
        </div>
      )}

      {/* === MEDIA FORM MODAL === */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setShowForm(false)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-stone-800">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar media" : "Agregar media"}</h2>
              <button onClick={() => setShowForm(false)} disabled={saving} className="text-stone-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">Tipo</label>
                <div className="flex gap-2">
                  {["image", "video", "gif"].map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t as "image" | "video" | "gif" })}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-1.5 ${
                        form.type === t
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-600"
                      }`}
                    >
                      {TYPE_ICONS[t]}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">URL *</label>
                <div className="flex gap-2">
                  <input type="url" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${uploading ? 'bg-stone-700 text-stone-400' : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'}`}>
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span className="hidden sm:inline">Subir</span>
                    <input type="file" accept="image/*,video/*,.gif" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">Pega una URL o sube un archivo desde tu equipo</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">Texto alternativo</label>
                <input type="text" value={form.alt_text} onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  placeholder="Descripción de la imagen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">Sección</label>
                <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                >
                  {SECTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-stone-300">Activo</label>
                  <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
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
                  <input type="number" min={0} value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} disabled={saving}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saving || !form.url.trim()}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-black font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editing ? "Guardar cambios" : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === DELETE CONFIRM === */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar media?</h3>
            <p className="text-stone-400 text-sm mb-6">Esta acción no se puede deshacer.</p>
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
