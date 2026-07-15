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

export async function generateImagePrompt(title: string, summary: string) {
  const prompt = `Eres un experto en diseño gráfico y marketing visual para LinkedIn.
Genera un prompt PARA UNA IA DE IMÁGENES (como DALL-E, Midjourney o Stable Diffusion) que cree una imagen profesional, realista y moderna para acompañar esta noticia en LinkedIn.

REGLAS PARA EL PROMPT:
- Describe la escena de forma realista y detallada (iluminación, colores, composición)
- Especifica "fotografía realista, alta calidad, 8K, iluminación profesional"
- NO incluyas personas si el prompt va a generar rostros distorsionados. Mejor usa objetos, entornos, texturas
- Si incluyes personas, especifica "fotografía realista de persona profesional, manos visibles y proporcionadas, anatomía correcta"
- Estilo profesional corporativo, colores sobrios, composición limpia
- NO uses términos abstractos como "innovación" o "futuro" solos - describe elementos visuales concretos

Título: ${title}
Resumen: ${summary}

Prompt para generación de imagen:`

  return callDeepSeek(prompt, 300)
}
