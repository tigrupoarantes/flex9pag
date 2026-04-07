CREATE TABLE IF NOT EXISTS clients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  document      text,
  document_type text CHECK (document_type IN ('cpf', 'cnpj')),
  email         text,
  phone         text,
  city          text,
  state         char(2),
  address       text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_user_name ON clients(user_id, name);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_own" ON clients
  FOR ALL USING (user_id = auth.uid());
