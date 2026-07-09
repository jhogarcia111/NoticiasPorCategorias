export interface ChangelogEntry {
  version: string
  date: string
  changes: { type: "added" | "fixed" | "changed" | "removed"; description: string; location?: string }[]
}

export const changelogData: ChangelogEntry[] = [
  {
    version: "1.1.0",
    date: "2026-07-08",
    changes: [
      { type: "added", description: "Bottom bar con versión y acceso al changelog" },
      { type: "added", description: "Menú de usuario con Editar Perfil y Cerrar Sesión" },
      { type: "added", description: "Módulo de edición de perfil (foto, nombre, contraseña)" },
      { type: "added", description: "Módulo de administración de fuentes de noticias RSS/API" },
      { type: "fixed", description: "Corrección en la recolección de noticias con mejor manejo de errores" },
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

export const currentVersion = "1.1.0"
