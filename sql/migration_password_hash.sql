-- Agregar columna password_hash a admin_users
-- Ejecutar en Supabase SQL Editor (una sola vez)

ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';

-- Crear índice para búsqueda rápida por email
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
