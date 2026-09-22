import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { news, personalStoryMeta } from "@noticias/database"
import { generateEventBrief } from "@/services/ai-service"
import { and, eq } from "drizzle-orm"

const GROQ_API_URL = "https://api.groq.com/openai/v1"
const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { audioUrl, photoUrl, categoryId, language = "es", chosenAngleId, photoCaption } = body

    if (!categoryId) {
      return NextResponse.json({ error: "Se requiere una categoría" }, { status: 400 })
    }

    if (!audioUrl && !photoUrl) {
      return NextResponse.json({ error: "Se requiere un audio o una foto" }, { status: 400 })
    }

    let rawTranscript = ""

    // 1. Transcribir audio si existe
    if (audioUrl) {
      if (!GROQ_API_KEY) {
        return NextResponse.json({ error: "GROQ_API_KEY no configurada" }, { status: 500 })
      }

      // Descarga server-side del Blob
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        throw new Error(`Error al descargar audio desde Blob: ${audioResponse.statusText}`)
      }

      const audioBlob = await audioResponse.blob()
      const audioFile = new File([audioBlob], "audio.webm", {
        type: audioBlob.type || "audio/webm",
      })

      const formData = new FormData()
      formData.append("file", audioFile)
      formData.append("model", "whisper-large-v3")
      formData.append("language", language)
      formData.append("response_format", "json")

      const whisperResponse = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      })

      if (!whisperResponse.ok) {
        const errJson = await whisperResponse.json().catch(() => ({}))
        throw new Error(`Groq Whisper error: ${errJson.error?.message || whisperResponse.statusText}`)
      }

      const whisperData = await whisperResponse.json()
      rawTranscript = whisperData.text || ""
    } else if (photoCaption) {
      rawTranscript = photoCaption
    }

    if (!rawTranscript.trim() && !photoUrl) {
      return NextResponse.json(
        { error: "No se pudo obtener la transcripción del audio" },
        { status: 400 }
      )
    }

    // 2. Generar el Event Brief con IA
    const eventBrief = await generateEventBrief(rawTranscript || "Fotografía de experiencia personal compartida.", {
      photoCaption,
      language,
    })

    const chosenAngle =
      eventBrief.suggested_angles.find((a) => a.id === chosenAngleId) ||
      eventBrief.suggested_angles[0]

    const title = chosenAngle?.title || rawTranscript.slice(0, 100) || "Historia personal"
    const summary = `${eventBrief.narrative_core}\n\nEnfoque: ${chosenAngle?.title || ""}\n${chosenAngle?.rationale || ""}`.trim()
    const content = `## Núcleo de la historia\n${eventBrief.narrative_core}\n\n## Ángulo seleccionado: ${chosenAngle?.title || ""}\n${chosenAngle?.rationale || ""}\n\n## Transcripción original\n${rawTranscript}`.trim()

    const db = getDb()
    const parsedCategoryId = Number(categoryId)
    const sourceUrl = audioUrl || photoUrl || `personal-story://${userId}/${Date.now()}`

    // 3. Insertar fila en news
    const [newsRow] = await db
      .insert(news)
      .values({
        userId,
        categoryId: parsedCategoryId,
        title: title.slice(0, 255),
        summary: summary.slice(0, 3000),
        content: content.slice(0, 20000),
        sourceUrl,
        imageUrl: photoUrl || null,
        sourceName: "Historia personal",
        sourceType: "PERSONAL_STORY",
        publishedAt: new Date(),
        language,
        isProcessed: false,
        aiResults: {
          narrative_core: eventBrief.narrative_core,
          chosen_angle: chosenAngle,
        },
      })
      .returning()

    // 4. Insertar fila satélite en personal_story_meta
    const [metaRow] = await db
      .insert(personalStoryMeta)
      .values({
        newsId: newsRow.id,
        userId,
        audioUrl: audioUrl || null,
        photoUrl: photoUrl || null,
        rawTranscript,
        eventBrief,
        chosenAngleId: chosenAngle?.id || null,
        status: "ready",
      })
      .returning()

    return NextResponse.json({
      success: true,
      newsId: newsRow.id,
      news: newsRow,
      eventBrief,
      chosenAngleId: chosenAngle?.id,
      metaId: metaRow.id,
    })
  } catch (error: any) {
    console.error("Error procesando historia personal:", error)
    return NextResponse.json(
      { error: error.message || "Error interno al procesar la historia" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const newsIdParam = searchParams.get("newsId")

    if (!newsIdParam) {
      return NextResponse.json({ error: "Se requiere newsId" }, { status: 400 })
    }

    const db = getDb()
    const [meta] = await db
      .select()
      .from(personalStoryMeta)
      .where(
        and(
          eq(personalStoryMeta.newsId, Number(newsIdParam)),
          eq(personalStoryMeta.userId, userId)
        )
      )
      .limit(1)

    return NextResponse.json({ data: meta || null })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
