import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatDateShort(date) {
  return new Intl.DateTimeFormat('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function truncateText(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generatePostContent(newsItems) {
  if (!newsItems || newsItems.length === 0) return ''
  
  let content = "📰 Resumen de noticias relevantes:\n\n"
  
  newsItems.forEach((item, index) => {
    content += `${index + 1}. ${item.title}\n`
    if (item.ai_summary) {
      content += `   ${item.ai_summary}\n`
    }
    content += `   🔗 ${item.source_url}\n\n`
  })
  
  content += "#noticias #linkedin #profesional"
  
  return content
}
