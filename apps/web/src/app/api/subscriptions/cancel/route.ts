import { NextResponse } from "next/server"
import { getDb, subscriptions } from "@noticias/database"
import { eq, and, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getDb()

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, session.user.id),
        inArray(subscriptions.status, ["pending", "active", "past_due"]),
      ))
      .limit(1)

    if (!sub) {
      return NextResponse.json({ error: "No hay suscripción activa o pendiente" }, { status: 404 })
    }

    await db
      .update(subscriptions)
      .set({ status: "canceled", canceledAt: new Date(), updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id))

    return NextResponse.json({ data: { message: "Suscripción cancelada" } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}