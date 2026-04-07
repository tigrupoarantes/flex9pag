CREATE TABLE IF NOT EXISTS payment_links (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id        uuid REFERENCES services(id) ON DELETE SET NULL,
  client_id         uuid REFERENCES clients(id) ON DELETE SET NULL,
  gateway           text NOT NULL,
  external_id       text,
  amount            numeric(12,2) NOT NULL,
  description       text NOT NULL,
  url               text NOT NULL,
  status            text NOT NULL DEFAULT 'active',
  paid_at           timestamptz,
  expires_at        timestamptz,
  gateway_metadata  jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_links_gateway_check CHECK (gateway IN ('mercadopago', 'stripe')),
  CONSTRAINT payment_links_status_check CHECK (status IN ('active', 'paid', 'expired', 'cancelled'))
);

CREATE INDEX idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX idx_payment_links_external_id ON payment_links(external_id);

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_links_own" ON payment_links
  FOR ALL USING (user_id = auth.uid());
