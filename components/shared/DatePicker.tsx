"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Elegir fecha",
  compact = false,
  className = "",
}: {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  compact?: boolean;
  className?: string;
}) {
  const today = new Date();
  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());

  function goToDate(date: Date) {
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    const maxMonth = today.getFullYear() * 12 + today.getMonth();
    const current = viewYear * 12 + viewMonth;
    if (current >= maxMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function pickDay(day: number) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(iso);
    setOpen(false);
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (selectedDate) goToDate(selectedDate);
        }}
        className={`inline-flex items-center gap-2 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
          compact ? "px-3 py-2" : "px-3.5 py-2 sm:px-4 sm:py-2.5"
        } ${
          selectedDate
            ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/25"
            : "bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white"
        }`}
      >
        <CalendarDays size={13} className="sm:w-4 sm:h-4" />
        {selectedDate ? (
          <span className="capitalize">
            {selectedDate.toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" })}
          </span>
        ) : (
          placeholder
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-3 z-50 w-72 -translate-x-1/2 rounded-2xl bg-stone-900 border border-stone-700/60 shadow-2xl shadow-black/70 p-3 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:translate-x-0 sm:w-80 sm:p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={prevMonth}
                className="p-1.5 sm:p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
              </button>
              <p className="text-xs sm:text-sm font-bold capitalize">{monthLabel}</p>
              <button
                onClick={nextMonth}
                className="p-1.5 sm:p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <ChevronRight size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => (
                <div key={d} className="text-center text-[9px] sm:text-[11px] font-bold text-stone-500 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isSelected = value === iso;
                const isToday = isSameDay(new Date(viewYear, viewMonth, day), today);
                const isFuture = new Date(viewYear, viewMonth, day) > today;
                if (isFuture) {
                  return (
                    <div
                      key={day}
                      className="h-8 sm:h-10 rounded-lg flex items-center justify-center text-[11px] sm:text-sm text-stone-700 cursor-not-allowed"
                    >
                      {day}
                    </div>
                  );
                }
                return (
                  <button
                    key={day}
                    onClick={() => pickDay(day)}
                    className={`h-8 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-amber-500 text-black font-bold shadow-sm shadow-amber-500/40"
                        : isToday
                          ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/25"
                          : "text-stone-300 hover:bg-stone-800"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onChange(toIso(today));
                  setOpen(false);
                }}
                className="text-[11px] sm:text-sm font-semibold text-amber-400 hover:underline"
              >
                Ir a hoy
              </button>
              {selectedDate && (
                <span className="text-[11px] sm:text-sm text-stone-500">
                  {selectedDate.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
