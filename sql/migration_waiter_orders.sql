CREATE TABLE IF NOT EXISTS waiter_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waiter_id UUID NOT NULL REFERENCES admin_users(id),
  waiter_name TEXT NOT NULL,
  table_number TEXT,
  order_type TEXT NOT NULL CHECK (order_type IN ('mesa', 'llevar')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  takeaway_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'served', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('efectivo', 'yape')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waiter_orders_waiter_id ON waiter_orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_waiter_orders_status ON waiter_orders(status);
