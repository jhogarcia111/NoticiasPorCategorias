-- CORREGIR PRECIOS EN DB
-- La DB tiene priceInCents incorrectos (29000 en vez de 2900, 79000 en vez de 7900)
-- Ejecutar en Neon SQL Editor

UPDATE subscription_plans
SET price_in_cents = 2900, currency = 'USD'
WHERE slug = 'pro' AND price_in_cents != 2900;

UPDATE subscription_plans
SET price_in_cents = 7900, currency = 'USD'
WHERE slug = 'business' AND price_in_cents != 7900;

UPDATE subscription_plans
SET price_in_cents = 1000000, currency = 'COP'
WHERE slug = 'pioneer_cofounder' AND price_in_cents != 1000000;

-- Verificar
SELECT slug, name, price_in_cents, currency FROM subscription_plans ORDER BY price_in_cents;