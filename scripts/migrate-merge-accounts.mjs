// Consolidación de cuentas duplicadas en una sola por grupo de username.
// Uso: node scripts/migrate-merge-accounts.mjs   (requiere DATABASE_URL en entorno)
import { neon } from "@neondatabase/serverless"

const ACTIVE_STATUSES = ["active", "trialing"]

async function main() {
  const sql = neon(process.env.DATABASE_URL)

  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text`

  const profiles = await sql`SELECT id, username, created_at FROM profiles`
  console.log(`Perfiles antes: ${profiles.length}`)

  const groups = new Map()
  for (const p of profiles) {
    const key = (p.username || "").toLowerCase().trim()
    if (!key) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(p)
  }

  const dupes = new Map()
  const subs = await sql(`SELECT user_id FROM subscriptions WHERE status IN ($1, $2)`, ACTIVE_STATUSES)
  const activeIds = new Set(subs.map((s) => s.user_id))

  for (const [key, members] of groups) {
    if (members.length <= 1) continue
    const canonical = members.find((m) => activeIds.has(m.id))?.id
    if (!canonical) {
      members.sort((a, b) => (a.created_at > b.created_at ? 1 : a.created_at < b.created_at ? -1 : a.id > b.id ? 1 : -1))
      dupes.set(key, { canonical: members[0].id, members })
    } else {
      dupes.set(key, { canonical, members })
    }
  }

  const tables = [
    "news",
    "news_ai_results",
    "scheduled_posts",
    "scheduling_configs",
    "linkedin_profiles",
    "subscriptions",
    "generated_images",
    "audits",
  ]

  for (const [, { canonical, members }] of dupes) {
for (const m of members) {
      if (m.id === canonical) continue
      for (const t of tables) {
        await sql(`UPDATE ${t} SET user_id = $1 WHERE user_id = $2`, [canonical, m.id])
      }
      await sql`DELETE FROM profiles WHERE id = ${m.id}`
      console.log(`  ${m.id.slice(0, 8)}… -> ${canonical.slice(0, 8)}…`)
    }
  }

  // Limpiar duplicados de scheduling_configs (unique user_id + linkedin_profile_id)
  await sql(
    `DELETE FROM scheduling_configs a USING scheduling_configs b
     WHERE a.id > b.id AND a.user_id = b.user_id AND a.linkedin_profile_id = b.linkedin_profile_id`,
  )

  // Asignar datos históricos globales (user_id NULL) al usuario con suscripción activa
  const [active] = await sql(`SELECT user_id FROM subscriptions WHERE status IN (${ACTIVE_STATUSES.map((_, i) => `$${i + 1}`).join(",")}) LIMIT 1`, ACTIVE_STATUSES)
  if (active) {
    await sql`UPDATE news SET user_id = ${active.user_id} WHERE user_id IS NULL`
    await sql`UPDATE news_ai_results SET user_id = ${active.user_id} WHERE user_id IS NULL`
    console.log(`Datos históricos (user_id NULL) -> ${active.user_id.slice(0, 8)}…`)
  } else {
    console.log("Sin suscripción activa: datos históricos (user_id NULL) quedan sin asignar.")
  }

  const after = await sql`SELECT count(*)::int AS n FROM profiles`
  console.log(`Perfiles después: ${after[0].n}`)
}

main().catch((e) => {
  console.error("Error:", e.message)
  process.exit(1)
})