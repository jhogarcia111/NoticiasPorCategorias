# Informe de Factibilidad: Módulo de Analíticas e Impacto de LinkedIn

## 1. Alcance

Este informe documenta la viabilidad de los **scopes** y **endpoints** de la API de LinkedIn
usados por el módulo de Analíticas (baseline, métricas por publicación y métricas acumuladas)
y las limitaciones entre **cuentas personales** vs **páginas de empresa**.

Fecha: 2026-08-14. Proyecto: NoticiasPorCategorías.

---

## 2. Estado actual de la integración

La aplicación ya usa el flujo OAuth 2.0 con los scopes:

| Scope | Uso actual |
|---|---|
| `openid` | Obtener `sub` (LinkedIn URN) e identidad |
| `profile` | Nombre, apellido, foto |
| `email` | Email del usuario |
| `w_member_social` | Publicar posts en el perfil personal |
| `r_1st_connections_size` | Conteo de conexiones de 1er grado (Connections Size API) |
| `r_organization_social` | Analíticas de la página de empresa (share statistics) |
| `r_organization_admin` | Listar páginas administradas (organizationAcls) y followers |
| `w_organization_social` | Publicar posts como página de empresa |

> **Nota:** al ampliar el scope, los usuarios ya conectados deben **re-conectar** su perfil
> para que el nuevo token incluya los scopes de lectura/empresa.

---

## 3. Scopes investigados y estado

| Scope | Endpoint | Disponible hoy | Perfil personal | Página de empresa |
|---|---|---|---|---|
| `w_member_social` | `POST /rest/posts` | ✅ Ya integrado | ✅ | ❌ (requiere `w_organization_social`) |
| `w_organization_social` | `POST /rest/posts` | ✅ Ya integrado (author = org) | — | ✅ |
| `r_1st_connections_size` | `GET /v2/connections/urn:li:person:{id}` | ✅ Ya integrado | ✅ Conexiones | — |
| `r_organization_social` | `organizationalEntityShareStatistics` | ✅ Ya integrado (si admin de la página) | — | ✅ |
| `r_organization_admin` | `GET /v2/organizationAcls?q=roleAssignee` | ✅ Ya integrado | — | ✅ Listar páginas |
| `r_organization_admin` | `GET /v2/networkSizes/urn:li:organization:{id}` | ✅ Ya integrado | — | ✅ Followers de la página |
| `r_member_social` | Lectura de posts del miembro (`ugcPosts`) | ⚠️ Requiere **partnership** aprobado | Parcial | — |
| `r_liteprofile` | `userinfo` | ✅ Ya integrado | ✅ | ✅ |
| `r_emailaddress` | `emailAddress` | ✅ Ya integrado | ✅ | ✅ |
| `r_basicprofile` / `networkSizes` (persona) | Conteo de conexiones | ❌ **Deprecado** en v2 | ❌ | ❌ |
| Member Data Portability | Visitas al perfil, followers del perfil | ❌ Solo para partners aprobados bajo contrato | ❌ | ❌ |

---

## 4. Limitaciones críticas por tipo de cuenta

### 4.1 Cuentas personales (perfil de usuario)

1. **No existe endpoint público de métricas por post (impresiones, reacciones, comentarios).**
   LinkedIn reserva `r_member_social` + acceso a `totalShareStatistics` para partners con
   contrato (Marketing Developer Platform / Community Management API). Sin partnership,
   las llamadas responden `403 FORBIDDEN` o no devuelven las estadísticas.
2. **El conteo de conexiones de 1er grado SÍ es accesible** vía Connections Size API
   (`r_1st_connections_size`): `GET /v2/connections/urn:li:person:{id}` → `firstDegreeSize`.
   Reemplaza al deprecado `networkSizes`.
3. **El conteo de seguidores del perfil personal NO es accesible.** `networkSizes` de persona
   fue deprecado; la alternativa (Member Data Portability / `memberFollowersCount`) exige
   `r_member_profileAnalytics`, no disponible.
4. **Las visitas al perfil no existen en la API pública.** Es una métrica del producto
   (dashboard nativo de LinkedIn) sin contraparte en la API abierta para personas.

### 4.2 Páginas de empresa (Community Management)

1. `organizationalEntityShareStatistics` devuelve `impressionCount`, `likeCount`,
   `commentCount` y `shareCount` reales por post de la página.
2. `GET /v2/networkSizes/urn:li:organization:{id}?edgeType=COMPANY_FOLLOWED_BY_MEMBER`
   devuelve el número de followers de la página (`firstDegreeSize`).
3. `GET /v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR` lista las páginas que
   administra el usuario conectado (para el flujo "Conectar Página").
4. **Requisito:** ser admin de la página (`r_organization_admin` + `w_organization_social`).

### 4.3 Conclusión de factibilidad

