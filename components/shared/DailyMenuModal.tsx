"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function DailyMenuModal() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("daily_menu_seen");
    if (seen) {
      setDismissed(true);
      return;
    }

    fetch("/api/daily-menu")
      .then((r) => r.json())
      .then((res) => {
        if (res.image_url) setImageUrl(res.image_url);
      })
      .catch(() => {});
  }, []);

  function handleClose() {
    setDismissed(true);
    sessionStorage.setItem("daily_menu_seen", "1");
  }

  if (dismissed || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative max-w-lg w-full animate-in">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
          <Image
            src={imageUrl}
            alt="Menú del Día"
            width={600}
            height={600}
            className="w-full h-auto object-contain"
            unoptimized
          />
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .animate-in {
          animation: fadeScaleIn 0.3s ease-out;
        }
        @keyframes fadeScaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
