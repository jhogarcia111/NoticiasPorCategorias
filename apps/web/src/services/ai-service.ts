const DEEPSEEK_API_URL = "https://api.deepseek.com/v1"
const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY

async function callDeepSeek(prompt: string, maxTokens = 300) {
  if (!DEEPSEEK_API_KEY) throw new Error("DeepSeek API key not configured")

  const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim()
}

export async function generateNewsSummary(content: string, language = "es") {
  const langInstruction =
    language === "es"
      ? "IMPORTANTE: Genera el resumen completamente en español."
      : "IMPORTANTE: Generate the summary in English."

  const prompt = `Eres un experto en comunicación profesional para LinkedIn. 
Resume la siguiente noticia en máximo 200 palabras, enfocándote en aspectos relevantes para profesionales.
${langInstruction}
Noticia: ${content}
Resumen:`

  return callDeepSeek(prompt, 300)
}

export async function generateLinkedInPost(
  newsItems: { title: string; summary?: string; source_url?: string }[],
  options: { language?: string; style?: string; maxLength?: number; systemPrompt?: string; customPrompt?: string } = {},
) {
  const { language = "es", style = "professional", maxLength = 1300, systemPrompt, customPrompt } = options

  const newsText = newsItems
    .map((item, i) => `${i + 1}. ${item.title}\n   ${item.summary || ""}\n   Fuente: ${item.source_url || ""}`)
    .join("\n\n")

  const langInstruction =
    language === "es"
      ? "IMPORTANTE: Escribe el post completamente en español."
      : "IMPORTANTE: Write the post in English."

  // Use custom system prompt if provided, otherwise use default
  if (systemPrompt) {
    const extra = customPrompt ? `\n\nInstrucciones adicionales del usuario:\n${customPrompt}` : ""
    const prompt = `${systemPrompt}\n\n### NOTICIAS A PROCESAR:\n${newsText}\n${extra}\n\n${langInstruction}`
    return callDeepSeek(prompt, 1000)
  }

  const prompt = `Eres un experto en marketing de contenido para LinkedIn. 
Crea un post profesional y atractivo basado SOLO en la informacion de las noticias proporcionadas.

REGLAS ESTRICTAS (violarlas cancela tu respuesta):
1. Solo usa datos, cifras, citas y detalles que aparezcan EXPLICITAMENTE en las noticias.
2. NO inventes citas textuales, estadisticas, fechas, precios ni declaraciones.
3. NO asumas monedas: si mencionas dinero usa el que aparezca en la noticia.
4. Si la noticia NO menciona un dato, NO lo agregues.
5. Incluye la URL de la fuente en el post para que los lectores puedan verificar.

Noticias:
${newsText}
El post debe tener un hook inicial, ser profesional, generar engagement, incluir call-to-action.
Máximo ${maxLength} caracteres. Estilo: ${style}.
${langInstruction}
Post para LinkedIn:`

  return callDeepSeek(prompt, 500)
}

export async function generateHashtags(title: string, summary: string) {
  const prompt = `Genera 5-8 hashtags relevantes para LinkedIn basados en esta noticia:
Título: ${title}
Resumen: ${summary}
Los hashtags deben ser populares en LinkedIn y relacionados con el contenido.
Hashtags:`

  const result = await callDeepSeek(prompt, 100)
  if (!result) return []
  return result
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l.startsWith("#"))
    .map((h: string) => h.replace("#", ""))
}

const NO_TEXT_RULE = "ABSOLUTAMENTE PROHIBIDO incluir texto, letras, números, palabras, tipografía, logos, marcas, frases ni caracteres escritos en la imagen. La imagen debe ser SOLO elementos visuales sin texto."

export async function generateImagePrompt(title: string, summary: string) {
  const prompt = `Eres un experto en diseño gráfico y marketing visual para LinkedIn.
Genera un prompt PARA UNA IA DE IMÁGENES (como DALL-E, Midjourney o Stable Diffusion) que cree una imagen profesional, realista y moderna para acompañar esta noticia en LinkedIn.

REGLAS PARA EL PROMPT:
- Describe la escena de forma realista y detallada (iluminación, colores, composición)
- Especifica "fotografía realista, alta calidad, 8K, iluminación profesional"
- NO incluyas personas si el prompt va a generar rostros distorsionados. Mejor usa objetos, entornos, texturas
- Si incluyas personas, especifica "fotografía realista de persona profesional, manos visibles y proporcionadas, anatomía correcta"
- Estilo profesional corporativo, colores sobrios, composición limpia
- NO uses términos abstractos como "innovación" o "futuro" solos - describe elementos visuales concretos
- ${NO_TEXT_RULE}

Título: ${title}
Resumen: ${summary}

Prompt para generación de imagen:`

  return callDeepSeek(prompt, 300)
}

