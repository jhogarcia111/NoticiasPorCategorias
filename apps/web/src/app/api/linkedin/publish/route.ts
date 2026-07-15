import { NextResponse } from "next/server"
import { postToLinkedIn, uploadImageToLinkedIn } from "@/services/linkedin-service"
import { getDb, scheduledPosts, postNews } from "@noticias/database"
import { generateImagePrompt } from "@/services/ai-service"

const POLLINATIONS_URL = "https://image.pollinations.ai/prompt"

export async function POST(request: Request) {
  try {
    const { profileId, content, title, sourceUrl, userId, newsIds, imageUrl: customImageUrl } = await request.json()

    if (!profileId || !content) {
      return NextResponse.json({ error: "profileId and content are required" }, { status: 400 })
    }

    let imageUrn: string | null = null

    if (customImageUrl) {
      imageUrn = await uploadImageToLinkedIn(profileId, customImageUrl)
    } else if (title) {
      try {
        const prompt = await generateImagePrompt(title, content.substring(0, 300))
        const pollinationsUrl = `${POLLINATIONS_URL}/${encodeURIComponent(prompt)}`
        imageUrn = await uploadImageToLinkedIn(profileId, pollinationsUrl)
      } catch {
        // image upload is optional; continue without it
      }
    }

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
      }).returning()

      if (post && newsIds?.length > 0) {
        await db.insert(postNews).values(
          newsIds.map((newsId: number) => ({
            postId: post.id,
            newsId,
            displayOrder: 0,
          }))
        )
      }
    }

    return NextResponse.json({ data: result, imageUrn })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
