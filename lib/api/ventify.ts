// lib/api/ventify.ts
import { Product, OrderPayload } from '@/types';

// Variables de entorno (solo disponibles en el cliente con NEXT_PUBLIC_)
const API_URL = process.env.NEXT_PUBLIC_VENTIFY_API_URL;
const ACCOUNT_ID = process.env.NEXT_PUBLIC_VENTIFY_ACCOUNT_ID;
const API_KEY = process.env.NEXT_PUBLIC_VENTIFY_API_KEY;

// --- FUNCIÓN 1: OBTENER PRODUCTOS (GET) ---
export const fetchProducts = async (): Promise<Product[]> => {
  if (!API_URL || !ACCOUNT_ID || !API_KEY) {
    console.error('❌ Faltan variables de entorno:', { API_URL, ACCOUNT_ID: ACCOUNT_ID ? '✓' : '✗', API_KEY: API_KEY ? '✓' : '✗' });
    return [];
  }

  // Verificar si son valores placeholder
  const isPlaceholder = 
    ACCOUNT_ID?.includes('tu_account') || 
    ACCOUNT_ID?.includes('_de_ventify') ||
    API_KEY?.includes('tu_api') ||
    API_KEY?.includes('_de_ventify');
    
  if (isPlaceholder) {
    console.warn('⚠️ Usando credenciales placeholder');
    return [];
  }

  const endpoint = `${API_URL}/api/public/stores/${ACCOUNT_ID}/products?active=true`;
  
  console.log('🌐 Llamando a Ventify API:', endpoint);

  try {
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('📡 Respuesta HTTP:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en API:', errorText);
      return [];
    }

    const json = await response.json();
    console.log('📦 Respuesta JSON:', json);
    
    const ventifyProducts = json.data || [];
    console.log('✅ Productos encontrados:', ventifyProducts.length);

    // MAPEO: Convertir formato Ventify -> Formato Restaurante
    return ventifyProducts.map((item: any) => ({
      id: item.id,
      title: item.name,
      price: item.price,
      image: item.imageUrl || 'https://via.placeholder.com/300?text=Sin+Foto',
      category: item.category || 'Otros',
      description: item.description || '',
      stock: item.stock || 0,
      featured: item.isFeatured || false,
      isMenuDelDia: item.isMenuDelDia || false,
      minPrice: item.minPrice || item.price * 0.5,
    }));

  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    return [];
  }
};

// --- FUNCIÓN 2: ENVIAR PEDIDO (POST) ---
export const createOrder = async (payload: OrderPayload): Promise<any> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'No se pudo enviar el pedido');
    }

    const result = await response.json();
    console.log("✅ Pedido creado exitosamente:", result);
    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};