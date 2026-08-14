import { NextResponse } from "next/server"
import { getLinkedInProfiles, getLinkedInOrganizations, saveLinkedInOrganization } from "@/services/linkedin-service"
import { getDb, linkedinProfiles } from "@noticias/database"
import { eq, and, ne, desc } from "drizzle-orm"

async function getPersonToken(userId: string) {
  const db = getDb()
  const [person] = await db
    .select()
    .from(linkedinProfiles)
    .where(and(eq(linkedinProfiles.userId, userId), ne(linkedinProfiles.profileType, "company")))
    .orderBy(desc(linkedinProfiles.updatedAt))
    .limit(1)
  return person || null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }

  try {
    const person = await getPersonToken(userId)
    if (!person) {
      return NextResponse.json({ data: [], error: "Conecta primero tu perfil personal" })
    }
    const orgs = await getLinkedInOrganizations(person.accessToken)
    const existing = await getLinkedInProfiles(userId)
    const connectedUrns = new Set(existing.map((p: any) => `urn:li:${p.profileType === "company" ? "organization" : "person"}:${p.linkedinId}`))
    const available = orgs.filter((o: any) => !connectedUrns.has(o.urn))
    return NextResponse.json({ data: available })
  } catch (error: any) {
    const status = error?.status
    const isAuth = status === 401 || status === 403
    return NextResponse.json({
      data: [],
      error: isAuth
        ? "Tu token de LinkedIn no tiene el permiso para ver páginas. Desconecta y vuelve a conectar tu perfil personal para renovarlo con los scopes de empresa."
        : error.message,
    }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, urn, name, logoUrl } = await request.json()
    if (!userId || !urn) {
      return NextResponse.json({ error: "userId and urn required" }, { status: 400 })
    }
    const person = await getPersonToken(userId)
    if (!person) {
      return NextResponse.json({ error: "Conecta primero tu perfil personal" }, { status: 400 })
    }
    const orgId = urn.split(":").pop()
    const saved = await saveLinkedInOrganization(
      { urn, id: orgId, name: name || `Página ${orgId}`, logoUrl: logoUrl || null },
      person,
      userId,
    )

    const { captureProfileBaseline } = await import("@/services/analytics-service")
    let baseline = null
    try {
      baseline = await captureProfileBaseline(saved.id)
    } catch (e) {
      console.error("Org baseline capture failed:", e)
    }

    return NextResponse.json({ data: saved, baseline })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
