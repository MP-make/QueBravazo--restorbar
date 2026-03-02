// types/index.ts

// Los 3 modos de operación de tu app
export type AppMode = 'delivery' | 'waiter' | 'menu';

export interface Product {
  id: string;
  sku?: string;        // SKU de Ventify (ej: 'Hamb-005', 'Fri-001')
  title: string;       // Mapeado desde 'name' de Ventify
  price: number;
  image: string;       // Mapeado desde 'imageUrl'
  category: string;
  description?: string;
  stock: number;
  featured?: boolean;  // Producto destacado en landing
  isMenuDelDia?: boolean; // Si es parte del menú del día (configurado en Ventify)
  minPrice?: number;   // Precio mínimo permitido para descuentos (desde Ventify)
}

export interface CartItem extends Product {
  quantity: number;
  notes?: string;      // Ej: "Sin mayonesa" (Importante para meseros/delivery)
}

// Estructura para enviar el pedido a Ventify
export interface OrderPayload {
  customer: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
  };
  tableNumber?: string; // Exclusivo para modo 'waiter'
  notes?: string;       // Notas generales + info de pago
  paymentMethod?: string; // 'Efectivo', 'Yape', 'Plin', etc.
  type?: 'DELIVERY' | 'DINE_IN';
  items: {
    id: string;
    title: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  total: number;
}