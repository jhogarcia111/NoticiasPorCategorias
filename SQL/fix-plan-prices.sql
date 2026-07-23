-- CORREGIR PRECIOS A COP (Wompi Colombia solo acepta COP)
-- Pro: $110.000 COP = 11000000 cents
-- Business: $300.000 COP = 30000000 cents
-- Pionero: $10.000 COP = 1000000 cents

UPDATE subscription_plans
SET price_in_cents = 11000000, currency = 'COP'
WHERE slug = 'pro';

UPDATE subscription_plans
SET price_in_cents = 30000000, currency = 'COP'
WHERE slug = 'business';

UPDATE subscription_plans
SET price_in_cents = 1000000, currency = 'COP'
WHERE slug = 'pioneer_cofounder';

-- Verificar
SELECT slug, name, price_in_cents, currency FROM subscription_plans ORDER BY price_in_cents;