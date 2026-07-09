# Changelog

## [1.1.0] - 2026-07-08

### Added
- Bottom bar con versión y acceso al changelog
- Menú de usuario con "Editar Perfil" y "Cerrar Sesión"
- Módulo de edición de perfil (foto, nombre, contraseña)
- Módulo de administración de fuentes de noticias RSS/API
- Gestión completa de fuentes de noticias (agregar, editar, eliminar)

### Fixed
- Corrección en la recolección de noticias con mejor manejo de errores
- Se agregó diagnóstico para problemas con API externas

## [1.0.0] - 2026-07-07

### Added
- Migración de Vite+React a Next.js 15 monorepo con Turborepo
- Autenticación con Auth.js v5 (email/password + LinkedIn OAuth)
- Panel de control con pestañas: Noticias, LinkedIn, Programación, IA
- Recolección de noticias via NewsAPI
- Conexión con LinkedIn para publicar
- Programación de publicaciones con configuración por día
- Procesamiento de noticias con IA (DeepSeek)
- Sistema de 5 categorías predeterminadas
- Base de datos Neon con Drizzle ORM (9 tablas)

## [0.1.0] - 2026-07-06

### Added
- Configuración inicial del monorepo
- Estructura base del proyecto Next.js
- Esquemas de base de datos iniciales
