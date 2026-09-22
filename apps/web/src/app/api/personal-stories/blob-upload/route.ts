import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth()
        const userId = session?.user?.id
        if (!userId) {
          throw new Error("No autenticado")
        }

        // Asegurar que el usuario solo suba a su propio prefijo
        const expectedPrefix = `personal-stories/${userId}/`
        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error(`Ruta de subida no permitida. Debe iniciar con ${expectedPrefix}`)
        }

        return {
          allowedContentTypes: [
            "audio/webm",
            "audio/mp4",
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/ogg",
            "audio/x-m4a",
            "audio/aac",
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
          ],
          tokenPayload: JSON.stringify({ userId }),
        }
      },
      onUploadCompleted: async () => {
        // Notificación o log opcional al completarse la subida
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
