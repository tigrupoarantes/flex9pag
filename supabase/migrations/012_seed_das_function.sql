-- Função para criar guias DAS do ano para um usuário
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
    -- Vencimento: dia 20 do mês seguinte
    due := (make_date(current_year, m, 1) + INTERVAL '1 month')::date;
    due := make_date(EXTRACT(YEAR FROM due)::int, EXTRACT(MONTH FROM due)::int, 20);

    INSERT INTO das_payments (user_id, competence_month, due_date, amount, status)
    VALUES (
      p_user_id,
      competence,
      due,
      75.60,
      CASE
        WHEN due < CURRENT_DATE AND m < EXTRACT(MONTH FROM CURRENT_DATE) THEN 'overdue'
        ELSE 'pending'
      END
    )
    ON CONFLICT (user_id, competence_month) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
