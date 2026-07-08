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
  newsItems: { title: string; summary?: string }[],
  options: { language?: string; style?: string; maxLength?: number } = {},
) {
  const { language = "es", style = "professional", maxLength = 1300 } = options

  const newsText = newsItems
    .map((item, i) => `${i + 1}. ${item.title}\n   ${item.summary}`)
    .join("\n\n")

  const langInstruction =
    language === "es"
      ? "IMPORTANTE: Escribe el post completamente en español."
      : "IMPORTANTE: Write the post in English."

  const prompt = `Eres un experto en marketing de contenido para LinkedIn. 
Crea un post profesional y atractivo basado en estas noticias:
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
  const prompt = `Eres un experto en marketing visual para LinkedIn. 
Genera un prompt detallado para crear una imagen profesional que represente esta noticia:
Título: ${title}
Resumen: ${summary}
El prompt debe ser específico, estilo profesional y moderno, apropiado para LinkedIn.
Prompt para imagen:`

  return callDeepSeek(prompt, 200)
}
