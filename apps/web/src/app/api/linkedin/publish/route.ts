import { NextResponse } from "next/server"
import { postToLinkedIn, uploadImageToLinkedIn } from "@/services/linkedin-service"
import { getDb, scheduledPosts, postNews } from "@noticias/database"
import { checkPostLimit } from "@/lib/check-limit"

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const { profileId, content, title, sourceUrl, userId, newsIds, imageBase64, imageMime } = await request.json()

    if (!profileId || !content) {
      return NextResponse.json({ error: "profileId and content are required" }, { status: 400 })
    }

    // Check post limit before publishing
    if (userId) {
      const limit = await checkPostLimit(userId)
      if (!limit.allowed) {
        return NextResponse.json({ error: limit.message, limit }, { status: 403 })
      }
    }

    // Upload image FIRST using base64 directly (no data URL fetch)
    let imageUrn: string | null = null
    if (imageBase64) {
      imageUrn = await uploadImageToLinkedIn(profileId, imageBase64, true, imageMime)
    }

    // Only publish after successful image upload (or no image requested)
    const result = await postToLinkedIn(profileId, content, title, sourceUrl, imageUrn ?? undefined)

    if (userId) {
      const db = getDb()
      const [post] = await db.insert(scheduledPosts).values({
        profileId,
        userId,
        linkedinProfileId: profileId,
        title: title || "Post publicado",
        content,
        scheduledTime: new Date(),
        scheduledAt: new Date(),
        status: "published",
        postedAt: new Date(),
      }).returning()

      if (post && newsIds?.length) {
        await db.insert(postNews).values(
          newsIds.map((newsId: number) => ({
            postId: post.id,
            newsId,
            displayOrder: 0,
          }))
        )
      }
    }

    return NextResponse.json({
      data: {
        urn: result?.urn || result,
        imageUrn,
        message: "Publicado exitosamente en LinkedIn",
      },
    })
  } catch (error: any) {
    console.error("LinkedIn publish error:", error)
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 })
  }
}
