"use client";
import { useToastStore } from '@/lib/stores/toast';
import { ShoppingCart, AlertCircle, X } from 'lucide-react';

export const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-entry pointer-events-auto flex items-start gap-3 min-w-[320px] max-w-[420px] bg-[#161619] border border-[#2a2a2e] rounded-xl p-4 shadow-2xl"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,87,34,0.08)',
          }}
        >
          {toast.type === 'success' ? (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#ff5722] to-[#ea580c] flex items-center justify-center shadow-lg shadow-[#ff5722]/20">
              <ShoppingCart size={18} className="text-white" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <AlertCircle size={18} className="text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">
              {toast.title}
            </p>
            {toast.subtitle && (
              <p className="text-[#ff5722] text-xs font-medium mt-0.5">
                {toast.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes toastSlideUp {
          0% { transform: translateY(120%) scale(0.85); opacity: 0; }
          14% { transform: translateY(-6px) scale(1.03); opacity: 1; }
          22% { transform: translateY(3px) scale(0.97); opacity: 1; }
          30% { transform: translateY(0) scale(1); opacity: 1; }
          82% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(16px) scale(0.95); opacity: 0; }
        }
        .toast-entry {
          animation: toastSlideUp 3.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};
