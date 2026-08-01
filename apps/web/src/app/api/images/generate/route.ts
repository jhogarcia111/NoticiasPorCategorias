import { NextResponse } from "next/server"

export const maxDuration = 60

const FAL_KEY = process.env.FAL_KEY
const STABILITY_API_KEY = process.env.STABILITY_API_KEY

interface FalResult {
  images?: { url?: string }[]
}

async function generateWithFal(prompt: string): Promise<string> {
  if (!FAL_KEY) throw new Error("FAL_KEY no configurada")

  const response = await fetch("https://fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${FAL_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      image_size: { width: 1280, height: 720 },
      num_images: 1,
    }),
  })

  if (!response.ok) {
    const errorData = await response.text().catch(() => "")
    throw new Error(`FAL API error: ${response.status} ${errorData.slice(0, 300)}`)
  }

  const data = (await response.json()) as FalResult
  const url = data.images?.[0]?.url
  if (!url) throw new Error("FAL no devolvió URL de imagen")
  return url
}

async function generateWithStability(prompt: string): Promise<string> {
  if (!STABILITY_API_KEY) throw new Error("STABILITY_API_KEY no configurada")

  const form = new FormData()
  form.append("prompt", prompt)
  form.append("aspect_ratio", "16:9")
  form.append("output_format", "jpeg")
  form.append("model", "sd3.5-large")

  const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STABILITY_API_KEY}`,
      Accept: "image/*",
    },
    body: form,
  })

  if (!response.ok) {
    const errorData = await response.text().catch(() => "")
    throw new Error(`Stability API error: ${response.status} ${errorData.slice(0, 300)}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  return `data:image/jpeg;base64,${buffer.toString("base64")}`
}

export async function POST(request: Request) {
  try {
    const { prompt, prompts } = await request.json()
    const list: string[] = Array.isArray(prompts) ? prompts : prompt ? [prompt] : []

    if (list.length === 0) {
      return NextResponse.json({ error: "prompt o prompts requerido" }, { status: 400 })
    }
    if (list.length > 3) {
      return NextResponse.json({ error: "Máximo 3 prompts" }, { status: 400 })
    }

    const results: string[] = await Promise.all(
      list.map(async (p) => {
        try {
          return await generateWithFal(p)
        } catch (falError: any) {
          console.error("FAL falló, intentando Stability:", falError.message)
          try {
            return await generateWithStability(p)
          } catch (stabilityError: any) {
            console.error("Stability también falló:", stabilityError.message)
            throw new Error(`Ambos proveedores fallaron: FAL: ${falError.message} | Stability: ${stabilityError.message}`)
          }
        }
      }),
    )

    return NextResponse.json({ data: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
