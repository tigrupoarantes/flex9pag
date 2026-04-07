-- Planos iniciais do flex9pag
INSERT INTO plans (name, price_monthly, max_nfse_per_month, features) VALUES
  (
    'Trial',
    0.00,
    5,
    '{"payment_links": true, "nfse": true, "das": true, "reports": false}'::jsonb
  ),
  (
    'Básico',
    29.90,
    10,
    '{"payment_links": true, "nfse": true, "das": true, "reports": false}'::jsonb
  ),
  (
    'Pro',
    49.90,
    NULL,
    '{"payment_links": true, "nfse": true, "das": true, "reports": true}'::jsonb
  )
ON CONFLICT DO NOTHING;
