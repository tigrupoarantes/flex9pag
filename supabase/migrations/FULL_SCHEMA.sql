-- ============================================================
-- flex9pag — Schema Completo
-- Execute no Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Extensão
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (dados do MEI, 1:1 com auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name                 text NOT NULL DEFAULT '',
  cpf                       text,
  cnpj                      text,
  mei_name                  text,
  phone                     text,
  service_description       text,
  cnae_code                 text,
  city                      text,
  state                     char(2),
  role                      text NOT NULL DEFAULT 'user',
  nfse_provider             text,
  nfse_credentials          jsonb,
  mercadopago_access_token  text,
  stripe_account_id         text,
  payment_gateway           text,
  das_day                   smallint NOT NULL DEFAULT 20,
  onboarding_completed      boolean NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin')),
  CONSTRAINT profiles_gateway_check CHECK (payment_gateway IN ('mercadopago', 'stripe', 'both') OR payment_gateway IS NULL)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (id = auth.uid());

-- Criar perfil automaticamente ao registrar novo usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- 2. CLIENTS (clientes do MEI)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_name ON clients(user_id, name);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_own" ON clients FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 3. SERVICES (receitas / fretes — tabela central)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_date ON services(user_id, service_date DESC);
CREATE INDEX IF NOT EXISTS idx_services_user_status ON services(user_id, status);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_own" ON services FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 4. PAYMENT_LINKS (links de cobrança MP/Stripe)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_external_id ON payment_links(external_id);

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_links_own" ON payment_links FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 5. NFSE_INVOICES (notas fiscais de serviço)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_nfse_user_id ON nfse_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_nfse_external_id ON nfse_invoices(external_id);

ALTER TABLE nfse_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nfse_invoices_own" ON nfse_invoices FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 6. DAS_PAYMENTS (controle do DAS mensal)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_das_user_id ON das_payments(user_id);

ALTER TABLE das_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "das_payments_own" ON das_payments FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 7. WEBHOOK_EVENTS (fila idempotente — sem RLS)
-- ============================================================
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
-- Sem RLS: acesso apenas via service_role key

-- ============================================================
-- 8. FK CIRCULARES em services
-- ============================================================
ALTER TABLE services
  ADD CONSTRAINT fk_services_nfse
    FOREIGN KEY (nfse_id) REFERENCES nfse_invoices(id) ON DELETE SET NULL;

ALTER TABLE services
  ADD CONSTRAINT fk_services_payment_link
    FOREIGN KEY (payment_link_id) REFERENCES payment_links(id) ON DELETE SET NULL;

-- ============================================================
-- 9. PLANS (planos de assinatura do SaaS)
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  price_monthly         numeric(8,2) NOT NULL,
  max_nfse_per_month    integer,
  features              jsonb,
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON plans FOR SELECT USING (true);

INSERT INTO plans (name, price_monthly, max_nfse_per_month, features) VALUES
  ('Trial',  0.00, 5,    '{"payment_links": true, "nfse": true, "das": true, "reports": false}'),
  ('Básico', 29.90, 10,  '{"payment_links": true, "nfse": true, "das": true, "reports": false}'),
  ('Pro',    49.90, null,'{"payment_links": true, "nfse": true, "das": true, "reports": true}')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. SUBSCRIPTIONS (assinatura de cada MEI)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id                 uuid REFERENCES plans(id),
  status                  text NOT NULL DEFAULT 'trial',
  trial_ends_at           timestamptz,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  stripe_subscription_id  text,
  mp_subscription_id      text,
  cancelled_at            timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_status_check CHECK (
    status IN ('active', 'trial', 'past_due', 'cancelled')
  ),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_own_read" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- 11. ADMIN_ACTIONS (log de ações administrativas)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_actions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   uuid NOT NULL REFERENCES auth.users(id),
  target_user_id  uuid NOT NULL REFERENCES auth.users(id),
  action          text NOT NULL,
  reason          text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_actions_action_check CHECK (
    action IN ('block', 'unblock', 'change_plan', 'cancel', 'trial_extend')
  )
);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_actions_admin_only" ON admin_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- 12. TRIGGERS updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at     BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clients_updated_at      BEFORE UPDATE ON clients      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_updated_at     BEFORE UPDATE ON services     FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payment_links_updated_at BEFORE UPDATE ON payment_links FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_nfse_invoices_updated_at BEFORE UPDATE ON nfse_invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_das_payments_updated_at  BEFORE UPDATE ON das_payments  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- 13. FUNÇÃO seed_das_for_user (criar guias DAS do ano)
-- ============================================================
CREATE OR REPLACE FUNCTION seed_das_for_user(p_user_id uuid)
RETURNS void AS $$
DECLARE
  current_year int := EXTRACT(YEAR FROM CURRENT_DATE)::int;
  m int;
  competence date;
  due date;
BEGIN
  FOR m IN 1..12 LOOP
    competence := make_date(current_year, m, 1);
    due := make_date(
      EXTRACT(YEAR FROM (competence + INTERVAL '1 month'))::int,
      EXTRACT(MONTH FROM (competence + INTERVAL '1 month'))::int,
      20
    );
    INSERT INTO das_payments (user_id, competence_month, due_date, amount, status)
    VALUES (
      p_user_id, competence, due, 75.60,
      CASE WHEN due < CURRENT_DATE THEN 'overdue' ELSE 'pending' END
    )
    ON CONFLICT (user_id, competence_month) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