- La publicación funciona en **perfil personal** (`w_member_social`) y **página de empresa**
  (`w_organization_social`, author = org URN).
- Las **métricas por post** y el **baseline de followers** en cuentas personales **no son
  obtenibles por API pública** hoy; pero las **páginas de empresa sí tienen métricas reales**.
- Por ello el módulo implementa un **flujo híbrido** y recomienda las páginas de empresa
  para datos 100% reales.

---

## 5. Estrategia implementada (flujo híbrido)

| Métrica | Estrategia | Fuente |
|---|---|---|
| Baseline de conexiones (personal) | **Connections Size API** (`r_1st_connections_size`) | API |
| Baseline de followers (empresa) | **networkSizes org** (`edgeType=COMPANY_FOLLOWED_BY_MEMBER`) | API |
| Baseline de followers (personal) | **Captura manual** desde la UI (no hay API pública) | Manual |
| Métricas por post (empresa) | `organizationalEntityShareStatistics` | API |
| Métricas por post (personal) | `ugcPosts.totalShareStatistics`; si responde `403`/vacío, snapshot `unavailable` | API / marcador `unavailable` |
| Visitas al perfil | No disponible → se usa **alcance acumulado** (impresiones de posts) como proxy | Derivada |
| Crecimiento de red | `seguidores actuales − baseline` | Derivada |
| Tendencia semanal | Agregación de snapshots de `post_metrics_history` | Base de datos |

### Publicación en páginas de empresa

- El flujo "Conectar Página" lista las páginas que el usuario administra vía
  `GET /v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR` y las guarda con
  `profile_type = 'company'`.
- `postToLinkedIn` usa `author = urn:li:organization:{id}` cuando el perfil es de empresa.
- `uploadImageToLinkedIn` usa el owner de la organización para el registro de imagen.

### Cuándo desbloquear datos 100% reales

1. Usar **páginas de empresa** (Community Management API), ya habilitadas, donde
   las métricas sí están disponibles.
2. Para métricas del perfil personal: solicitar **partnership** de LinkedIn y aprobación
   de `r_member_social` / `r_member_profileAnalytics`.
3. Completar el **Member Data Portability application** para followers y visitas.

---

## 6. Modelo de datos

| Tabla | Propósito | Campos clave |
|---|---|---|
| `profile_baselines` | Snapshot inicial al conectar | `linkedin_profile_id`, `initial_followers_count`, `initial_connections_count`, `initial_profile_views`, `reach_baseline`, `source` (`api`/`manual`), `snapshot_date` |
| `post_metrics_history` | Métricas por post en días 0/1/3/7/14/30 | `scheduled_post_id`, `linkedin_post_id`, `snapshot_day`, `impression_count`, `like_count`, `comment_count`, `share_count`, `engagement_rate`, `source`, `raw_payload` |
| `overall_analytics` | Acumulado semanal por perfil | `week_start`, `followers_count`, `net_follower_gain`, `total_impressions`, `total_reactions`, `total_comments`, `total_shares`, `total_posts` |

Las tres tablas usan RLS-equivalente por `user_id` y llaves foráneas en cascada
(`auth.users` / `profiles`, `linkedin_profiles`, `scheduled_posts`).

---

## 7. Endpoints de backend

| Endpoint | Método | Función |
|---|---|---|
| `/api/analytics?userId=` | GET | Dashboard agregado (baseline + posts + tendencia) |
| `/api/analytics/baseline?profileId=` | GET / POST | Leer / capturar baseline (manual o API) |
| `/api/analytics/metrics?postId=` | GET / POST | Historial de métricas / refrescar snapshot del post |
| `/api/analytics/cron` | GET | Worker: refresca snapshots vencidos y acumulado semanal |

Cron en `vercel.json`: `30 12 * * *` (diario, 30 min después del publish-due).

---

## 8. UI (Dashboard "Impacto & Estadísticas")

1. **Panel de impacto:** *"Desde que te uniste el [fecha], tus posts han alcanzado a X
   personas"* con crecimiento de red y % vs baseline.
2. **Rendimiento por publicación:** badges 👁️ Visualizaciones | 👍 Reacciones | 💬 Comentarios |
   📈 Engagement + seguimiento de snapshots (d1, d3, d7, d14, d30).
3. **Gráfico de tendencia:** barras semanales de impresiones (SVG propio, sin dependencias).

---

## 9. Decisiones de diseño

- **Sin dependencias nuevas:** el gráfico es SVG inline; evita agregar `recharts`.
- **Degradación elegante:** si la API no responde, se registra snapshot `unavailable` y la UI
  muestra un aviso claro en lugar de ceros falsos.
- **Baseline manual:** la UI permite al usuario capturar/editar su baseline si la API no lo
  devuelve (requisito 2.b de la especificación).