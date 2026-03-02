"use client";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-5 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-stone-500 text-xs">
          <p>© 2026 <span className="text-amber-400 font-semibold">¡Qué Bravazo! Restobar</span>. Todos los derechos reservados.</p>
          <p>🔥 Broaster · Hamburguesas · Alitas BBQ · Cervezas</p>
        </div>
      </div>
    </footer>
  );
}