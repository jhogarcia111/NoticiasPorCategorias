import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { sql } from "drizzle-orm"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) { console.error("DATABASE_URL not set"); process.exit(1) }

  const db = drizzle(neon(url))

  const existing = await db.execute(sql`SELECT id FROM subscription_plans WHERE slug = 'pioneer_cofounder' LIMIT 1`)
  if (!existing.rows?.length) {
    console.log("Creando Pionero Cofundador...")
    await db.execute(sql`
      INSERT INTO subscription_plans (name, slug, description, price_in_cents, currency, interval, trial_days, features, is_active)
      VALUES (
        'Pionero Cofundador',
        'pioneer_cofounder',
        '50% descuento por lanzamiento. Precio especial pioneros de por vida.',
        1000000, 'COP', 'month', 0,
        ARRAY['5 publicaciones por mes','Texto completo sin límites','3 perfiles de LinkedIn','10 categorías de noticias','Calendario inteligente','Programación automática','4 estilos de escritura','Soporte prioritario','Precio congelado de por vida'],
        true
      )
    `)
  } else {
    console.log("Actualizando features Pionero...")
    await db.execute(sql`
      UPDATE subscription_plans SET features = ARRAY['5 publicaciones por mes','Texto completo sin límites','3 perfiles de LinkedIn','10 categorías de noticias','Calendario inteligente','Programación automática','4 estilos de escritura','Soporte prioritario','Precio congelado de por vida']
      WHERE slug = 'pioneer_cofounder'
    `)
  }

  console.log("Corrigiendo Pro...")
  await db.execute(sql`UPDATE subscription_plans SET price_in_cents = 11000000, currency = 'COP' WHERE slug = 'pro'`)

  console.log("Corrigiendo Business...")
  await db.execute(sql`UPDATE subscription_plans SET price_in_cents = 30000000, currency = 'COP' WHERE slug = 'business'`)

  const result = await db.execute(sql`SELECT slug, name, price_in_cents, currency FROM subscription_plans ORDER BY price_in_cents`)
  console.log("\nPlanes actualizados:")
  console.table(result.rows)
}

main().catch(console.error)