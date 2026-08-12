import type { Tab } from "@/app/dashboard/dashboard-context"

export interface OnboardingStep {
  tab: Tab
  element?: string
  title: string
  intro: string
  position?: "floating" | "top" | "bottom" | "left" | "right" | "top-right-aligned" | "top-left-aligned" | "top-middle-aligned" | "bottom-right-aligned" | "bottom-left-aligned" | "bottom-middle-aligned"
}

export const tourSteps: OnboardingStep[] = [
  {
    tab: "home",
    element: "#dash-welcome",
    title: "El Dashboard",
    intro:
      "Este es tu centro de control. Aquí ves tu actividad de un vistazo: noticias, borradores de IA y publicaciones. Todo empieza aquí.",
    position: "bottom",
  },
  {
    tab: "home",
    element: "#dash-stats",
    title: "Tus métricas",
    intro:
      "Noticias totales, por procesar, borradores de IA y publicadas hoy. Haz clic en cualquier tarjeta para ir directo a esa sección.",
    position: "bottom",
  },
  {
    tab: "home",
    element: "#nav-sidebar",
    title: "Navegación",
    intro:
      "El menú lateral te lleva a todo: Inicio, Noticias, IA, Calendario, Publicadas y Configuración. Cada sección hace una parte del trabajo.",
    position: "right",
  },
  {
    tab: "home",
    element: "#nav-config",
    title: "Menú Configuración",
    intro:
      "Para configurar las categorías de noticias que deseas importar, dirígete al menú Configuración. Aquí activas las que te interesan y creas las tuyas.",
    position: "right",
  },
  {
    tab: "config",
    element: "#cat-manager",
    title: "Configura tus categorías",
    intro:
      "Activa las categorías que ya existen o crea las tuyas. Solo las activas se usan al recolectar. Así defines qué noticias importan para tu industria.",
    position: "top",
  },
  {
    tab: "news",
    element: "#btn-collect",
    title: "Importa noticias",
    intro:
      "Con un clic recolectas las noticias de tus categorías activas. También puedes buscar un tema específico con el buscador de la derecha.",
    position: "bottom",
  },
  {
    tab: "news",
    element: "#news-list",
    title: "Selecciona y envía a IA",
    intro:
      "Marca las noticias que quieras publicar. Al seleccionarlas, aparece el botón IA para generar tu post con la inteligencia artificial.",
    position: "bottom",
  },
  {
    tab: "ai",
    element: "#ai-panel",
    title: "Genera tu post con IA",
    intro:
      "Elige entre 4 estilos: crítico, educativo, satírico o ejecutivo. La IA escribe el post, revisa el preview y guárdalo como borrador.",
    position: "bottom",
  },
  {
    tab: "calendar",
    element: "#cal-view",
    title: "Programa la publicación",
    intro:
      "Agenda tu borrador en el calendario. El sistema publica solo en el horario elegido. Tú planificas una vez y el resto lo hace la plataforma.",
    position: "bottom",
  },
  {
    tab: "published",
    element: "#nav-published",
    title: "Publicadas",
    intro:
      "Todo tu historial en un solo lugar: lo publicado, lo programado y su estado. Ahí ves cómo crece tu presencia en LinkedIn.",
    position: "right",
  },
  {
    tab: "home",
    title: "¡Listo para empezar!",
    intro:
      "Importa. Publica. Posiciónate. Tu próxima oportunidad profesional puede empezar con un post. ¡Vamos a crearlo!",
  },
]