"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Loader2, User, Phone, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import { registerClient } from "@/lib/firebase/auth";
import { useAuthStore } from "@/lib/stores/auth";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dni: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: datos personales, 2: credenciales
  
  const router = useRouter();
  const { login } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // Registrar en Firebase y sincronizar con Ventify
      const user = await registerClient(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        formData.dni
      );

      // Auto login después del registro
      login({
        uid: user.uid,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        dni: formData.dni,
        role: 'client',
      });

      // Redirigir al home
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (!formData.name || !formData.email) {
      setError("Completa los campos obligatorios");
      return;
    }
    setError("");
    setStep(2);
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
          alt="Ventify Restaurante"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent" />
        
        {/* Contenido sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Únete a <span className="text-amber-400">Ventify</span>
          </h1>
          <p className="text-stone-300 text-lg max-w-md mb-8">
            Crea tu cuenta y disfruta de pedidos rápidos, historial de compras 
            y promociones exclusivas.
          </p>
          
          {/* Beneficios */}
          <div className="space-y-3">
            {[
              "Pedidos rápidos con tus datos guardados",
              "Historial de compras y favoritos",
              "Promociones y descuentos exclusivos",
              "Acumula puntos con cada pedido"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-400" />
                <span className="text-stone-300">{benefit}</span>
              </div>
            ))}
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
                <span className="text-amber-400">Ventify</span>
                <span className="text-white"> Restaurante</span>
              </span>
            </Link>
          </div>

          {/* Card del formulario */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-stone-700'} text-white text-sm font-bold`}>
                1
              </div>
              <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-stone-700'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-stone-700'} text-white text-sm font-bold`}>
                2
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {step === 1 ? "Datos Personales" : "Crear Contraseña"}
              </h2>
              <p className="text-stone-400">
                {step === 1 
                  ? "Cuéntanos un poco sobre ti" 
                  : "Configura tu acceso seguro"}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                <p className="text-rose-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                <>
                  {/* Nombre */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-300 mb-2">
                      Nombre completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Juan Pérez"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-2">
                      Correo electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-stone-300 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="999 888 777"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* DNI */}
                  <div>
                    <label htmlFor="dni" className="block text-sm font-medium text-stone-300 mb-2">
                      DNI
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                      <input
                        id="dni"
                        name="dni"
                        type="text"
                        value={formData.dni}
                        onChange={handleChange}
                        placeholder="12345678"
                        maxLength={8}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Next button */}
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20"
                  >
                    Continuar
                  </button>
                </>
              ) : (
                <>
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-2">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
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

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-300 mb-2">
                      Confirmar contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Resumen de datos */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-stone-400 text-sm mb-2">Resumen:</p>
                    <p className="text-white font-medium">{formData.name}</p>
                    <p className="text-stone-400 text-sm">{formData.email}</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 border border-white/20 hover:border-white/40 text-white font-medium rounded-xl transition-all"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-stone-600 disabled:to-stone-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        "Crear Cuenta"
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-stone-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            {/* Login link */}
            <Link
              href="/login"
              className="w-full py-4 border border-white/20 hover:border-amber-500/50 hover:bg-amber-500/5 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Privacy note */}
          <div className="mt-6 text-center">
            <p className="text-stone-500 text-xs">
              Al registrarte aceptas nuestros{" "}
              <Link href="#" className="text-amber-400 hover:underline">Términos de Servicio</Link>
              {" "}y{" "}
              <Link href="#" className="text-amber-400 hover:underline">Política de Privacidad</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}