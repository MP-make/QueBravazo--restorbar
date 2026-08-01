-- =====================================================
-- ESQUEMA DE BASE DE DATOS — ¡Qué Bravazo! Restobar
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. CATEGORÍAS
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  menu_type TEXT DEFAULT 'ambos' CHECK (menu_type IN ('criollo', 'rapida', 'ambos')),
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MAPEO DE PRODUCTOS VENTIFY → CATEGORÍAS LOCALES
CREATE TABLE product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ventify_id TEXT UNIQUE NOT NULL,
  sku TEXT DEFAULT '',
  title TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  image TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  menu_types TEXT[] DEFAULT '{criollo,rapida}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. HORARIOS DE MENÚ
CREATE TABLE menu_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_type TEXT NOT NULL CHECK (menu_type IN ('criollo', 'rapida')),
  label TEXT DEFAULT '',
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MEDIA (imágenes, videos, gifs)
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'gif')),
  url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  section TEXT NOT NULL DEFAULT 'hero',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. USUARIOS ADMIN
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  dni TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'staff', 'chef', 'owner')),
  password_hash TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_admin_users_dni ON admin_users (dni) WHERE dni IS NOT NULL AND dni <> '';

-- 6. CONFIGURACIONES GENERALES (key-value)
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_product_mappings_category ON product_mappings(category_id);
CREATE INDEX idx_product_mappings_active ON product_mappings(is_active);
CREATE INDEX idx_product_mappings_ventify ON product_mappings(ventify_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_order ON categories(display_order);
CREATE INDEX idx_menu_schedules_active ON menu_schedules(is_active);
CREATE INDEX idx_media_section ON media(section);
CREATE INDEX idx_media_active ON media(is_active);

-- =====================================================
-- TRIGGER: actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_product_mappings_updated_at
  BEFORE UPDATE ON product_mappings FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_menu_schedules_updated_at
  BEFORE UPDATE ON menu_schedules FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_media_updated_at
  BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_admin_users_updated_at
  BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Tu primer admin (cambia el email)
-- INSERT INTO admin_users (email, name, role) VALUES ('tu@email.com', 'Super Admin', 'superadmin');

-- Horarios por defecto
INSERT INTO menu_schedules (menu_type, label, day_of_week, start_time, end_time) VALUES
  ('criollo', 'Menú Criollo (Lun-Dom 12pm-6pm)', NULL, '12:00', '18:00'),
  ('rapida', 'Comida Rápida (Lun-Dom 6pm-12am)', NULL, '18:00', '00:00');
