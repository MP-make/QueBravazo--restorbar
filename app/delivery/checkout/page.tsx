"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Phone, MapPin, Mail, ArrowLeft, CheckCircle, Copy, X, Banknote, Smartphone, CreditCard, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cart';
import { useToastStore } from '@/lib/stores/toast';

// Configuración de pagos - PERSONALIZA ESTOS DATOS
const PAYMENT_CONFIG = {
  yape: {
    nombre: "¡Qué Bravazo! Restobar",
    numero: "999 888 777", // Tu número de Yape
  },
  plin: {
    nombre: "¡Qué Bravazo! Restobar", 
    numero: "999 888 777", // Tu número de Plin
  },
  deliveryCost: 5, // Costo de delivery
};

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const { addToast } = useToastStore();
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Cálculos SIN IGV
  const subtotal = getTotal();
  const delivery = PAYMENT_CONFIG.deliveryCost;
  const total = subtotal + delivery;

  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push('/');
    }
  }, [items.length, router, orderSuccess]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSelect = (method: string) => {
    setPaymentMethod(method);
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      addToast('Tu navegador no soporta geolocalización', 'error');
      return;
    }

    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Geocoding inverso usando OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'es',
              }
            }
          );
          
          if (!response.ok) {
            throw new Error('Error al obtener la dirección');
          }
          
          const data = await response.json();
          
          // Construir dirección desde los datos
          const addressParts = [];
          if (data.address.road) addressParts.push(data.address.road);
          if (data.address.house_number) addressParts.push(data.address.house_number);
          if (data.address.suburb) addressParts.push(data.address.suburb);
          if (data.address.city || data.address.town) addressParts.push(data.address.city || data.address.town);
          if (data.address.state) addressParts.push(data.address.state);
          
          const formattedAddress = addressParts.length > 0 
            ? addressParts.join(', ')
            : data.display_name;
          
          setAddress(formattedAddress);
          addToast('Ubicación detectada correctamente', 'success');
        } catch (error) {
          console.error('Error en geocoding inverso:', error);
          addToast('Error al obtener la dirección. Por favor, ingrésala manualmente', 'error');
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        let errorMessage = 'No pudimos detectar tu ubicación, ingrésala manualmente';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Actívalo en tu navegador';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible. Verifica tu GPS';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo agotado al buscar ubicación';
            break;
        }
        
        addToast(errorMessage, 'error');
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Validation
    const newErrors: Record<string, boolean> = {
      name: !customerName.trim(),
      phone: phone.length !== 9 || !phone.startsWith('9'),
      address: !address.trim(),
      email: !!email && !(/^[^\s@]+@[^\s@]+\.(com|pe)$/i.test(email)),
      paymentMethod: !paymentMethod,
    };
    
    setErrors(newErrors);

    if (Object.values(newErrors).some(v => v)) {
      return;
    }

    // Procesar pedido directamente
    await processOrder();
  };

  const processOrder = async () => {
    setIsSubmitting(true);
    
    // Construir mensaje para WhatsApp
    let message = `🍕 *NUEVO PEDIDO - ¡Qué Bravazo!*\n\n`;
    message += `👤 *Cliente:* ${customerName}\n`;
    message += `📱 *Teléfono:* +51 ${phone}\n`;
    message += `📧 *Correo:* ${email || 'No proporcionado'}\n`;
    message += `🏠 *Dirección:* ${address}\n`;
    message += `💳 *Método de Pago:* ${paymentMethod.toUpperCase()}\n`;
    message += `\n📋 *PRODUCTOS:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.title} x${item.quantity} - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
      if (item.notes) {
        message += `   Nota: ${item.notes}\n`;
      }
    });
    message += `\n💰 *SUBTOTAL:* S/ ${subtotal.toFixed(2)}\n`;
    message += `🚚 *DELIVERY:* S/ ${delivery.toFixed(2)}\n`;
    message += `💵 *TOTAL:* S/ ${total.toFixed(2)}\n`;
    if (notes) {
      message += `\n📝 *NOTAS ADICIONALES:* ${notes}\n`;
    }
    message += `\n✅ *PEDIDO CONFIRMADO*`;

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/51946826535?text=${encodedMessage}`;

    // Limpiar carrito y redirigir a WhatsApp
    clearCart();
    setOrderSuccess(true);
    
    // Redirigir a WhatsApp
    window.location.href = whatsappUrl;
  };

  // Pantalla de éxito
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">¡Pedido Enviado!</h1>
          <p className="text-stone-600 mb-6">
            Tu pedido ha sido enviado por WhatsApp. Te contactaremos pronto para confirmar.
          </p>
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Método de pago:</strong> {paymentMethod === 'efectivo' ? 'Efectivo contra entrega' : `${paymentMethod.toUpperCase()}`}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-stone-600" />
          </Link>
          <h1 className="text-3xl font-bold text-stone-800">Finalizar Pedido</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos de contacto */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600" />
                  Datos de Contacto
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-stone-200'
                      }`}
                      placeholder="Juan Pérez"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">Campo obligatorio</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono / WhatsApp *</label>
                    <div className="flex">
                      <div className="flex items-center px-3 py-3 bg-stone-100 border border-r-0 border-stone-200 rounded-l-xl">
                        <span className="text-lg mr-1">🇵🇪</span>
                        <span className="text-stone-600 font-medium">+51</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, ''); // Solo números
                          if (value.length === 0 || (value[0] === '9' && value.length <= 9)) {
                            setPhone(value);
                          }
                        }}
                        className={`flex-1 px-4 py-3 border rounded-r-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 ${
                          errors.phone ? 'border-red-500 bg-red-50' : 'border-stone-200'
                        }`}
                        placeholder="946826535"
                        maxLength={9}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">Debe ser un número de 9 dígitos que empiece con 9</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Correo (opcional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  Dirección de Entrega
                </h2>
                
                <div className="space-y-3">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none ${
                      errors.address ? 'border-red-500 bg-red-50' : 'border-stone-200'
                    }`}
                    placeholder="Av. Principal 123, Urbanización, Distrito..."
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">Campo obligatorio</p>}
                  
                  {/* Botón de ubicación actual */}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLoadingLocation}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Detectando ubicación...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        📍 Usar ubicación actual
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  Método de Pago
                </h2>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* Efectivo */}
                  <button
                    type="button"
                    onClick={() => handlePaymentSelect('efectivo')}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'efectivo' 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <Banknote className={`w-8 h-8 ${paymentMethod === 'efectivo' ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span className={`font-medium ${paymentMethod === 'efectivo' ? 'text-amber-700' : 'text-stone-600'}`}>Efectivo</span>
                  </button>

                  {/* Yape */}
                  <button
                    type="button"
                    onClick={() => handlePaymentSelect('yape')}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'yape' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      paymentMethod === 'yape' ? 'bg-purple-600' : 'bg-purple-400'
                    }`}>
                      Y
                    </div>
                    <span className={`font-medium ${paymentMethod === 'yape' ? 'text-purple-700' : 'text-stone-600'}`}>Yape</span>
                  </button>

                  {/* Plin */}
                  <button
                    type="button"
                    onClick={() => handlePaymentSelect('plin')}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'plin' 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      paymentMethod === 'plin' ? 'bg-teal-600' : 'bg-teal-400'
                    }`}>
                      P
                    </div>
                    <span className={`font-medium ${paymentMethod === 'plin' ? 'text-teal-700' : 'text-stone-600'}`}>Plin</span>
                  </button>
                </div>
                {errors.paymentMethod && <p className="text-red-500 text-sm mt-2">Selecciona un método de pago</p>}
              </div>

              {/* Notas */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-stone-800 mb-4">Notas adicionales (opcional)</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                  placeholder="Ej: Sin cebolla, extra salsa, tocar timbre..."
                />
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  `Enviar Pedido por WhatsApp - S/ ${total.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-bold text-stone-800 mb-4">Tu Pedido</h3>
              
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">
                      🍽️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 truncate">{item.title}</p>
                      <p className="text-sm text-stone-500">x{item.quantity}</p>
                    </div>
                    <p className="font-bold text-amber-600">S/ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-stone-200 pt-4 space-y-2">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery</span>
                  <span className="font-medium">S/ {delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-stone-800 pt-2 border-t border-stone-200">
                  <span>Total</span>
                  <span className="text-amber-600">S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}