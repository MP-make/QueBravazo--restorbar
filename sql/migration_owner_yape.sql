-- Yape por dueño: cada dueño configura su propio Yape, que se usa
-- solo en los pedidos que él crea. Ejecutar en Supabase SQL Editor.
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS yape_qr_url TEXT DEFAULT '';
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS yape_name TEXT DEFAULT '';
