CREATE TABLE IF NOT EXISTS services (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id             uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name_snapshot  text NOT NULL DEFAULT '',
  description           text NOT NULL,
  service_date          date NOT NULL,
  amount                numeric(12,2) NOT NULL,
  status                text NOT NULL DEFAULT 'pending',
  paid_at               timestamptz,
  payment_method        text,
  notes                 text,
  nfse_id               uuid,
  payment_link_id       uuid,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT services_status_check CHECK (status IN ('pending', 'paid', 'cancelled')),
  CONSTRAINT services_payment_method_check CHECK (
    payment_method IN ('pix', 'boleto', 'credit_card', 'transfer', 'cash', 'other')
    OR payment_method IS NULL
  )
);

CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_user_date ON services(user_id, service_date DESC);
CREATE INDEX idx_services_user_status ON services(user_id, status);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_own" ON services
  FOR ALL USING (user_id = auth.uid());
