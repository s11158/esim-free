CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  access_token_hash TEXT NOT NULL UNIQUE,
  request_fingerprint TEXT NOT NULL,
  email TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  country TEXT NOT NULL,
  data_label TEXT NOT NULL,
  validity_days INTEGER NOT NULL,
  base_amount_micros INTEGER NOT NULL,
  unique_amount_micros INTEGER NOT NULL,
  suffix INTEGER NOT NULL CHECK (suffix BETWEEN 1 AND 99),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'expired', 'manual_review')),
  fulfillment_status TEXT NOT NULL DEFAULT 'not_started' CHECK (fulfillment_status IN ('not_started', 'manual_required', 'fulfilled', 'failed')),
  txid TEXT,
  payer_address TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  paid_at INTEGER,
  fulfilled_at INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_pending_amount
  ON orders(unique_amount_micros)
  WHERE status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_txid
  ON orders(txid)
  WHERE txid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_pending_expiry
  ON orders(status, expires_at);

CREATE INDEX IF NOT EXISTS idx_orders_fingerprint_created
  ON orders(request_fingerprint, created_at);

CREATE TABLE IF NOT EXISTS payment_events (
  txid TEXT PRIMARY KEY,
  amount_micros INTEGER NOT NULL,
  payer_address TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  block_timestamp INTEGER NOT NULL,
  matched_order_id TEXT,
  first_seen_at INTEGER NOT NULL,
  FOREIGN KEY (matched_order_id) REFERENCES orders(id)
);
