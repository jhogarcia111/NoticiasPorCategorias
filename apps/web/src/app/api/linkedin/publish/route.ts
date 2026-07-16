import { NextResponse } from "next/server"
import { postToLinkedIn, uploadImageToLinkedIn } from "@/services/linkedin-service"
import { getDb, scheduledPosts, postNews } from "@noticias/database"

export async function POST(request: Request) {
  try {
    const { profileId, content, title, sourceUrl, userId, newsIds, imageBase64, imageMime, imageUrl: customImageUrl } = await request.json()

    if (!profileId || !content) {
      return NextResponse.json({ error: "profileId and content are required" }, { status: 400 })
    }

    const imgUrl = imageBase64
      ? `data:${imageMime || "image/jpeg"};base64,${imageBase64}`
      : customImageUrl

    // Upload image FIRST - fail early if it doesn't work
    let imageUrn: string | null = null
    if (imgUrl) {
      imageUrn = await uploadImageToLinkedIn(profileId, imgUrl)
    }

    // Only publish if image uploaded (or no image requested)
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
