# AGENT_SYSTEM — NoticiasPorCategorías

## Descripción General

Plataforma SaaS de automatización de contenido para LinkedIn. Recolecta noticias vía NewsAPI/RSS, las procesa con IA (DeepSeek) y las publica automáticamente en LinkedIn según una programación calendarizada.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Monorepo | Turborepo v2 + npm workspaces |
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript |
| Frontend Legacy | Vite + React 18 + JavaScript (conviviendo en /src) |
| Estilos | Tailwind CSS v3/v4, tailwindcss-animate, CVA |
| DB | Neon Serverless PostgreSQL + Drizzle ORM v0.36 |
| Auth | NextAuth.js v5 beta (credentials + LinkedIn OAuth) + Supabase Auth |
| State | TanStack React Query v5, React Table v8 |
| Forms | React Hook Form v7 |
| Íconos | Lucide React |
| Fechas | date-fns v4 |
| IA | DeepSeek API (deepseek-chat) |
| Noticias | NewsAPI (newsapi.org) |
| LinkedIn | LinkedIn OAuth v2 + UGC Posts API |
| Deploy | Vercel |

---

## Estructura del Monorepo

```
/
├── apps/web/                     # Next.js 15 (activo, en Vercel)
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Landing pública
│       │   ├── layout.tsx        # Layout raíz (Navbar, Footer, Providers)
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   ├── dashboard/
│       │   │   ├── page.tsx
│       │   │   ├── layout.tsx
│       │   │   └── dashboard-client.tsx
│       │   └── api/              # API routes (Next.js Route Handlers)
│       ├── components/
│       │   ├── ui/               # Button, Card, Input, Badge
│       │   ├── navbar.tsx
│       │   ├── providers.tsx
│       │   ├── logo.tsx
│       │   ├── footer-wrapper.tsx
│       │   ├── edit-profile-dialog.tsx
│       │   ├── news/             # NewsManager, NewsList, NewsCard
│       │   ├── ai/               # AIManager
│       │   ├── categories/       # CategoryManager
│       │   ├── linkedin/         # LinkedInProfilesManager
│       │   ├── scheduling/       # CalendarView, SchedulingConfig, etc.
│       │   └── sources/          # SourcesManager
│       ├── hooks/                # use-news, use-ai, use-categories, etc.
│       ├── lib/
│       │   ├── auth.ts           # NextAuth config
│       │   ├── supabase-auth.ts  # Supabase REST helper
│       │   └── db.ts             # DB connection (Neon)
│       └── services/             # ai-service, news-service, linkedin-service, scheduling-service
├── packages/
│   ├── database/                 # Drizzle schema, migrations, seed
│   │   └── src/schema/           # 12 tablas
│   └── shared/                   # cn(), formatDate(), etc.
├── src/                          # Legacy Vite (conviviendo)
├── supabase/                     # Config + Edge Functions
├── SQL/                          # Migraciones SQL manuales
└── public/                       # Assets legacy
```

---

## Modelo de Datos (12 Tablas)

### `profiles` — Usuarios
- `id` (text PK) — Mapea al ID de Supabase Auth
- `username`, `avatar_url`
- `role` (enum: admin/user) — Default: user
- `created_at`, `updated_at`

### `categories` — Categorías/Fuentes de noticias
- `name`, `description`
- `newsapi_category` — Mapea a categorías de NewsAPI
- `rss_feed_url`, `provider_type` (newsapi/rss)
- `is_active`, `usage_count`
- `created_by` FK → profiles

### `linkedin_profiles` — Perfiles de LinkedIn conectados
- `user_id` FK → profiles
- `linkedin_id`, `profile_name`, `first_name`, `last_name`
- `access_token`, `refresh_token`, `token_expires_at`
- `profile_type` (personal/page), `is_active`, `is_primary`

### `profile_categories` — Relación N:N (linkedin_profiles ↔ categories)

### `news` — Noticias recolectadas
- `title`, `summary`, `source_url`, `source_name`
- `ai_summary`, `content`, `image_url`, `ai_image_url`
- `category_id` FK → categories
- `is_processed` (boolean), `ai_results` (jsonb)
- `published_at`, `language` (default 'es')

### `news_sources` — Fuentes RSS/API personalizadas
- `name`, `url`, `type` (rss/api), `category_id`
- `is_active`, `last_fetched_at`, `fetch_interval_minutes`

### `news_ai_results` — Resultados de IA por noticia
- `news_id` FK → news
- `template_id`, `template_name`, `language`
- `summary`, `linkedin_post`, `hashtags` (text[]), `image_prompt`

