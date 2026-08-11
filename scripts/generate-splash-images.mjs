import { writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

async function ask(promptText, key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  })
  if (!response.ok) {
    const err = await response.text().catch(() => "")
    throw new Error(`Gemini ${response.status}: ${err.slice(0, 300)}`)
  }
  const data = await response.json()
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)
  if (!part?.inlineData?.data) throw new Error("Gemini no devolvió inlineData")
  return { mime: part.inlineData.mimeType || "image/png", data: part.inlineData.data }
}

const SPLASH_PROMPTS = [
  {
    file: "import.png",
    prompt:
      "Modern digital newsroom dashboard interface on a large screen, dark blue color scheme (#0A66C2 tones), news feed cards with headlines and category tags, soft glow, professional SaaS product shot, clean UI, high detail, no text artifacts, 4:3 landscape",
  },
  {
    file: "ai.png",
    prompt:
      "Abstract digital intelligence environment, glowing neural network and AI writing assistant interface, blue and cyan gradient lighting, holographic panels generating text content, futuristic SaaS aesthetic, clean, high quality, 4:3 landscape, no readable text",
  },
  {
    file: "schedule.png",
    prompt:
      "Digital automated publishing dashboard, intelligent calendar grid with scheduled posts glowing in blue, automation flow lines connecting panels, futuristic productivity SaaS interface, dark blue color palette, clean UI, high detail, 4:3 landscape, no readable text",
  },
  {
    file: "grow.png",
    prompt:
      "Digital analytics growth environment, rising charts and metric cards on a futuristic screen, blue and green data visualization, professional SaaS analytics dashboard, dark elegant UI with glowing accents, 4:3 landscape, no readable text",
  },
]

async function main() {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY no configurada en las variables de entorno.")
    process.exit(1)
  }
  const outDir = join(process.cwd(), "apps", "web", "public", "splash")
  mkdirSync(outDir, { recursive: true })

  for (const { file, prompt } of SPLASH_PROMPTS) {
    const { mime, data } = await ask(prompt, GEMINI_API_KEY)
    const ext = mime === "image/jpeg" ? "jpg" : "png"
    const finalFile = file.replace(/\.png$/, `.${ext}`)
    writeFileSync(join(outDir, finalFile), Buffer.from(data, "base64"))
    console.log("✓", finalFile)
  }
  console.log("Imágenes splash generadas en apps/web/public/splash/")
}

main().catch((err) => {
  console.error("Error:", err.message)
  process.exit(1)
})