export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ")
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function truncateText(text: string | null | undefined, maxLength = 100) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function generatePostContent(newsItems: { title: string; ai_summary?: string; source_url?: string }[]) {
  if (!newsItems || newsItems.length === 0) return ""

  let content = "\ud83d\udcf0 Resumen de noticias relevantes:\n\n"

  newsItems.forEach((item, index) => {
    content += `${index + 1}. ${item.title}\n`
    if (item.ai_summary) {
      content += `   ${item.ai_summary}\n`
    }
    content += `   \ud83d\udd17 ${item.source_url}\n\n`
  })

  content += "#noticias #linkedin #profesional"

  return content
}

export const NEWSAPI_CATEGORIES: Record<string, string> = {
  business: "Negocios",
  entertainment: "Entretenimiento",
  general: "General",
  health: "Salud",
  science: "Ciencia",
  sports: "Deportes",
  technology: "Tecnolog\u00eda",
}

export const NEWSAPI_COUNTRIES: Record<string, string> = {
  us: "Estados Unidos",
  mx: "M\u00e9xico",
  ar: "Argentina",
  co: "Colombia",
  es: "Espa\u00f1a",
  br: "Brasil",
}
