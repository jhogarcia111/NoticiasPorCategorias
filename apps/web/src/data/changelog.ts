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
      { type: "added", description: "Publica como página de empresa de LinkedIn con scopes ampliados", location: "Publicar noticias" },
      { type: "added", description: "Deduplicación y consolidación de perfiles de LinkedIn (upsert al guardar)", location: "Publicar noticias" },
      { type: "fixed", description: "Guarda el perfil de LinkedIn en el callback y reactiva la conexión al reconectar", location: "Login" },
      { type: "fixed", description: "Scope de organización en login social y diagnóstico de organizaciones", location: "Login" },
      { type: "fixed", description: "Revertidos scopes de organización del login no autorizados por LinkedIn", location: "Login" },
    ],
  },
  {
    version: "1.17.0",
    date: "2026-08-13",
    changes: [
      { type: "added", description: "Módulo de analíticas e impacto de LinkedIn", location: "Analíticas" },
      { type: "added", description: "Selector de qué publicar hoy (blog / video / social)", location: "Publicar noticias" },
      { type: "added", description: "Proveedores de fuentes avanzadas (ciencia, patentes, URL)", location: "Fuentes" },
    ],
  },
  {
    version: "1.16.0",
    date: "2026-08-12",
    changes: [
      { type: "changed", description: "Unifica cuentas por email", location: "Cuenta" },
      { type: "added", description: "Editor táctil para móvil", location: "Editor" },
      { type: "fixed", description: "Tour de onboarding abre el menú real antes de cada leyenda", location: "Onboarding" },
      { type: "fixed", description: "Tour espera el montaje del tab antes de avanzar", location: "Onboarding" },
      { type: "fixed", description: "API de intro.js v8 — direction sin índice en onBeforeChange", location: "Onboarding" },
      { type: "added", description: "Paso del tour ancla la primera pestaña de Configuración", location: "Onboarding" },
      { type: "fixed", description: "Import dinámico de intro.js y 4 imágenes splash Unsplash", location: "Onboarding" },
      { type: "fixed", description: "Evita subquery ambigua en el fallback de login", location: "Login" },
    ],
  },
  {
    version: "1.15.0",
    date: "2026-08-11",
    changes: [
      { type: "added", description: "Noticias y borradores por usuario", location: "Noticias" },
      { type: "added", description: "Onboarding con intro.js, splash screen e imagen IA", location: "Onboarding" },
      { type: "changed", description: "Diseño de splash screen y tour intro.js", location: "Onboarding" },
    ],
  },
  {
    version: "1.14.0",
    date: "2026-08-10",
    changes: [
      { type: "added", description: "Publicador automático de posts programados con zona horaria de Bogotá", location: "Programación" },
      { type: "fixed", description: "Cron diario 7am Bogotá para plan Hobby", location: "Programación" },
      { type: "added", description: "Botón de publicación manual en calendario y publicadas", location: "Programación" },
      { type: "added", description: "Guardar y mostrar imagen al programar/publicar", location: "Programación" },
      { type: "fixed", description: "Programar post con toISOString y prompt modo historia-urgencia", location: "IA" },
      { type: "added", description: "Estructura narrativa unida en los 4 modos IA", location: "IA" },
      { type: "added", description: "Restaura etiqueta y título al recuperar noticia guardada", location: "IA" },
    ],
  },
  {
    version: "1.13.0",
    date: "2026-08-09",
    changes: [
      { type: "added", description: "Editor IA: cuadro de texto auto-alto, etiqueta custom y guardados en sidebar", location: "IA" },
    ],
  },
  {
    version: "1.12.0",
    date: "2026-08-05",
    changes: [
      { type: "added", description: "Dashboard con estadísticas, enlaces y borradores IA", location: "Dashboard" },
      { type: "fixed", description: "Correcciones menores en estadísticas y UI del dashboard", location: "Dashboard" },
    ],
  },
  {
    version: "1.11.0",
    date: "2026-08-02",
    changes: [
      { type: "added", description: "Botón regenerar post y persiste las ediciones", location: "IA" },
      { type: "fixed", description: "Regenerar post ahora varía la redacción y avisa", location: "IA" },
      { type: "fixed", description: "Regenerar post usa la misma receta del template", location: "IA" },
      { type: "fixed", description: "Completa el post IA y agrega la línea Fuente", location: "IA" },
    ],
  },
  {
    version: "1.10.0",
    date: "2026-08-01",
    changes: [
      { type: "changed", description: "Migra la IA a Groq y genera imágenes vía FAL/Stability", location: "IA" },
      { type: "added", description: "Titulares virales y cierre conversacional en los posts", location: "IA" },
      { type: "fixed", description: "Refuerza el prompt de titulares con ejemplos few-shot", location: "IA" },
      { type: "added", description: "Dedupe de resultados IA por noticia y botón procesar con IA", location: "IA" },
      { type: "added", description: "CRUD de categorías en la pestaña Configuración", location: "Configuración" },
      { type: "changed", description: "Migra a la Images API de LinkedIn para posts de imagen", location: "Publicar noticias" },
      { type: "fixed", description: "Restaura distribution requerido en Posts API de LinkedIn", location: "Publicar noticias" },
      { type: "fixed", description: "Parseo correcto del polling de estado de imagen de LinkedIn", location: "Publicar noticias" },
    ],
  },
  {
    version: "1.9.1",
    date: "2026-07-31",
    changes: [
      { type: "fixed", description: "Usa /everything con keywords en español para recolectar noticias", location: "Noticias" },
      { type: "fixed", description: "Seed reactiva categorías existentes para arreglar la recolección de noticias", location: "Configuración" },
      { type: "changed", description: "Edición de imágenes en la landing", location: "Landing" },
    ],
  },
  {
    version: "1.9.0",
    date: "2026-07-23",
    changes: [
      { type: "added", description: "Pagos online con Wompi (Colombia, COP)", location: "Membresías" },
      { type: "added", description: "Plan Pioneer Cofounder y página de precios", location: "Membresías" },
      { type: "added", description: "Panel admin y cancelación de suscripción", location: "Membresías" },
      { type: "fixed", description: "Precios correctos en DB (COP) y seed actualiza planes existentes", location: "Membresías" },
      { type: "fixed", description: "Montos hardcodeados en checkout (ignora DB)", location: "Membresías" },
      { type: "fixed", description: "Formato de URL de checkout Wompi con reference como query param", location: "Membresías" },
      { type: "fixed", description: "Variables de entorno de Wompi alineadas a Vercel", location: "Membresías" },
      { type: "changed", description: "Ribbon diagonal Recomendado + costo ~COP/día en membresías", location: "Membresías" },
      { type: "fixed", description: "Display de precios, botón de Wompi y diálogo de checkout", location: "Membresías" },
      { type: "fixed", description: "Strings de precios hardcodeados + todos los planes redirigen a Wompi", location: "Membresías" },
    ],
  },
  {
    version: "1.8.0",
    date: "2026-07-16",
    changes: [
      { type: "added", description: "Galería de imágenes: guardar, eliminar, copiar prompt y restaurar al cargar", location: "Galería" },
      { type: "fixed", description: "Upload base64 sin links rotos en galería y extracción de base64 desde data URL", location: "Galería" },
      { type: "fixed", description: "Reemplaza operador spread por loop para evitar Maximum call stack size exceeded", location: "Editor" },
      { type: "fixed", description: "Comprime la imagen a JPEG 1200px antes de enviarla a LinkedIn", location: "Publicar noticias" },
      { type: "fixed", description: "Elimina mediaType no soportado y distribution object que causaban 500 en LinkedIn Posts API", location: "Publicar noticias" },
      { type: "added", description: "Logging mejorado de errores de LinkedIn y decodificación con Buffer directo", location: "Publicar noticias" },
      { type: "changed", description: "Landing rediseñada", location: "Landing" },
      { type: "fixed", description: "Fuentes dinámicas en preview y preservación del aspect ratio original", location: "Editor" },
      { type: "added", description: "Notificaciones toast y sidebar colapsable en la navegación", location: "Dashboard" },
    ],
  },
  {
    version: "1.7.0",
    date: "2026-07-15",
    changes: [
      { type: "added", description: "Pagos online (inicio de integración)", location: "Membresías" },
      { type: "fixed", description: "Valores y publicación de membresías", location: "Membresías" },
      { type: "fixed", description: "Enforce de URLs de fuente y prevención de alucinación de IA", location: "IA" },
    ],
  },
  {
    version: "1.6.0",
    date: "2026-07-15",
    changes: [
      { type: "added", description: "Generación automática de imágenes con IA para posts de LinkedIn", location: "Imágenes" },
      { type: "added", description: "Nuevo flujo de imagen: plantilla de gráfica de noticia cinematográfica en 3 pasos (visual + selección de titular)", location: "Imágenes" },
      { type: "added", description: "Editor de imágenes interactivo: drag/resize de overlays, presets de etiqueta y compositing en canvas", location: "Imágenes" },
      { type: "added", description: "Ensamblador de imágenes basado en canvas (texto sobre imagen, compresión y titulares persistentes)", location: "Imágenes" },
      { type: "added", description: "Persistencia de plantilla y titulares al recuperar análisis guardado", location: "IA" },
      { type: "fixed", description: "Generación de imágenes secuencial, aspect ratio 16:9 y prompts concisos con retry", location: "Imágenes" },
      { type: "fixed", description: "Fuentes dinámicas en preview y preservación del aspect ratio original", location: "Imágenes" },
      { type: "added", description: "Guarda los metadatos de la imagen generada al seleccionarla", location: "Imágenes" },
    ],
  },
  {
    version: "1.5.0",
    date: "2026-07-12",
    changes: [
      { type: "added", description: "Email templates con nodemailer", location: "Cuenta" },
      { type: "added", description: "Reset de contraseña", location: "Cuenta" },
      { type: "added", description: "Autenticación con Google OAuth", location: "Login" },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-07-11",
    changes: [
      { type: "added", description: "Vista de publicadas y tracking de noticias publicadas", location: "Publicar noticias" },
      { type: "changed", description: "Ajustes en la lógica de noticias y LinkedIn", location: "Publicar noticias" },
      { type: "fixed", description: "Crash por enlace RSS vacío, mejora del discover y propagación de errores", location: "Fuentes" },
      { type: "changed", description: "Idioma español-only en la app", location: "Noticias" },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-07-10",
    changes: [
      { type: "changed", description: "Dashboard context y refactor grande de UI", location: "Dashboard" },
      { type: "fixed", description: "Import de noticias con API key", location: "Noticias" },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-07-09",
    changes: [
      { type: "added", description: "Noticias por categorías y personalizadas con gestión de categorías activables", location: "Noticias" },
      { type: "added", description: "Búsqueda personalizada por keyword para recolectar noticias", location: "Noticias" },
      { type: "added", description: "Más fuentes RSS (IA, robótica, tech), eliminar fuente con sus noticias y borrado masivo", location: "Fuentes" },
      { type: "added", description: "Pestaña IA rediseñada con templates de prompt, preview limpio y split de prompt", location: "IA" },
      { type: "added", description: "Vista de calendario como tercera pestaña", location: "Programación" },
      { type: "added", description: "Filtro por idioma, discover de RSS, publicar desde IA y guardar resultados IA", location: "Fuentes" },
      { type: "added", description: "Checkboxes en tab IA, recuperar resultados guardados y navegación noticias → IA", location: "IA" },
      { type: "changed", description: "Nuevo logo y branding", location: "Landing" },
      { type: "fixed", description: "Límite de RSS a 10, colores por fecha y dashboard compacto", location: "Fuentes" },
      { type: "fixed", description: "Header único, navbar con título+usuario y configuración a 2 columnas", location: "Dashboard" },
      { type: "fixed", description: "Recolectar dentro de la tarjeta de noticia, módulos compactos y refresh tras delete", location: "Noticias" },
      { type: "fixed", description: "markNewsAsProcessed con tipo array SQL (useInArray)", location: "Noticias" },
      { type: "fixed", description: "Filtro de idioma de fuentes y ocultar feeds ya añadidos", location: "Fuentes" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-07-08",
    changes: [
      { type: "added", description: "Bottom bar con versión y acceso al changelog", location: "UI" },
      { type: "added", description: "Menú de usuario con Editar Perfil y Cerrar Sesión", location: "Cuenta" },
      { type: "added", description: "Módulo de edición de perfil (foto, nombre, contraseña)", location: "Cuenta" },
      { type: "added", description: "Módulo de administración de fuentes de noticias RSS/API", location: "Fuentes" },
      { type: "fixed", description: "Corrección en la recolección de noticias con mejor manejo de errores", location: "Noticias" },
      { type: "fixed", description: "Diagnóstico para problemas con API externas", location: "Noticias" },
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