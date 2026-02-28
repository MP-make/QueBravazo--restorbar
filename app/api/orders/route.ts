import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_VENTIFY_API_URL;
const ACCOUNT_ID = process.env.NEXT_PUBLIC_VENTIFY_ACCOUNT_ID;
const API_KEY = process.env.NEXT_PUBLIC_VENTIFY_API_KEY;

export async function POST(request: Request) {
  if (!API_URL || !ACCOUNT_ID || !API_KEY) {
    return NextResponse.json({ error: 'Configuración no disponible' }, { status: 500 });
  }

  try {
    const payload = await request.json();

    const endpoint = `${API_URL}/api/public/stores/${ACCOUNT_ID}/sale-requests`;

    // Formatear payload para Ventify API
    const ventifyPayload = {
      customerName: payload.customer.name,
      customerEmail: payload.customer.email || "cliente@web.com",
      customerPhone: payload.customer.phone,
      shippingAddress: {
        address: payload.customer.address || "Recojo en tienda"
      },
      preferredPaymentMethod: payload.paymentMethod || 'Efectivo',
      notes: payload.notes || '',
      total: payload.total,
      subtotal: payload.total,
      items: payload.items.map((item: any) => ({
        productId: item.id,
        productName: item.title,
        quantity: item.quantity,
        price: item.price,
        sku: '',
        notes: item.notes || ''
      }))
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(ventifyPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Error Ventify:", errorData);
      return NextResponse.json(
        { error: `Error ${response.status}: ${errorData}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}