"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Loader2, ChefHat, Users, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { loginWithEmail } from "@/lib/firebase/auth";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 🔥 MOCK LOGIN TEMPORAL - Solo para desarrollo
      // Comentar esto cuando Firebase esté configurado
      
      // Determinar rol basado en el email
      let mockRole: 'client' | 'staff' | 'admin' = 'client';
      const emailLower = email.toLowerCase();
      
      if (emailLower.includes('admin')) {
        mockRole = 'admin';
      } else if (
        emailLower.includes('mesero') || 
        emailLower.includes('cajero') || 
        emailLower.includes('staff') ||
        emailLower.includes('@ventify')
      ) {
        mockRole = 'staff';
      }

      // Simular usuario mock
      login({
        uid: 'mock-' + Date.now(),
        email: email,
        name: email.split('@')[0],
        role: mockRole,
      });

      // Smart Redirect basado en rol
      if (mockRole === 'staff' || mockRole === 'admin') {
        router.push("/waiter");
      } else {
        router.push("/");
      }
      
      return; // Salir aquí para evitar la autenticación real
      
      // 🔥 FIN DEL MOCK LOGIN
      
      // Código original con Firebase (comentado temporalmente)
      /*
      const { user, role } = await loginWithEmail(email, password);
      
      login({
        uid: user.uid,
        email: user.email || email,
        name: user.displayName || email.split('@')[0],
        role: role as 'client' | 'staff' | 'admin',
      });

      if (role === 'staff' || role === 'admin') {
        router.push("/waiter");
      } else {
        router.push("/");
      }
      */
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex">
      {/* Botón Regresar - Posición absoluta */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all border border-white/20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">Volver al Inicio</span>
      </Link>

      {/* Lado izquierdo - Imagen/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20" />
        <Image
          src="/banner_ventify_1920x600.jpg"
          alt="¡Qué Bravazo! Restobar"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent" />
        
        {/* Contenido sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenido a <span className="text-amber-400">¡Qué Bravazo!</span>
          </h1>
          <p className="text-stone-300 text-lg max-w-md">
            Restobar de comida rápida peruana. Inicia sesión para gestionar pedidos, delivery y más. 🍗🍺
          </p>
          
          {/* Badges de modos */}
          <div className="flex gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-white text-sm">Clientes</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <ChefHat className="w-5 h-5 text-amber-400" />
              <span className="text-white text-sm">Staff</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-bold">
                <span className="text-amber-400">¡Qué</span>
                <span className="text-white"> Bravazo!</span>
              </span>
            </Link>
          </div>

          {/* Card del formulario */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-stone-400">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                <p className="text-rose-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <Link href="#" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-stone-600 disabled:to-stone-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-stone-500">¿Nuevo aquí?</span>
              </div>
            </div>

            {/* Register link */}
            <Link
              href="/register"
              className="w-full py-4 border border-white/20 hover:border-amber-500/50 hover:bg-amber-500/5 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              Crear una cuenta
            </Link>
          </div>

          {/* Info de roles */}
          <div className="mt-8 text-center">
            <p className="text-stone-500 text-sm">
              💡 El sistema detectará automáticamente si eres <span className="text-amber-400">cliente</span> o <span className="text-amber-400">staff</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}