-- Planos de assinatura
CREATE TABLE IF NOT EXISTS plans (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  price_monthly         numeric(8,2) NOT NULL,
  max_nfse_per_month    integer,
  features              jsonb,
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- SELECT público para todos verem os planos disponíveis
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON plans FOR SELECT USING (true);

-- Assinaturas dos MEIs
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

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_own_read" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Log de ações administrativas
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
-- Admin pode ver e inserir
CREATE POLICY "admin_actions_admin_only" ON admin_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
