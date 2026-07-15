import { NextResponse } from "next/server"
import { postToLinkedIn, uploadImageToLinkedIn } from "@/services/linkedin-service"
import { getDb, scheduledPosts, postNews } from "@noticias/database"
import { generateNewsImageData } from "@/services/ai-service"

const POLLINATIONS_URL = "https://image.pollinations.ai/prompt"

export async function POST(request: Request) {
  try {
    const { profileId, content, title, sourceUrl, userId, newsIds, imageUrl: customImageUrl, headline, imagePrompt } = await request.json()

    if (!profileId || !content) {
      return NextResponse.json({ error: "profileId and content are required" }, { status: 400 })
    }

    let imageUrn: string | null = null

    if (customImageUrl) {
      imageUrn = await uploadImageToLinkedIn(profileId, customImageUrl)
    } else if (title) {
      try {
        if (imagePrompt && headline) {
          // Use the specific visual prompt with the chosen headline
          const finalPrompt = imagePrompt.replace("[HEADLINE]", headline)
          const pollinationsUrl = `${POLLINATIONS_URL}/${encodeURIComponent(finalPrompt)}?width=1200&height=627`
          imageUrn = await uploadImageToLinkedIn(profileId, pollinationsUrl)
        } else {
          // Fallback: generate fresh with cinematic style
          const data = await generateNewsImageData(title, content.substring(0, 300))
          if (data?.imagePrompts?.[0]) {
            const promptWithHeadline = data.imagePrompts[0].replace("[HEADLINE]", data.headlines[0])
            const pollinationsUrl = `${POLLINATIONS_URL}/${encodeURIComponent(promptWithHeadline)}?width=1200&height=627`
            imageUrn = await uploadImageToLinkedIn(profileId, pollinationsUrl)
          }
        }
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
