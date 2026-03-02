"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, MapPin, ArrowLeft, CheckCircle, CreditCard, Banknote, Loader2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cart';
import { useToastStore } from '@/lib/stores/toast';

const WHATSAPP_NUMBER = '51907326121';
const DELIVERY_COST = 5;

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const { addToast } = useToastStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [operationNumber, setOperationNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  const subtotal = getTotal();
  const total = subtotal + DELIVERY_COST;

  useEffect(() => {
    if (items.length === 0 && !orderSent) router.push('/');
  }, [items.length, router, orderSent]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) { addToast('Tu navegador no soporta geolocalización', 'error'); return; }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, { headers: { 'Accept-Language': 'es' } });
          const data = await res.json();
          const parts = [data.address.road, data.address.house_number, data.address.suburb, data.address.city || data.address.town].filter(Boolean);
          setAddress(parts.length > 0 ? parts.join(', ') : data.display_name);
          addToast('✅ Ubicación detectada', 'success');
        } catch { addToast('No se pudo obtener la dirección', 'error'); }
        finally { setIsLoadingLocation(false); }
      },
      (err) => {
        const msgs: Record<number, string> = { 1: 'Permiso de ubicación denegado', 2: 'Ubicación no disponible', 3: 'Tiempo agotado' };
        addToast(msgs[err.code] || 'Error de ubicación', 'error');
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const buildWhatsAppMessage = () => {
    const lines = [
      `🛵 *NUEVO PEDIDO - ¡Qué Bravazo!*`,
      ``,
      `👤 *Cliente:* ${customerName}`,
      `📞 *Teléfono:* ${phone}`,
      `📍 *Dirección:* ${address}`,
      email ? `📧 *Correo:* ${email}` : null,
      ``,
      `🍽️ *Productos:*`,
      ...items.map(i => `  • ${i.title} x${i.quantity} — S/ ${(i.price * i.quantity).toFixed(2)}`),
      ``,
      `💰 *Subtotal:* S/ ${subtotal.toFixed(2)}`,
      `🛵 *Delivery:* S/ ${DELIVERY_COST.toFixed(2)}`,
      `✅ *TOTAL: S/ ${total.toFixed(2)}*`,
      ``,
      `💳 *Pago:* ${paymentMethod === 'efectivo' ? 'Efectivo contra entrega' : paymentMethod.toUpperCase()}`,
      operationNumber ? `🔢 *Nro. Operación:* ${operationNumber}` : null,
      notes ? `📝 *Notas:* ${notes}` : null,
    ].filter(l => l !== null).join('\n');

    return encodeURIComponent(lines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, boolean> = {
      name: !customerName.trim(),
      phone: phone.length !== 9 || !phone.startsWith('9'),
      address: !address.trim(),
      paymentMethod: !paymentMethod,
      operationNumber: (paymentMethod === 'yape' || paymentMethod === 'plin') && !operationNumber.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    const msg = buildWhatsAppMessage();
    setOrderSent(true);
    clearCart();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  if (orderSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">¡Pedido Enviado!</h1>
          <p className="text-stone-500 mb-6">
            Tu pedido fue enviado por WhatsApp. Te contactaremos pronto para confirmar la entrega.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-green-800 font-semibold mb-1">¿No se abrió WhatsApp?</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-700 underline"
            >
              Haz clic aquí para abrir WhatsApp manualmente
            </a>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 py-8">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <h1 className="text-2xl font-bold text-stone-800">Finalizar Pedido</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Formulario ────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">

            {/* Datos de contacto */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" /> Datos de Contacto
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Nombre Completo *</label>
                  <input
                    type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                    placeholder="Juan Pérez"
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-stone-200'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">Campo obligatorio</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel" value={phone}
                    onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (!v || (v[0] === '9' && v.length <= 9)) setPhone(v); }}
                    placeholder="999888777" maxLength={9}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-stone-200'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">Número de 9 dígitos comenzando con 9</p>}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-stone-600 mb-1">Correo (opcional)</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" /> Dirección de Entrega
              </h2>
              <textarea
                value={address} onChange={e => setAddress(e.target.value)} rows={3}
                placeholder="Av. Principal 123, Urbanización, Distrito..."
                className={`w-full px-4 py-3 border rounded-xl text-sm resize-none focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all ${errors.address ? 'border-red-400 bg-red-50' : 'border-stone-200'}`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">Campo obligatorio</p>}
              <button
                type="button" onClick={handleUseCurrentLocation} disabled={isLoadingLocation}
                className="mt-2 flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
              >
                {isLoadingLocation ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detectando...</> : <>📍 Usar ubicación actual</>}
              </button>
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" /> Método de Pago
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {/* Efectivo */}
                <button type="button" onClick={() => setPaymentMethod('efectivo')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'efectivo' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-stone-300'}`}>
                  <Banknote className={`w-7 h-7 ${paymentMethod === 'efectivo' ? 'text-amber-600' : 'text-stone-400'}`} />
                  <span className={`text-sm font-semibold ${paymentMethod === 'efectivo' ? 'text-amber-700' : 'text-stone-500'}`}>Efectivo</span>
                </button>
                {/* Yape */}
                <button type="button" onClick={() => setPaymentMethod('yape')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'yape' ? 'border-purple-500 bg-purple-50' : 'border-stone-200 hover:border-stone-300'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm ${paymentMethod === 'yape' ? 'bg-purple-600' : 'bg-purple-400'}`}>Y</div>
                  <span className={`text-sm font-semibold ${paymentMethod === 'yape' ? 'text-purple-700' : 'text-stone-500'}`}>Yape</span>
                </button>
                {/* Plin */}
                <button type="button" onClick={() => setPaymentMethod('plin')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'plin' ? 'border-teal-500 bg-teal-50' : 'border-stone-200 hover:border-stone-300'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm ${paymentMethod === 'plin' ? 'bg-teal-600' : 'bg-teal-400'}`}>P</div>
                  <span className={`text-sm font-semibold ${paymentMethod === 'plin' ? 'text-teal-700' : 'text-stone-500'}`}>Plin</span>
                </button>
              </div>
              {errors.paymentMethod && <p className="text-red-500 text-xs mt-2">Selecciona un método de pago</p>}

              {/* Número de operación — solo Yape / Plin */}
              {(paymentMethod === 'yape' || paymentMethod === 'plin') && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <label className="block text-sm font-semibold text-amber-800 mb-2">
                    Número de Operación * <span className="font-normal text-amber-600">(después de pagar)</span>
                  </label>
                  <input
                    type="text" value={operationNumber} onChange={e => setOperationNumber(e.target.value)}
                    placeholder="Ej: 123456789"
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all ${errors.operationNumber ? 'border-red-400 bg-red-50' : 'border-amber-300 bg-white'}`}
                  />
                  {errors.operationNumber && <p className="text-red-500 text-xs mt-1">Ingresa el número de operación</p>}
                </div>
              )}
            </div>

            {/* Notas */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-bold text-stone-800 mb-3">Notas adicionales <span className="text-stone-400 font-normal">(opcional)</span></h2>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Ej: Sin cebolla, extra salsa, tocar timbre..."
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Botón confirmar */}
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-5 h-5" />
              Confirmar Pedido por WhatsApp — S/ {total.toFixed(2)}
            </button>
            <p className="text-center text-xs text-stone-400 -mt-2">
              Se abrirá WhatsApp con tu pedido listo para enviar 📲
            </p>
          </form>

          {/* ── Resumen del pedido ──────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-6">
              <h3 className="font-bold text-stone-800 mb-4">Tu Pedido</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      <Image src={item.image || '/bravazo-logo.jpeg'} alt={item.title} fill className="object-cover" sizes="44px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">{item.title}</p>
                      <p className="text-xs text-stone-400">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-amber-600 flex-shrink-0">S/ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-100 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span><span className="font-medium text-stone-700">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Delivery</span><span className="font-medium text-stone-700">S/ {DELIVERY_COST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-800 pt-1 border-t border-stone-100 text-base">
                  <span>Total</span><span className="text-amber-600">S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}