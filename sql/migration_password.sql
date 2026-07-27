-- Agregar columna password_hash a admin_users
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';

-- Actualizar tu admin con una contraseña (ejecutar DESPUES de generar el hash)
-- UPDATE admin_users SET password_hash = 'EL_HASH_QUE_GENERASTE' WHERE email = 'mp@mp.com';
