# Ventify Restaurante

Web app para restaurantes en Next.js con 3 modos: delivery (e-commerce), waiter (toma pedidos), menu (carta digital).

## 🔐 Credenciales de Prueba - Sistema de Meseros

### Meseros Activos:

| Nombre | Email | Contraseña | Rol |
|--------|-------|------------|-----|
| Juan Pérez | juan.mesero@ventify.com | mesero123 | Mesero Senior |
| María García | maria.mesero@ventify.com | mesero123 | Mesera |
| Carlos López | carlos.mesero@ventify.com | mesero123 | Mesero |
| Ana Torres | ana.mesero@ventify.com | mesero123 | Mesera |
| Luis Ramírez | luis.mesero@ventify.com | mesero123 | Mesero Junior |

### Administrador:

| Nombre | Email | Contraseña | Rol |
|--------|-------|------------|-----|
| Admin Ventify | admin@ventify.com | admin123 | Administrador |

## 🚀 Acceso al Sistema

1. **Modo Delivery (Clientes)**: `http://localhost:3000/`
2. **Modo Waiter (Meseros)**: `http://localhost:3000/waiter`
3. **Modo Menu (Carta Digital)**: `http://localhost:3000/menu`

## 📋 Uso del Sistema de Meseros

1. Accede a `/waiter`
2. Selecciona una mesa (1-20)
3. Agrega productos al pedido
4. Envía la comanda a cocina
5. El pedido se registra en Ventify con el número de mesa

## 🛠️ Instalación

```bash
npm install
npm run dev
```

## 🔧 Configuración

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_VENTIFY_API_URL=https://ventify.com.pe
NEXT_PUBLIC_VENTIFY_ACCOUNT_ID=tu_account_id
NEXT_PUBLIC_VENTIFY_API_KEY=tu_api_key
```

## 📱 Características

- ✅ Sistema de meseros profesional y responsivo
- ✅ Selección visual de mesas (20 mesas disponibles)
- ✅ Búsqueda y filtros avanzados de productos
- ✅ Panel de comanda en tiempo real
- ✅ Integración con API de Ventify
- ✅ Geolocalización en checkout
- ✅ Múltiples métodos de pago (Efectivo, Yape, Plin)

## 🎨 Vista de Meseros

### Mejoras Implementadas:
- Diseño profesional con gradientes y animaciones
- 20 mesas con estados visuales (disponible/ocupada)
- Sistema de búsqueda de productos en tiempo real
- Filtros por categoría y tipo de menú
- Panel de pedidos mejorado con controles intuitivos
- Totales calculados automáticamente
- Responsive para tablets y móviles

---

**Ventify Restaurante** - Powered by Ventify API
