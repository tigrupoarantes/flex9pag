-- Sem RLS — acesso apenas via service role key
CREATE TABLE IF NOT EXISTS webhook_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway       text NOT NULL,
  event_type    text NOT NULL,
  external_id   text NOT NULL,
  payload       jsonb NOT NULL,
  processed     boolean NOT NULL DEFAULT false,
  processed_at  timestamptz,
  error         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (external_id)
);

-- Sem RLS nesta tabela (acesso via service role)
ALTER TABLE webhook_events DISABLE ROW LEVEL SECURITY;
