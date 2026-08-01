"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CreditCard } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const query = dni.trim();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: query, email: query, password }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Error al iniciar sesión");
        setIsLoading(false);
        return;
      }

      login(data.user);
      if (data.user.role === 'staff') router.push('/waiter');
      else if (data.user.role === 'chef') router.push('/chef');
      else if (data.user.role === 'owner') router.push('/owner');
      else router.push('/admin');
    } catch {
      setError("Error de conexión. Verifica tu internet.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <video
        autoPlay
        muted
        playsInline
        poster="/login.png"
        className="absolute inset-0 w-full h-full max-lg:object-scale-down lg:object-cover"
      >
        <source src="/login.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 max-lg:hidden" />

      <div className="relative z-10 w-full max-w-sm mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-white text-center mb-8">
          Iniciar sesión
        </h1>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-500/20 border border-rose-500/30 rounded-xl">
            <p className="text-rose-300 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-white/80 mb-1.5">
              Email o DNI
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                id="dni"
                type="text"
                autoComplete="username"
                required
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="correo@ejemplo.com o tu DNI"
                className="w-full pl-10 pr-4 py-3 bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-600 text-black font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
