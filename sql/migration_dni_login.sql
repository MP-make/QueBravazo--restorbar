-- =====================================================
-- MIGRACIÓN: Login por DNI en admin_users
-- Ejecutar en Supabase SQL Editor
-- =====================================================

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS dni TEXT;

-- DNI único para valores reales (permite NULL/vacío para usuarios antiguos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_dni
  ON public.admin_users (dni)
  WHERE dni IS NOT NULL AND dni <> '';
