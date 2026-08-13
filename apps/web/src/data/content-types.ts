import type { ContentTypeId } from "@/app/dashboard/dashboard-context"

export interface ContentType {
  id: ContentTypeId
  label: string
  description: string
  icon: string
  aiType: "linkedin-post" | "blog" | "video-script" | "social"
  destination: string
  shortHint: string
}

export const contentTypes: ContentType[] = [
  {
    id: "linkedin-post",
    label: "Post LinkedIn",
    description: "Post profesional con imagen Breaking News / Tech Update para LinkedIn",
    icon: "Linkedin",
    aiType: "linkedin-post",
    destination: "LinkedIn",
    shortHint: "Texto + imagen armada",
  },
  {
    id: "social",
    label: "Red Social",
    description: "Texto corto multiplataforma con gancho de conversación",
    icon: "Share2",
    aiType: "social",
    destination: "LinkedIn",
    shortHint: "Formato universal",
  },
  {
    id: "blog",
    label: "Artículo Blog",
    description: "Artículo largo desarrollado a partir de la noticia, listo para publicar",
    icon: "FileText",
    aiType: "blog",
    destination: "Borrador / Blog",
    shortHint: "Texto largo editable",
  },
  {
    id: "video",
    label: "Guion Video",
    description: "Guion de video con escenas, voz en off y duración estimada",
    icon: "Video",
    aiType: "video-script",
    destination: "Guion descargable",
    shortHint: "Escenas + voz en off",
  },
]

export function getContentType(id: ContentTypeId | null | undefined): ContentType {
  return contentTypes.find((t) => t.id === id) || contentTypes[0]
}