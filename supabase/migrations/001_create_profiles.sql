-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de perfis (1:1 com auth.users)
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

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (id = auth.uid());

-- Função para criar perfil automaticamente ao criar usuário
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
