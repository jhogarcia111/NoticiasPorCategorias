-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_in_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'COP',
  interval TEXT NOT NULL DEFAULT 'month',
  trial_days INTEGER DEFAULT 0,
  features TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscription Status Enum
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete', 'trialing', 'pending', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  status subscription_status NOT NULL DEFAULT 'pending',
  wompi_payment_source_id TEXT,
  wompi_customer_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_wompi_payment_source ON subscriptions(wompi_payment_source_id);

-- Seed Plans
INSERT INTO subscription_plans (name, slug, description, price_in_cents, currency, interval, trial_days, features)
VALUES
  ('Pro', 'pro', 'Para profesionales que crecen en LinkedIn', 29000, 'COP', 'month', 14,
   ARRAY[
     'Publicaciones ilimitadas',
     'Texto completo sin límites',
     '3 perfiles de LinkedIn',
     '10 categorías de noticias',
     'Calendario inteligente',
     'Programación automática',
     '4 estilos de escritura',
     'Soporte prioritario'
   ]),
  ('Business', 'business', 'Para agencias y equipos', 79000, 'COP', 'month', 14,
   ARRAY[
     'Todo lo de Pro',
     'Perfiles ilimitados de LinkedIn',
     'Categorías ilimitadas',
     'Hasta 3 miembros de equipo',
     'API access',
     'Soporte dedicado 24/7'
   ])
ON CONFLICT (slug) DO NOTHING;
