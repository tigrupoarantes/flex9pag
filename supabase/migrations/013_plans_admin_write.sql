-- Permite admins (profiles.role = 'admin') escrever na tabela plans.
-- Mantém a policy plans_public_read intacta para SELECT continuar livre.
--
-- FOR ALL cobre INSERT/UPDATE/DELETE em uma única policy.

DROP POLICY IF EXISTS "plans_admin_write" ON plans;

CREATE POLICY "plans_admin_write" ON plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
