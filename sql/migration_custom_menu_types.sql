-- Remove CHECK constraints that restrict menu_type to only 'criollo'/'rapida'
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_menu_type_check;
ALTER TABLE menu_schedules DROP CONSTRAINT IF EXISTS menu_schedules_menu_type_check;
