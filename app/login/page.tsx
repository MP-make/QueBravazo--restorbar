"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, User } from "lucide-react";
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
    <div className="min-h-screen bg-black flex">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white/80 hover:text-white rounded-xl transition-all border border-white/10 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Volver</span>
      </Link>

      {/* Left: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/30 mx-auto mb-3">
              <Image src="/logo_que_bravazo.png" alt="" width={56} height={56} className="object-cover" />
            </div>
            <h1 className="text-xl font-black">
              <span className="text-amber-400">¡Qué</span>
              <span className="text-white"> Bravazo!</span>
            </h1>
          </div>

          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-white">Bienvenido</h2>
              <p className="text-stone-500 text-sm mt-1">Inicia sesión en tu cuenta</p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <p className="text-rose-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-400 mb-1.5">
                  Email o nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                  <input
                    id="email"
                    type="text"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-400 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 text-black font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
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
      </div>

      {/* Right: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-stone-900">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10" />

        {/* Image */}
        <Image
          src="/principal.png"
          alt=""
          fill
          className="object-cover"
          priority
          unoptimized
        />

        {/* Brand */}
        <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/40 bg-stone-900/60 backdrop-blur-sm">
            <Image src="/logo_que_bravazo.png" alt="" width={40} height={40} className="object-cover" />
          </div>
          <span className="text-lg font-black">
            <span className="text-amber-400">¡Qué</span>
            <span className="text-white"> Bravazo!</span>
          </span>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-10 left-10 right-10 z-20">
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Gestiona tu restobar <br />
            <span className="text-amber-400">desde cualquier lugar</span>
          </h2>
          <p className="text-stone-400 text-sm max-w-md">
            Panel de administración y meseros. Controla pedidos, productos, horarios y más.
          </p>
        </div>
      </div>
    </div>
  );
}
