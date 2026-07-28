"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, Loader2, User } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [email, setEmail] = useState("");
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

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
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
        loop
        muted
        playsInline
        poster="/login.png"
        className="absolute inset-0 w-full h-full object-contain"
      >
        <source src="/login.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/40 mx-auto mb-4">
            <Image src="/logo_que_bravazo.png" alt="" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-2xl font-black">
            <span className="text-amber-400">¡Qué</span>
            <span className="text-white"> Bravazo!</span>
          </h1>
          <p className="text-stone-300 text-sm mt-2">Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-500/20 border border-rose-500/30 rounded-xl">
            <p className="text-rose-300 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-200 mb-1.5">
              Email o nombre
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full pl-10 pr-4 py-3 bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-200 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-600 text-black font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
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
