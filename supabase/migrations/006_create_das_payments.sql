CREATE TABLE IF NOT EXISTS das_payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competence_month  date NOT NULL,
  amount            numeric(8,2),
  due_date          date NOT NULL,
  status            text NOT NULL DEFAULT 'pending',
  paid_at           date,
  receipt_url       text,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT das_status_check CHECK (status IN ('pending', 'paid', 'overdue')),
  UNIQUE (user_id, competence_month)
);

CREATE INDEX idx_das_user_id ON das_payments(user_id);

ALTER TABLE das_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "das_payments_own" ON das_payments
  FOR ALL USING (user_id = auth.uid());
