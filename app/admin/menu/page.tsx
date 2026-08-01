"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderTree, UtensilsCrossed, Clock, CalendarCheck } from "lucide-react";
import AdminCategories from "@/components/admin/sections/CategoriesSection";
import AdminProducts from "@/components/admin/sections/ProductsSection";
import AdminSchedules from "@/components/admin/sections/SchedulesSection";
import AdminDailyMenu from "@/components/admin/sections/DailyMenuSection";

const TABS = [
  { key: "categories", label: "Categorías", icon: FolderTree, component: AdminCategories },
  { key: "products", label: "Productos", icon: UtensilsCrossed, component: AdminProducts },
  { key: "schedules", label: "Horarios", icon: Clock, component: AdminSchedules },
  { key: "daily", label: "Menú del Día", icon: CalendarCheck, component: AdminDailyMenu },
];

function MenuTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab") || "categories";
  const active = TABS.some((t) => t.key === requested) ? requested : "categories";
  const ActiveComponent = TABS.find((t) => t.key === active)!.component;

  function switchTab(key: string) {
    if (key === active) return;
    router.replace(`/admin/menu?tab=${key}`);
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 overflow-x-auto no-scrollbar border-b border-stone-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                isActive
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>
      <ActiveComponent />
    </div>
  );
}

export default function AdminMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MenuTabs />
    </Suspense>
  );
}
