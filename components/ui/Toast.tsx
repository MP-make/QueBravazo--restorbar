"use client";
import { useToastStore } from '@/lib/stores/toast';
import { X, Check } from 'lucide-react';

export const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-black text-white shadow-lg rounded-lg p-4 flex items-center space-x-3 animate-in slide-in-from-bottom-2 fade-in duration-300"
        >
          {toast.type === 'success' ? (
            <div className="bg-green-500 rounded-full p-1">
              <Check size={16} className="text-white" />
            </div>
          ) : (
            <span className="text-lg">❌</span>
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};