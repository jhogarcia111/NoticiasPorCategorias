const { neon } = require("@neondatabase/serverless")
const fs = require("fs")
const path = require("path")

const env = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8")
const m = env.match(/DATABASE_URL=\s*"?([^"\r\n]+)"?/)
if (!m) { console.error("DATABASE_URL not found"); process.exit(1) }
const sql = neon(m[1].trim())

async function main() {
  const groups = await sql(`
    SELECT user_id, linkedin_id, count(*) AS c
    FROM linkedin_profiles
    GROUP BY user_id, linkedin_id
    HAVING count(*) > 1
  `)

  console.log("Duplicate groups:", groups.length)
  if (groups.length === 0) { console.log("Nothing to dedupe"); return }

  const delIds = []

  for (const g of groups) {
    const rows = await sql(
      "SELECT id, is_primary FROM linkedin_profiles WHERE user_id=$1 AND linkedin_id=$2 ORDER BY id",
      [g.user_id, g.linkedin_id]
    )
    const keep = rows.find((r) => r.is_primary) || rows[0]
    const dups = rows.filter((r) => r.id !== keep.id)
    dups.forEach((d) => delIds.push(d.id))
    console.log(`user=${g.user_id.slice(0, 8)} liId=${g.linkedin_id}: ${rows.length} rows -> keep ${keep.id}, del [${dups.map((d) => d.id).join(",")}]`)

    // Remap non-unique-conflicting tables
    for (const d of dups) {
      for (const col of ["profile_id", "linkedin_profile_id"]) {
        await sql(`UPDATE scheduled_posts SET ${col}=$1 WHERE ${col}=$2`, [keep.id, d.id])
      }
      for (const [table, col] of [
        ["scheduling_configs", "linkedin_profile_id"],
        ["profile_categories", "profile_id"],
        ["profile_baselines", "linkedin_profile_id"],
        ["post_metrics_history", "linkedin_profile_id"],
      ]) {
        await sql(`UPDATE ${table} SET ${col}=$1 WHERE ${col}=$2`, [keep.id, d.id])
      }
      // overall_analytics: delete rows pointing to dup li (they duplicate canonical row for same week)
      await sql("DELETE FROM overall_analytics WHERE linkedin_profile_id=$1", [d.id])
    }
  }

  // 2. Delete duplicate linkedin_profiles (CASCADE cleans any leftover refs)
  for (const id of delIds) {
    const r = await sql("DELETE FROM linkedin_profiles WHERE id=$1", [id])
    console.log(`deleted li id=${id}`)
  }

  const liCount = await sql("SELECT count(*) c FROM linkedin_profiles")
  const oaCount = await sql("SELECT count(*) c FROM overall_analytics")
  const spCheck = await sql(`
    SELECT count(*) c FROM scheduled_posts sp
    LEFT JOIN linkedin_profiles lp ON lp.id = sp.linkedin_profile_id
    WHERE lp.id IS NULL
  `)
  console.log(`\nDone. remaining linkedin_profiles=${liCount[0].c}, overall_analytics=${oaCount[0].c}, orphan scheduled_posts=${spCheck[0].c}`)
}
main().catch((e) => { console.error(e); process.exit(1) })