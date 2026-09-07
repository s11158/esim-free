-- Заказ помнит, у какого поставщика его исполнять, сколько раз пробовали и
-- дошло ли письмо с QR до клиента. Старые строки считаются eSimerge.
ALTER TABLE orders ADD COLUMN source TEXT NOT NULL DEFAULT 'esimerge';
ALTER TABLE orders ADD COLUMN source_plan_id TEXT;
ALTER TABLE orders ADD COLUMN fulfillment_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN fulfillment_error TEXT;
ALTER TABLE orders ADD COLUMN email_status TEXT NOT NULL DEFAULT 'not_sent';
ALTER TABLE orders ADD COLUMN email_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN email_error TEXT;
ALTER TABLE orders ADD COLUMN email_sent_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_orders_paid_unfinished
  ON orders(status, fulfillment_status, email_status)
  WHERE status = 'paid';
