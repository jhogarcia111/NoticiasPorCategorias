# Changelog

Todas las versiones notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/) y este proyecto usa [SemVer](https://semver.org/).

## [1.18.0] - 2026-08-14

### Added
- Publica como página de empresa de LinkedIn con scopes ampliados
- Deduplicación y consolidación de perfiles de LinkedIn (upsert al guardar)

### Fixed
- Guarda el perfil de LinkedIn en el callback y reactiva la conexión al reconectar
- Scope de organización en login social y diagnóstico de organizaciones
- Revertidos scopes de organización del login no autorizados por LinkedIn

## [1.17.0] - 2026-08-13

### Added
- Módulo de analíticas e impacto de LinkedIn
- Selector de qué publicar hoy (blog / video / social)
- Proveedores de fuentes avanzadas (ciencia, patentes, URL)

## [1.16.0] - 2026-08-12

### Added
- Editor táctil para móvil
- Paso del tour ancla la primera pestaña de Configuración

### Changed
- Unifica cuentas por email

### Fixed
- Tour de onboarding abre el menú real antes de cada leyenda
- Tour espera el montaje del tab antes de avanzar
- API de intro.js v8 — direction sin índice en onBeforeChange
- Import dinámico de intro.js y 4 imágenes splash Unsplash
- Evita subquery ambigua en el fallback de login

## [1.15.0] - 2026-08-11

### Added
- Noticias y borradores por usuario
- Onboarding con intro.js, splash screen e imagen IA

### Changed
- Diseño de splash screen y tour intro.js

## [1.14.0] - 2026-08-10

### Added
- Publicador automático de posts programados con zona horaria de Bogotá
- Botón de publicación manual en calendario y publicadas
- Guardar y mostrar imagen al programar/publicar
- Estructura narrativa unida en los 4 modos IA
- Restaura etiqueta y título al recuperar noticia guardada

### Fixed
- Cron diario 7am Bogotá para plan Hobby
- Programar post con toISOString y prompt modo historia-urgencia

## [1.13.0] - 2026-08-09

### Added
- Editor IA: cuadro de texto auto-alto, etiqueta custom y guardados en sidebar

## [1.12.0] - 2026-08-05

### Added
- Dashboard con estadísticas, enlaces y borradores IA

### Fixed
- Correcciones menores en estadísticas y UI del dashboard

## [1.11.0] - 2026-08-02

### Added
- Botón regenerar post y persiste las ediciones

### Fixed
- Regenerar post ahora varía la redacción y avisa
- Regenerar post usa la misma receta del template
- Completa el post IA y agrega la línea Fuente

## [1.10.0] - 2026-08-01

### Added
- Titulares virales y cierre conversacional en los posts
- Dedupe de resultados IA por noticia y botón procesar con IA
- CRUD de categorías en la pestaña Configuración

### Changed
- Migra la IA a Groq y genera imágenes vía FAL/Stability
- Migra a la Images API de LinkedIn para posts de imagen

### Fixed
- Refuerza el prompt de titulares con ejemplos few-shot
- Restaura distribution requerido en Posts API de LinkedIn
- Parseo correcto del polling de estado de imagen de LinkedIn

## [1.9.1] - 2026-07-31

### Changed
- Edición de imágenes en la landing

### Fixed
- Usa /everything con keywords en español para recolectar noticias
- Seed reactiva categorías existentes para arreglar la recolección de noticias

## [1.9.0] - 2026-07-23

### Added
- Pagos online con Wompi (Colombia, COP)
- Plan Pioneer Cofounder y página de precios
- Panel admin y cancelación de suscripción

### Changed
- Ribbon diagonal Recomendado + costo ~COP/día en membresías

### Fixed
- Precios correctos en DB (COP) y seed actualiza planes existentes
- Montos hardcodeados en checkout (ignora DB)
- Formato de URL de checkout Wompi con reference como query param
- Variables de entorno de Wompi alineadas a Vercel
- Display de precios, botón de Wompi y diálogo de checkout
- Strings de precios hardcodeados + todos los planes redirigen a Wompi

## [1.8.0] - 2026-07-16

### Added
- Galería de imágenes: guardar, eliminar, copiar prompt y restaurar al cargar
- Logging mejorado de errores de LinkedIn y decodificación con Buffer directo
- Notificaciones toast y sidebar colapsable en la navegación

### Changed
- Landing rediseñada

### Fixed
- Upload base64 sin links rotos en galería y extracción de base64 desde data URL
- Reemplaza operador spread por loop para evitar Maximum call stack size exceeded
- Comprime la imagen a JPEG 1200px antes de enviarla a LinkedIn
- Elimina mediaType no soportado y distribution object que causaban 500 en LinkedIn Posts API
- Fuentes dinámicas en preview y preservación del aspect ratio original

## [1.7.0] - 2026-07-15

### Added
- Pagos online (inicio de integración)

### Fixed
- Valores y publicación de membresías
- Enforce de URLs de fuente y prevención de alucinación de IA

## [1.6.0] - 2026-07-15

### Added
- Generación automática de imágenes con IA para posts de LinkedIn
- Nuevo flujo de imagen: plantilla de gráfica de noticia cinematográfica en 3 pasos (visual + selección de titular)
- Editor de imágenes interactivo: drag/resize de overlays, presets de etiqueta y compositing en canvas
- Ensamblador de imágenes basado en canvas (texto sobre imagen, compresión y titulares persistentes)
- Persistencia de plantilla y titulares al recuperar análisis guardado
- Guarda los metadatos de la imagen generada al seleccionarla

### Fixed
- Generación de imágenes secuencial, aspect ratio 16:9 y prompts concisos con retry
- Fuentes dinámicas en preview y preservación del aspect ratio original

## [1.5.0] - 2026-07-12

### Added
- Email templates con nodemailer
- Reset de contraseña
- Autenticación con Google OAuth

## [1.4.0] - 2026-07-11

### Added
- Vista de publicadas y tracking de noticias publicadas

### Changed
- Ajustes en la lógica de noticias y LinkedIn
- Idioma español-only en la app

### Fixed
- Crash por enlace RSS vacío, mejora del discover y propagación de errores

## [1.3.0] - 2026-07-10

### Changed
- Dashboard context y refactor grande de UI

### Fixed
- Import de noticias con API key

## [1.2.0] - 2026-07-09

### Added
- Noticias por categorías y personalizadas con gestión de categorías activables
- Búsqueda personalizada por keyword para recolectar noticias
- Más fuentes RSS (IA, robótica, tech), eliminar fuente con sus noticias y borrado masivo
- Pestaña IA rediseñada con templates de prompt, preview limpio y split de prompt
- Vista de calendario como tercera pestaña
- Filtro por idioma, discover de RSS, publicar desde IA y guardar resultados IA
- Checkboxes en tab IA, recuperar resultados guardados y navegación noticias → IA

### Changed
- Nuevo logo y branding

### Fixed
- Límite de RSS a 10, colores por fecha y dashboard compacto
- Header único, navbar con título+usuario y configuración a 2 columnas
- Recolectar dentro de la tarjeta de noticia, módulos compactos y refresh tras delete
- markNewsAsProcessed con tipo array SQL (useInArray)
- Filtro de idioma de fuentes y ocultar feeds ya añadidos

## [1.1.0] - 2026-07-08

### Added
- Bottom bar con versión y acceso al changelog
- Menú de usuario con Editar Perfil y Cerrar Sesión
- Módulo de edición de perfil (foto, nombre, contraseña)
- Módulo de administración de fuentes de noticias RSS/API

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