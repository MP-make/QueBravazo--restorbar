ALTER TABLE waiter_orders
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_waiter_orders_archived ON waiter_orders(archived);
