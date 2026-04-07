CREATE TABLE IF NOT EXISTS nfse_invoices (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id          uuid REFERENCES services(id) ON DELETE SET NULL,
  client_id           uuid REFERENCES clients(id) ON DELETE SET NULL,
  provider            text NOT NULL DEFAULT 'focusnfe',
  external_id         text,
  protocol_number     text,
  nfse_number         text,
  amount              numeric(12,2) NOT NULL,
  service_description text NOT NULL,
  iss_amount          numeric(12,2),
  status              text NOT NULL DEFAULT 'processing',
  pdf_url             text,
  xml_url             text,
  issued_at           timestamptz,
  error_message       text,
  raw_response        jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT nfse_status_check CHECK (status IN ('processing', 'issued', 'error', 'cancelled'))
);

CREATE INDEX idx_nfse_user_id ON nfse_invoices(user_id);
CREATE INDEX idx_nfse_external_id ON nfse_invoices(external_id);

ALTER TABLE nfse_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nfse_invoices_own" ON nfse_invoices
  FOR ALL USING (user_id = auth.uid());