const NEWS_IMAGE_TEMPLATE = `"A professional, high-impact cinematic news graphic for a LinkedIn article header. The scene is set in a futuristic, glowing [TEMA] landscape against a cosmic gradient background with flowing light trails, data streams, and interconnected global network nodes.

On the left, a large, curved premium [ELEMENTO_IZQUIERDO].

On the right, a smaller, angled floating digital interface screen represents [ELEMENTO_DERECHO]. This screen displays [CONTENIDO_PANTALLA] and is cluttered with multiple, distinct, brightly colored display advertisement zones of various shapes. This interface has a slightly more utilitarian feel compared to the TV.

Both screens are integrated into the digital network flow. The overall color palette is composed of deep blues, purples, and oranges, with bright contrasting colors for the ads.

Across the entire bottom third of the image, there is a clean, dark gradient news ticker banner. On the left side of this banner, there is a distinct 'BREAKING NEWS' text label in white on a red background block. The remainder of the banner contains the main headline text in clear, bold, white sans-serif font:

[HEADLINE]

The lighting is atmospheric, digital, and professional. No specific, recognizable company logos (other than abstract generic icons) are present on the screens or interface. The composition is balanced, with the screens framed by the data network."`

export async function generateNewsImageData(title: string, summary: string, retries = 2): Promise<{
  imagePrompts: string[]
  headlines: string[]
} | null> {
  const prompt = `Eres un experto en diseño gráfico de noticias para LinkedIn.

Basado en esta noticia:
Título: ${title}
Resumen: ${summary}

Genera 3 prompts visuales para Pollinations AI. Cada prompt debe describir una imagen profesional estilo noticiero cinematográfico, OBLIGATORIAMENTE en formato 16:9 (horizontal, como una foto de paisaje).

ESTRUCTURA DE CADA PROMPT (sigue exactamente este orden):
1. "A professional, high-impact cinematic news graphic for a LinkedIn article header. Aspect ratio 16:9."
2. Describe una escena visual ÚNICA (cambia la ambientación, colores secundarios, ángulo de cámara entre cada prompt). Usa lenguaje visual concreto: colores, iluminación, texturas, composición.
3. Incluye: "Across the bottom, a dark news ticker banner with 'BREAKING NEWS' in white on red at left. The headline text in the banner says: [HEADLINE] (white bold sans-serif font)."
4. Termina con: "Cinematic lighting, 8K, photorealistic, no logos, no recognizable brands, no text other than the breaking news banner."

REGLAS:
- NO uses marcas o logos reales
- NO pongas texto en ninguna otra parte de la imagen excepto el banner inferior
- Usa "[HEADLINE]" EXACTAMENTE como placeholder (sin reemplazarlo)
- Cada prompt debe ser CONCISO (máximo 400 caracteres) y visualmente diferente del anterior
- Especifica "16:9 aspect ratio" en cada prompt

Además genera 3 titulares cortos para el banner "BREAKING NEWS". Cada titular debe ser una frase impactante de máximo 80 caracteres, relacionada a la noticia.

Devuelve SOLO este JSON (sin markdown, sin texto adicional):
{"imagePrompts":["prompt 1","prompt 2","prompt 3"],"headlines":["titular 1","titular 2","titular 3"]}`

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await callDeepSeek(prompt, 800)
      if (!result) continue

      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      const parsed = JSON.parse(jsonMatch[0])
      if (parsed?.imagePrompts?.length >= 2 && parsed?.headlines?.length >= 2) {
        return {
          imagePrompts: parsed.imagePrompts.slice(0, 3),
          headlines: parsed.headlines.slice(0, 3),
        }
      }
    } catch {
      continue
    }
  }
  return null
}

export async function generateImagePrompts(title: string, summary: string): Promise<string[]> {
  const prompt = `Eres un experto en diseño gráfico y marketing visual para LinkedIn.
Genera EXACTAMENTE 3 prompts distintos para una IA de imágenes (Pollinations AI).
Cada prompt debe ser visualmente diferente (cambia ángulo, composición, estilo) pero todos deben ilustrar la misma noticia.

REGLAS PARA CADA PROMPT:
- Describe la escena de forma realista y detallada
- Especifica "fotografía realista, alta calidad, iluminación profesional"
- NO incluyas personas si el prompt va a generar rostros distorsionados
- Estilo profesional corporativo, colores sobrios, composición limpia
- NO uses términos abstractos como "innovación" o "futuro" solos
- ${NO_TEXT_RULE}

Noticia:
Título: ${title}
Resumen: ${summary}

Devuelve SOLO los 3 prompts, numerados del 1 al 3, sin texto adicional antes ni después.
Ejemplo:
1. [primer prompt]
2. [segundo prompt]
3. [tercer prompt]`

  const result = await callDeepSeek(prompt, 600)
  if (!result) return []

  return result
    .split(/\d\.\s+/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 10)
    .slice(0, 3)
}
