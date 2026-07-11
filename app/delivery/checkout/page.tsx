"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, MapPin, ArrowLeft, CheckCircle, Banknote, CreditCard, Loader2 } from 'lucide-react';
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

  // Jardines de San Andrés state
  const [isJardines, setIsJardines] = useState(false);
  const [jardinesManzana, setJardinesManzana] = useState('');
  const [jardinesLote, setJardinesLote] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Cálculos SIN IGV
  const subtotal = getTotal();
  const delivery = isJardines ? 0 : PAYMENT_CONFIG.deliveryCost;
  const total = subtotal + delivery;
  const jardinesAddress = isJardines
    ? `Urb. Los Jardines de San Andrés - Mz ${jardinesManzana}, Lt ${jardinesLote}`
    : '';

  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push('/');
    }
  }, [items.length, router, orderSuccess]);

  const handlePaymentSelect = (method: string) => {
    setPaymentMethod(method);
  };

  const reverseGeocode = async (latitude: number, longitude: number, retries = 2): Promise<string> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          { headers: { 'Accept-Language': 'es' } }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data || !data.address) throw new Error('Sin datos de dirección');

        const addr = data.address;
        const parts: string[] = [];
        if (addr.road) {
          let road = addr.road;
          if (addr.house_number) road += ` ${addr.house_number}`;
          parts.push(road);
        }
        if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
        if (addr.city_district) parts.push(addr.city_district);
        parts.push(addr.city || addr.town || addr.village || addr.municipality || '');
        if (addr.state && !parts.some(p => p.includes(addr.state!))) parts.push(addr.state);
        if (data.display_name?.includes('Perú') && !parts.some(p => p.includes('Perú'))) parts.push('Perú');

        const formatted = parts.filter(Boolean).join(', ');
        if (formatted) return formatted;
        return data.display_name || '';
      } catch (err) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
    return '';
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      addToast('Tu navegador no soporta geolocalización', 'error');
      return;
    }

    setIsLoadingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      const formatted = await reverseGeocode(latitude, longitude);

      if (formatted) {
        setAddress(formatted);
        addToast('Ubicación detectada correctamente', 'success');
      } else {
        addToast('No se pudo determinar la dirección. Intenta ingresarla manualmente', 'error');
      }
    } catch (err: unknown) {
      console.error('Error de geolocalización:', err);
      const errCode = (err as { code?: number })?.code;
      let msg = 'No pudimos detectar tu ubicación, ingrésala manualmente';
      if (errCode === 1) msg = 'Permiso de ubicación denegado. Actívalo en tu navegador';
      else if (errCode === 2) msg = 'Ubicación no disponible. Verifica tu GPS';
      else if (errCode === 3) msg = 'Tiempo agotado. Intenta de nuevo';
      addToast(msg, 'error');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Validation
    const newErrors: Record<string, boolean> = {
      name: !customerName.trim(),
      phone: phone.length !== 9 || !phone.startsWith('9'),
      address: isJardines ? false : !address.trim(),
      jardinesManzana: isJardines ? !jardinesManzana.trim() : false,
      jardinesLote: isJardines ? !jardinesLote.trim() : false,
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
    message += `🏠 *Dirección:* ${isJardines ? jardinesAddress : address}\n`;
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-stone-50 to-amber-50 py-3 -mx-3 sm:-mx-4 px-3 sm:px-4 md:px-0 md:static md:bg-none md:py-0 md:mx-0 mb-6 md:mb-8 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 hover:border-stone-300 hover:shadow-sm transition-all font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-stone-800">Finalizar Pedido</h1>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Resumen del Pedido — first in DOM so it appears on top on mobile */}
          <div className="sticky top-14 z-10 lg:top-4 lg:col-start-3 lg:col-end-4 lg:row-start-1 self-start">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
              <h3 className="text-lg md:text-xl font-bold text-stone-800 mb-4">Tu Pedido</h3>
              
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      <Image src={item.image || '/logo_que_bravazo.png'} alt={item.title} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 truncate">{item.title}</p>
                      <p className="text-sm text-stone-500">x{item.quantity}</p>
                    </div>
                    <p className="font-bold text-amber-600">S/ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* ── Datos en vivo ────────────────────────────── */}
              <div className="border-t border-stone-200 pt-3 mb-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">Dirección</span>
                  <span className="font-medium text-stone-700 text-right max-w-[60%] truncate">{isJardines ? jardinesAddress : (address || <span className="text-stone-300 italic">—</span>)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Pago</span>
                  <span className={`font-medium capitalize text-right ${paymentMethod ? 'text-amber-600' : 'text-stone-300 italic'}`}>
                    {paymentMethod === 'efectivo' ? 'Efectivo' : paymentMethod || '—'}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-stone-200 pt-4 space-y-2">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery {isJardines && <span className="text-emerald-600 text-xs font-semibold">(Urb. Jardines)</span>}</span>
                  <span className={`font-medium ${isJardines ? 'text-emerald-600' : ''}`}>
                    {isJardines ? 'Gratis' : `S/ ${delivery.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-stone-800 pt-2 border-t border-stone-200">
                  <span>Total</span>
                  <span className="text-amber-600">S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario — second in DOM, scrolls below summary on mobile */}
          <div className="lg:col-start-1 lg:col-end-3 lg:row-start-1">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Datos de contacto */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
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
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-stone-900 ${
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
                          const value = e.target.value.replace(/[^0-9]/g, '');
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
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-stone-900"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg md:text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                  Dirección de Entrega
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setIsJardines(!isJardines);
                    if (!isJardines) {
                      setAddress('');
                      setJardinesManzana('');
                      setJardinesLote('');
                    }
                  }}
                  className={`w-full p-3 sm:p-4 border-2 rounded-xl flex items-center gap-2 sm:gap-3 transition-all mb-4 ${
                    isJardines
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className={`min-w-[18px] w-[18px] h-[18px] sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isJardines ? 'bg-emerald-500 border-emerald-500' : 'border-stone-400'
                  }`}>
                    {isJardines && <span className="text-white text-[10px] sm:text-xs font-bold">✓</span>}
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`font-semibold text-sm sm:text-base ${isJardines ? 'text-emerald-800' : 'text-stone-700'}`}>
                      Urb. Los Jardines de San Andrés
                    </p>
                    <p className={`text-[11px] sm:text-xs ${isJardines ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {isJardines ? '✓ Delivery gratuito' : 'Delivery gratuito'}
                    </p>
                  </div>
                  {isJardines && (
                    <span className="ml-auto bg-emerald-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                      Gratis
                    </span>
                  )}
                </button>

                {isJardines ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Manzana *</label>
                        <input
                          type="text"
                          value={jardinesManzana}
                          onChange={(e) => setJardinesManzana(e.target.value.toUpperCase())}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-stone-900 ${
                            errors.jardinesManzana ? 'border-red-500 bg-red-50' : 'border-stone-200'
                          }`}
                          placeholder="Ej: A, B, C..."
                        />
                        {errors.jardinesManzana && <p className="text-red-500 text-sm mt-1">Campo obligatorio</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Lote *</label>
                        <input
                          type="text"
                          value={jardinesLote}
                          onChange={(e) => setJardinesLote(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-stone-900 ${
                            errors.jardinesLote ? 'border-red-500 bg-red-50' : 'border-stone-200'
                          }`}
                          placeholder="Ej: 1, 2, 3..."
                        />
                        {errors.jardinesLote && <p className="text-red-500 text-sm mt-1">Campo obligatorio</p>}
                      </div>
                    </div>
                    {jardinesManzana && jardinesLote && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <p className="text-xs text-emerald-700 font-medium mb-1">📍 Dirección completa:</p>
                        <p className="text-sm text-emerald-800 font-semibold">{jardinesAddress}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-stone-900 ${
                        errors.address ? 'border-red-500 bg-red-50' : 'border-stone-200'
                      }`}
                      placeholder="Av. Principal 123, Urbanización, Distrito..."
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">Campo obligatorio</p>}

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

                    <p className="text-[11px] text-stone-400 italic leading-relaxed mt-1">
                      * compartenos tu ubicación actual por WhatsApp para ubicarte mejor
                    </p>
                  </div>
                )}
              </div>

              {/* Método de Pago */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg md:text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                  Método de Pago
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                  <button
                    type="button"
                    onClick={() => handlePaymentSelect('yape')}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'yape' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="w-8 h-8 relative">
                      <Image src="/icono-yape.png" alt="Yape" fill className="object-contain" />
                    </div>
                    <span className={`font-medium ${paymentMethod === 'yape' ? 'text-purple-700' : 'text-stone-600'}`}>Yape</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePaymentSelect('plin')}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'plin' 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="w-8 h-8 relative">
                      <Image src="/icono-plin.png" alt="Plin" fill className="object-contain" />
                    </div>
                    <span className={`font-medium ${paymentMethod === 'plin' ? 'text-teal-700' : 'text-stone-600'}`}>Plin</span>
                  </button>
                </div>
                {errors.paymentMethod && <p className="text-red-500 text-sm mt-2">Selecciona un método de pago</p>}
              </div>

              {/* Notas */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg md:text-xl font-bold text-stone-800 mb-4">Notas adicionales <span className="text-stone-400 font-normal">(opcional)</span></h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-stone-900"
                  placeholder="Ej: Sin cebolla, extra salsa, tocar timbre..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 md:py-4 rounded-xl font-bold text-sm md:text-lg shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </div>
  );
}