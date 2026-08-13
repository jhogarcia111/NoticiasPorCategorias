# Informe de Factibilidad: Módulo de Analíticas e Impacto de LinkedIn

## 1. Alcance

Este informe documenta la viabilidad de los **scopes** y **endpoints** de la API de LinkedIn
usados por el módulo de Analíticas (baseline, métricas por publicación y métricas acumuladas)
y las limitaciones entre **cuentas personales** vs **páginas de empresa**.

Fecha: 2026-08-13. Proyecto: NoticiasPorCategorías.

---

## 2. Estado actual de la integración

La aplicación ya usa el flujo OAuth 2.0 con los scopes:

| Scope | Uso actual |
|---|---|
| `openid` | Obtener `sub` (LinkedIn URN) e identidad |
| `profile` | Nombre, apellido, foto |
| `email` | Email del usuario |
| `w_member_social` | Publicar posts en el perfil personal |

El módulo de analíticas **no requiere scopes adicionales para la publicación** pero **sí necesita
acceso de lectura a métricas**, que no está cubierto por los scopes actuales.

---

## 3. Scopes investigados y estado

| Scope | Endpoint | Disponible hoy | Perfil personal | Página de empresa |
|---|---|---|---|---|
| `w_member_social` | `POST /rest/posts` | ✅ Ya integrado | ✅ | ❌ (requiere `w_organization_social`) |
| `r_member_social` | Lectura de posts del miembro (`ugcPosts`) | ⚠️ Requiere **partnership** aprobado | Parcial | — |
| `r_organization_social` | `organizationalEntityShareStatistics` | ⚠️ Requiere **partnership** + ser admin de la página | — | ✅ (si partner) |
| `r_liteprofile` | `userinfo` | ✅ Ya integrado | ✅ | ✅ |
| `r_emailaddress` | `emailAddress` | ✅ Ya integrado | ✅ | ✅ |
| `r_basicprofile` / `networkSizes` | Conteo de conexiones | ❌ **Deprecado** en v2 | ❌ | ❌ |
| Member Data Portability | Visitas al perfil, followers | ❌ Solo para partners aprobados bajo contrato | ❌ | ❌ |

---

## 4. Limitaciones críticas por tipo de cuenta

### 4.1 Cuentas personales (perfil de usuario)

1. **No existe endpoint público de métricas por post (impresiones, reacciones, comentarios).**
   LinkedIn reserva `r_member_social` + acceso a `totalShareStatistics` para partners con
   contrato (Marketing Developer Platform / Community Management API). Sin partnership,
   las llamadas responden `403 FORBIDDEN` o no devuelven las estadísticas.
2. **El conteo de seguidores/conexiones no es accesible.** El endpoint `networkSizes` fue
   deprecado y eliminado de la API v2 pública. La alternativa (Member Data Portability) exige
   aprobación contractual.
3. **Las visitas al perfil no existen en la API pública.** Es una métrica del producto
   (dashboard nativo de LinkedIn) sin contraparte en la API abierta para personas.

### 4.2 Páginas de empresa (Community Management)

1. `organizationalEntityShareStatistics` devuelve `impressionCount`, `likeCount`,
   `commentCount` y `shareCount` reales por post.
2. `organizationalEntityFollowerStatistics` devuelve el crecimiento de followers de la página.
3. **Requisito:** ser admin de la página, solicitar `r_organization_social` y estar aprobado
   como partner (o usar el programa "Community Management API").

### 4.3 Conclusión de factibilidad

- La publicación por perfil personal ya funciona.
- Las **métricas por post** y el **baseline de followers** **no son obtenibles por API pública
  en cuentas personales** hoy.
- Por ello el módulo implementa un **flujo híbrido**:

---

## 5. Estrategia implementada (flujo híbrido)

| Métrica | Estrategia | Fuente |
|---|---|---|
| Baseline de followers/conexiones | Intento de `networkSizes` (mejor esfuerzo) + **captura manual** desde la UI | API (si responde) / manual |
| Métricas por post (impresiones, likes, comentarios, shares) | Intento de `organizationalEntityShareStatistics` (empresas) y `ugcPosts.totalShareStatistics` (personas). Si responde `403`/vacío, se registra snapshot `unavailable` | API / marcador `unavailable` |
| Visitas al perfil | No disponible → se usa **alcance acumulado** (impresiones de posts) como proxy | Derivada |
| Crecimiento de red | `seguidores actuales − baseline` | Derivada |
| Tendencia semanal | Agregación de snapshots de `post_metrics_history` | Base de datos |

### Cuándo desbloquear datos 100% reales

1. Solicitar **partnership** de LinkedIn (Marketing Developer Platform).
2. Obtener aprobación para `r_member_social` + `r_organization_social`.
3. Completar el **Member Data Portability application** para followers y visitas.
4. Alternativa de corto plazo: migrar usuarios a **páginas de empresa** (Community
   Management API), donde las métricas sí están disponibles.

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