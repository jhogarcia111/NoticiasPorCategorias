import { Newspaper, Brain, Calendar, Award } from "lucide-react"

export interface SplashStep {
  id: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  icon: any
  image: string
  alt: string
}

export const splashSteps: SplashStep[] = [
  {
    id: "import",
    eyebrow: "Paso 1 de 4",
    title: "Importa solo lo que importa",
    description:
      "Conecta tus categorías y fuentes. La plataforma recolecta automáticamente las noticias de tu industria. Nada de perder horas buscando.",
    bullets: [
      "Más de 10 categorías o crea las tuyas",
      "Recolección automática por NewsAPI y RSS",
      "Búsqueda personalizada por tema",
    ],
    icon: Newspaper,
    image: "/splash/import.png",
    alt: "Panel digital con feeds de noticias de la industria",
  },
  {
    id: "ai",
    eyebrow: "Paso 2 de 4",
    title: "La IA escribe como tú",
    description:
      "Selecciona las noticias y la IA genera el post en 4 estilos: crítico, educativo, satírico o ejecutivo. Suena a ti, no a un robot.",
    bullets: [
      "4 estilos de escritura según tu personalidad",
      "Titulares que generan curiosidad y comentarios",
      "Tú siempre das el visto bueno final",
    ],
    icon: Brain,
    image: "/splash/ai.png",
    alt: "Entorno digital con inteligencia artificial generando contenido",
  },
  {
    id: "schedule",
    eyebrow: "Paso 3 de 4",
    title: "Publica sin publicar",
    description:
      "Programa tu calendario una vez y olvídate. El sistema publica solo en los horarios óptimos. Presencia 24/7 sin mover un dedo.",
    bullets: [
      "Calendario inteligente con horarios óptimos",
      "Publicación automática en LinkedIn",
      "10 minutos al mes para todo el contenido",
    ],
    icon: Calendar,
    image: "/splash/schedule.png",
    alt: "Calendario digital automatizado con programación de publicaciones",
  },
  {
    id: "grow",
    eyebrow: "Paso 4 de 4",
    title: "Posiciónate en tu industria",
    description:
      "Contenido relevante y consistente atrae headhunters, clientes y oportunidades. Mira tu impacto crecer en números.",
    bullets: [
      "Conviértete en la referencia de tu nicho",
      "Estadísticas de alcance e interacciones",
      "Tu próximo ascenso puede empezar con un post",
    ],
    icon: Award,
    image: "/splash/grow.png",
    alt: "Analítica de crecimiento digital mostrando impacto y alcance",
  },
]