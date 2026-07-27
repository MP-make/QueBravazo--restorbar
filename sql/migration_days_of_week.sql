-- Agregar columna days_of_week como array de enteros (0=Domingo, 6=Sabado)
ALTER TABLE menu_schedules ADD COLUMN IF NOT EXISTS days_of_week INTEGER[] DEFAULT NULL;

-- Migrar datos existentes: si day_of_week no es null, pasar a array de 1 elemento
UPDATE menu_schedules SET days_of_week = ARRAY[day_of_week] WHERE day_of_week IS NOT NULL AND days_of_week IS NULL;

-- Si day_of_week es null (todos los dias), poner array con todos los dias
UPDATE menu_schedules SET days_of_week = ARRAY[0,1,2,3,4,5,6] WHERE day_of_week IS NULL AND days_of_week IS NULL;
