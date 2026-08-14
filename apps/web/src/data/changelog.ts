export interface ChangelogEntry {
  version: string
  date: string
  changes: { type: "added" | "fixed" | "changed" | "removed"; description: string; location?: string }[]
}

export const changelogData: ChangelogEntry[] = [
  {
    version: "1.18.0",
    date: "2026-08-14",
    changes: [
      { type: "added", description: "Publica como página de empresa de LinkedIn con scopes ampliados", location: "apps/web/src/app/api/linkedin/publish" },
      { type: "added", description: "Deduplicación y consolidación de perfiles de LinkedIn (upsert al guardar)", location: "apps/web/src/app/api/linkedin/profiles" },
      { type: "fixed", description: "Guarda el perfil de LinkedIn en el callback y reactiva la conexión al reconectar", location: "apps/web/src/app/api/linkedin/callback" },
      { type: "fixed", description: "Scope de organización en login social y diagnóstico de organizaciones", location: "apps/web/src/app/api/linkedin/organizations" },
      { type: "fixed", description: "Revertidos scopes de organización del login no autorizados por LinkedIn" },
    ],
  },
  {
    version: "1.17.0",
    date: "2026-08-13",
    changes: [
      { type: "added", description: "Módulo de analíticas e impacto de LinkedIn", location: "apps/web/src/app/api/analytics" },
      { type: "added", description: "Selector de qué publicar hoy (blog / video / social)" },
      { type: "added", description: "Proveedores de fuentes avanzadas (ciencia, patentes, URL)", location: "apps/web/src/app/api/providers" },
    ],
  },
  {
    version: "1.16.0",
    date: "2026-08-12",
    changes: [
      { type: "changed", description: "Unifica cuentas por email" },
      { type: "added", description: "Editor táctil para móvil" },
      { type: "fixed", description: "Tour de onboarding abre el menú real antes de cada leyenda" },
      { type: "fixed", description: "Tour espera el montaje del tab antes de avanzar" },
      { type: "fixed", description: "API de intro.js v8 — direction sin índice en onBeforeChange" },
      { type: "added", description: "Paso del tour ancla la primera pestaña de Configuración" },
      { type: "fixed", description: "Import dinámico de intro.js y 4 imágenes splash Unsplash" },
      { type: "fixed", description: "Evita subquery ambigua en el fallback de login", location: "apps/web/src/app/api/auth" },
    ],
  },
  {
    version: "1.15.0",
    date: "2026-08-11",
    changes: [
      { type: "added", description: "Noticias y borradores por usuario" },
      { type: "added", description: "Onboarding con intro.js, splash screen e imagen IA" },
      { type: "changed", description: "Diseño de splash screen y tour intro.js" },
    ],
  },
  {
    version: "1.14.0",
    date: "2026-08-10",
    changes: [
      { type: "added", description: "Publicador automático de posts programados con zona horaria de Bogotá", location: "apps/web/src/app/api/linkedin/publish-due" },
      { type: "fixed", description: "Cron diario 7am Bogotá para plan Hobby", location: "apps/web/src/app/api/linkedin/publish-due" },
      { type: "added", description: "Botón de publicación manual en calendario y publicadas" },
      { type: "added", description: "Guardar y mostrar imagen al programar/publicar" },
      { type: "fixed", description: "Programar post con toISOString y prompt modo historia-urgencia" },
      { type: "added", description: "Estructura narrativa unida en los 4 modos IA" },
      { type: "added", description: "Restaura etiqueta y título al recuperar noticia guardada" },
    ],
  },
  {
    version: "1.13.0",
    date: "2026-08-09",
    changes: [
      { type: "added", description: "Editor IA: cuadro de texto auto-alto, etiqueta custom y guardados en sidebar" },
    ],
  },
  {
    version: "1.12.0",
    date: "2026-08-05",
    changes: [
      { type: "added", description: "Dashboard con estadísticas, enlaces y borradores IA", location: "apps/web/src/app/api/stats" },
      { type: "fixed", description: "Correcciones menores en estadísticas y UI del dashboard" },
    ],
  },
  {
    version: "1.11.0",
    date: "2026-08-02",
    changes: [
      { type: "added", description: "Botón regenerar post y persiste las ediciones" },
      { type: "fixed", description: "Regenerar post ahora varía la redacción y avisa" },
      { type: "fixed", description: "Regenerar post usa la misma receta del template" },
      { type: "fixed", description: "Completa el post IA y agrega la línea Fuente" },
    ],
  },
  {
    version: "1.10.0",
    date: "2026-08-01",
    changes: [
      { type: "changed", description: "Migra la IA a Groq y genera imágenes vía FAL/Stability" },
      { type: "added", description: "Titulares virales y cierre conversacional en los posts" },
      { type: "fixed", description: "Refuerza el prompt de titulares con ejemplos few-shot" },
      { type: "added", description: "Dedupe de resultados IA por noticia y botón procesar con IA" },
      { type: "added", description: "CRUD de categorías en la pestaña Configuración", location: "apps/web/src/app/api/categories" },
      { type: "changed", description: "Migra a la Images API de LinkedIn para posts de imagen" },
      { type: "fixed", description: "Restaura distribution requerido en Posts API de LinkedIn" },
      { type: "fixed", description: "Parseo correcto del polling de estado de imagen de LinkedIn" },
    ],
  },
  {
    version: "1.9.1",
    date: "2026-07-31",
    changes: [
      { type: "fixed", description: "Usa /everything con keywords en español para recolectar noticias", location: "apps/web/src/app/api/news/collect" },
      { type: "fixed", description: "Seed reactiva categorías existentes para arreglar la recolección de noticias" },
      { type: "changed", description: "Edición de imágenes en la landing" },
    ],
  },
  {
    version: "1.9.0",
    date: "2026-07-23",
    changes: [
      { type: "added", description: "Pagos online con Wompi (Colombia, COP)", location: "apps/web/src/app/api/pricing/checkout" },
      { type: "added", description: "Plan Pioneer Cofounder y página de precios", location: "apps/web/src/app/api/subscriptions/plans" },
      { type: "added", description: "Panel admin y cancelación de suscripción", location: "apps/web/src/app/api/subscriptions/cancel" },
      { type: "fixed", description: "Precios correctos en DB (COP) y seed actualiza planes existentes" },
      { type: "fixed", description: "Montos hardcodeados en checkout (ignora DB)" },
      { type: "fixed", description: "Formato de URL de checkout Wompi con reference como query param" },
      { type: "fixed", description: "Variables de entorno de Wompi alineadas a Vercel" },
      { type: "changed", description: "Ribbon diagonal Recomendado + costo ~COP/día en membresías" },
      { type: "fixed", description: "Display de precios, botón de Wompi y diálogo de checkout" },
      { type: "fixed", description: "Strings de precios hardcodeados + todos los planes redirigen a Wompi" },
    ],
  },
  {
    version: "1.8.0",
    date: "2026-07-16",
    changes: [
      { type: "added", description: "Galería de imágenes: guardar, eliminar, copiar prompt y restaurar al cargar", location: "apps/web/src/app/api/images/gallery" },
      { type: "fixed", description: "Upload base64 sin links rotos en galería y extracción de base64 desde data URL" },
      { type: "fixed", description: "Reemplaza operador spread por loop para evitar Maximum call stack size exceeded" },
      { type: "fixed", description: "Comprime la imagen a JPEG 1200px antes de enviarla a LinkedIn" },
      { type: "fixed", description: "Elimina mediaType no soportado y distribution object que causaban 500 en LinkedIn Posts API" },
      { type: "added", description: "Logging mejorado de errores de LinkedIn y decodificación con Buffer directo" },
      { type: "changed", description: "Landing rediseñada" },
      { type: "fixed", description: "Fuentes dinámicas en preview y preservación del aspect ratio original" },
      { type: "added", description: "Notificaciones toast y sidebar colapsable en la navegación" },
    ],
  },
  {
    version: "1.7.0",
    date: "2026-07-15",
    changes: [
      { type: "added", description: "Pagos online (inicio de integración)" },
      { type: "fixed", description: "Valores y publicación de membresías" },
      { type: "fixed", description: "Enforce de URLs de fuente y prevención de alucinación de IA" },
    ],
  },
  {
    version: "1.6.0",
    date: "2026-07-15",
    changes: [
      { type: "added", description: "Generación automática de imágenes con IA para posts de LinkedIn", location: "apps/web/src/app/api/images/generate" },
      { type: "added", description: "Nuevo flujo de imagen: plantilla de gráfica de noticia cinematográfica en 3 pasos (visual + selección de titular)" },
      { type: "added", description: "Editor de imágenes interactivo: drag/resize de overlays, presets de etiqueta y compositing en canvas" },
      { type: "added", description: "Ensamblador de imágenes basado en canvas (texto sobre imagen, compresión y titulares persistentes)" },
      { type: "added", description: "Persistencia de plantilla y titulares al recuperar análisis guardado", location: "apps/web/src/app/api/ai/saved-results" },
      { type: "fixed", description: "Generación de imágenes secuencial, aspect ratio 16:9 y prompts concisos con retry" },
      { type: "fixed", description: "Fuentes dinámicas en preview y preservación del aspect ratio original" },
      { type: "added", description: "Guarda los metadatos de la imagen generada al seleccionarla" },
    ],
  },
  {
    version: "1.5.0",
    date: "2026-07-12",
    changes: [
      { type: "added", description: "Email templates con nodemailer", location: "apps/web/src/app/api/admin/email-templates" },
      { type: "added", description: "Reset de contraseña", location: "apps/web/src/app/api/auth/reset-password" },
      { type: "added", description: "Autenticación con Google OAuth" },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-07-11",
    changes: [
      { type: "added", description: "Vista de publicadas y tracking de noticias publicadas", location: "apps/web/src/app/api/news/published" },
      { type: "changed", description: "Ajustes en la lógica de noticias y LinkedIn" },
      { type: "fixed", description: "Crash por enlace RSS vacío, mejora del discover y propagación de errores" },
      { type: "changed", description: "Idioma español-only en la app" },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-07-10",
    changes: [
      { type: "changed", description: "Dashboard context y refactor grande de UI" },
      { type: "fixed", description: "Import de noticias con API key" },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-07-09",
    changes: [
      { type: "added", description: "Noticias por categorías y personalizadas con gestión de categorías activables" },
      { type: "added", description: "Búsqueda personalizada por keyword para recolectar noticias" },
      { type: "added", description: "Más fuentes RSS (IA, robótica, tech), eliminar fuente con sus noticias y borrado masivo", location: "apps/web/src/app/api/sources" },
      { type: "added", description: "Pestaña IA rediseñada con templates de prompt, preview limpio y split de prompt" },
      { type: "added", description: "Vista de calendario como tercera pestaña" },
      { type: "added", description: "Filtro por idioma, discover de RSS, publicar desde IA y guardar resultados IA" },
      { type: "added", description: "Checkboxes en tab IA, recuperar resultados guardados y navegación noticias → IA" },
      { type: "changed", description: "Nuevo logo y branding" },
      { type: "fixed", description: "Límite de RSS a 10, colores por fecha y dashboard compacto" },
      { type: "fixed", description: "Header único, navbar con título+usuario y configuración a 2 columnas" },
      { type: "fixed", description: "Recolectar dentro de la tarjeta de noticia, módulos compactos y refresh tras delete" },
      { type: "fixed", description: "markNewsAsProcessed con tipo array SQL (useInArray)" },
      { type: "fixed", description: "Filtro de idioma de fuentes y ocultar feeds ya añadidos" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-07-08",
    changes: [
      { type: "added", description: "Bottom bar con versión y acceso al changelog" },
      { type: "added", description: "Menú de usuario con Editar Perfil y Cerrar Sesión" },
      { type: "added", description: "Módulo de edición de perfil (foto, nombre, contraseña)", location: "apps/web/src/app/api/profile" },
      { type: "added", description: "Módulo de administración de fuentes de noticias RSS/API" },
      { type: "fixed", description: "Corrección en la recolección de noticias con mejor manejo de errores" },
      { type: "fixed", description: "Diagnóstico para problemas con API externas" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-07-07",
    changes: [
      { type: "added", description: "Migración de Vite+React a Next.js 15 monorepo con Turborepo" },
      { type: "added", description: "Autenticación con Auth.js v5 (email/password + LinkedIn OAuth)" },
      { type: "added", description: "Panel de control con pestañas: Noticias, LinkedIn, Programación, IA" },
      { type: "added", description: "Recolección de noticias via NewsAPI" },
      { type: "added", description: "Conexión con LinkedIn para publicar" },
      { type: "added", description: "Programación de publicaciones con configuración por día" },
      { type: "added", description: "Procesamiento de noticias con IA (DeepSeek)" },
      { type: "added", description: "Sistema de 5 categorías predeterminadas" },
      { type: "added", description: "Base de datos Neon con Drizzle ORM (9 tablas)" },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-07-06",
    changes: [
      { type: "added", description: "Configuración inicial del monorepo" },
      { type: "added", description: "Estructura base del proyecto Next.js" },
      { type: "added", description: "Esquemas de base de datos iniciales" },
    ],
  },
]

export const currentVersion = "1.18.0"