### `scheduled_posts` — Publicaciones programadas
- `profile_id`, `user_id`, `linkedin_profile_id`
- `post_content`, `title`, `content`, `summary`, `hashtags`, `image_url`
- `scheduled_time`, `timezone`
- `status` (enum: pending/published/failed/retrying/scheduled/cancelled)
- `linkedin_post_id`, `error_message`

### `post_news` — Relación N:N (scheduled_posts ↔ news) con `display_order`

### `scheduling_configs` — Config de scheduling por perfil
- `user_id`, `linkedin_profile_id`
- `enabled`, `timezone`
- `monday..sunday_enabled`, `_start_time`, `_end_time`, `_posts_count`
- `auto_generate_content`, `include_hashtags`, `include_summary`, `include_image`
- Unique (user_id, linkedin_profile_id)

### `audits` — Auditoría
- `user_id`, `action`, `details` (jsonb)

---

## Autenticación

- **NextAuth.js v5** con estrategia JWT
- **Providers**: Credentials (email+password) y LinkedIn OAuth
- Credentials delega a Supabase Auth REST (`/auth/v1/token?grant_type=password`)
- Registro vía `/api/auth/register` → crea auth user + profile en DB
- Session enriquecida con `id` y `role` del usuario via callbacks JWT/session
- LinkedIn OAuth usa scopes: `openid profile email w_member_social`

## API Routes (Next.js)

| Ruta | Métodos | Propósito |
|------|---------|-----------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler |
| `/api/auth/register` | POST | Registro de usuario |
| `/api/categories` | GET, POST, PATCH, DELETE | CRUD categorías |
| `/api/news` | GET, PATCH, DELETE | Listar/marcar/eliminar noticias |
| `/api/news/collect` | POST | Recolectar noticias desde NewsAPI |
| `/api/ai` | POST | Procesar noticia con DeepSeek |
| `/api/ai/save` | POST | Guardar resultado IA |
| `/api/ai/results` | GET | Obtener resultados IA |
| `/api/linkedin/auth-url` | GET | Obtener URL de OAuth LinkedIn |
| `/api/linkedin/callback` | POST | Manejar callback OAuth |
| `/api/linkedin/profiles` | GET | Listar perfiles LinkedIn |
| `/api/linkedin/publish` | POST | Publicar en LinkedIn |
| `/api/scheduling` | GET, POST, DELETE | CRUD programación |
| `/api/sources` | GET, POST | CRUD fuentes de noticias |
| `/api/sources/test` | POST | Probar conexión de fuente |
| `/api/profile` | GET, PATCH | Obtener/actualizar perfil |
| `/api/profile/password` | POST | Cambiar contraseña |

## Flujo Principal del Usuario

1. Se registra → crea perfil en `profiles`
2. Conecta LinkedIn → OAuth → almacena tokens en `linkedin_profiles`
3. Configura categorías de interés → se guardan en `categories` y `profile_categories`
4. Recolecta noticias → NewsAPI escribe en `news`
5. Procesa con IA → DeepSeek genera summary, post, hashtags, image_prompt → se guarda en `news_ai_results`
6. Programa publicaciones → `scheduling_configs` + `scheduled_posts`
7. El sistema publica automáticamente en LinkedIn según el calendario

## Plan de Monetización (SaaS)

- **Freemium**: 1 perfil LinkedIn, 10 noticias/mes, 1 categoría
- **Pro ($29/mes)**: 3 perfiles, 300 noticias/mes, 10 categorías, scheduling completo
- **Business ($79/mes)**: 10 perfiles, noticias ilimitadas, categorías ilimitadas, equipo hasta 3
- **Enterprise ($199/mes)**: Perfiles ilimitados, white-label, API access, soporte prioritario

## Conceptos Clave para el Agente

- El proyecto TIENE DOS frontends conviviendo: el activo es `apps/web/` (Next.js), el legacy es `src/` (Vite). **Siempre trabajar en `apps/web/`**.
- Usar `@/` alias para `apps/web/src/`.
- Drizzle ORM schemas están en `packages/database/src/schema/`.
- Los componentes UI base (Button, Card, Input, Badge) están en `apps/web/src/components/ui/`.
- Las queries/mutaciones React Query están en `apps/web/src/hooks/`.
- Todos los colores clave: `#0A66C2` (LinkedIn blue), `#1DB954` (verde crecimiento).
- El layout raíz ya incluye Navbar y FooterWrapper — las páginas nuevas se insertan vía children.

## Rutas de Archivos Importantes

```
apps/web/src/
├── app/
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Landing actual (REEMPLAZAR)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── dashboard/
├── components/
│   ├── navbar.tsx                # Navbar (ya incluye login/register links)
│   ├── logo.tsx                  # Componente Logo
│   ├── providers.tsx             # SessionProvider + QueryClient
│   ├── footer-wrapper.tsx
│   └── ui/
├── hooks/
├── lib/
└── services/
```
