# Diseño: Onboarding de la aplicación — Splash Screen + Tour intro.js

Estado: **IMPLEMENTADO** (commits `8c5260f` onboarding visual + `22e9628` scoping por usuario).

## 1. Objetivo

Enseñar a los usuarios nuevos **para qué sirve la aplicación** y **cómo empezar**, alineado con la filosofía, hipótesis y beneficios ya documentados en:
- Landing page (`apps/web/src/app/page.tsx`): "Importa noticias. Publica. Posiciónate."
- `AGENT_SYSTEM.md` — Directriz de Negocio: *generar conversación, engagement y viralidad*.
- `Documentación/Descripción de la aplicación.txt` — flujo real del producto.

Dos piezas:
1. **Splash / Welcome screen**: 4 cards, texto a la izquierda + imagen a la derecha (ambientes digitales). Se muestra una sola vez al primer ingreso de un usuario nuevo.
2. **Tour guiado con intro.js**: recorrido por Dashboard → Categorías → Importar noticias → Publicar.

---

## 2. Filosofía, hipótesis y beneficios (fuente del mensaje)

| Pilar | Mensaje base (landing/docs) |
|---|---|
| Filosofía | "Tu conocimiento merece ser visto. Nosotros ponemos las palabras." / "La IA escribe con tu estilo y tu voz." |
| Hipótesis | Contenido **consistente** + IA **con tu voz** + **programación automática** = autoridad en LinkedIn → oportunidades (headhunters, clientes, ascensos). |
| Beneficio 1 | "De la noticia a tu perfil en 2 clics." La IA escribe; tú solo apruebas. |
| Beneficio 2 | "Suena a ti, no a un robot." 4 estilos: crítico, educativo, satírico, ejecutivo. |
| Beneficio 3 | "Publica sin publicar." Calendario inteligente + publicación automática. "10 minutos al mes." |
| Beneficio 4 | "Conviértete en la referencia de tu industria." Alcance, interacciones, estadísticas. |

El splash convierte estos 4 beneficios en **4 cards** secuenciales.

---

## 3. Splash / Welcome Screen

### 3.1 Cuándo aparece
- Solo para **usuarios recién registrados** (primer ingreso post-login).
- Se muestra una vez: al completar o saltar el splash queda marcado como visto.
- Persistencia (doble mecanismo por robustez):
  - **DB**: columna `profiles.onboarding_done boolean default false` (+ `welcome_seen_at timestamp`) → se pone en `true` al terminar/saltar.
  - **localStorage**: `np_welcome_seen` como fallback offline y para evitar un round-trip.
- No bloquea indefinidamente: botón "Saltar" siempre visible.

### 3.2 Estructura visual
- **Overlay** full-screen (`fixed inset-0 z-[100]`) con fondo de gradiente de marca (`#0A66C2` → azul oscuro) + pattern de grid sutil (reutiliza estética del hero de la landing).
- **Contenedor** centrado, 2 columnas en desktop:
  - **Izquierda (60%)**: eyebrow + título + descripción + bullets de valor + navegación (dots) + botones.
  - **Derecha (40%)**: imagen del ambiente digital, en card redondeada con sombra (misma estética que hero/beneficios de la landing).
- **Mobile**: se apilan (imagen arriba, texto abajo).
- **Stepper**: 4 pasos con dots de progreso (active dot expandido, igual que el carrusel hero). Flechas prev/next + teclado.

### 3.3 Las 4 cards (texto izquierda / imagen derecha)

| # | Eyebrow | Título | Descripción | Icono | Imagen (ambiente digital) |
|---|---|---|---|---|---|
| 1 | Paso 1 | **Importa solo lo que importa** | Conecta tus categorías y fuentes. La plataforma recolecta automáticamente las noticias de tu industria. Nada de perder horas buscando. | `Newspaper` | Dashboard/feeds de datos en pantalla. Unsplash `photo-1551288049-bebda4e38f71` |
| 2 | Paso 2 | **La IA escribe como tú** | Selecciona noticias y la IA genera el post en 4 estilos: crítico, educativo, satírico, ejecutivo. Tú das el visto bueno. Suena a ti, no a un robot. | `Brain` | Entorno digital de IA. Unsplash `photo-1677442136019-21780ecad995` |
| 3 | Paso 3 | **Publica sin publicar** | Programa tu calendario una vez. El sistema publica solo en horarios óptimos. Presencia 24/7. 10 minutos al mes. | `Calendar` | Automatización/panel digital. Unsplash `photo-1550751827-4bd374c3f58b` |
| 4 | Paso 4 | **Posiciónate en tu industria** | Contenido relevante y consistente atrae headhunters, clientes y oportunidades. Mira tu impacto crecer en números. | `Award` | Analítica de crecimiento en pantalla. Unsplash `photo-1526304640581-d334cdbbf45e` |

> **Nota imágenes**: son placeholders de Unsplash (misma fuente que la landing). Si se prefiere, se reemplazan por generadas con pollinations.ai (según `AGENT_SYSTEM.md`), con `alt` descriptivo y `loading="lazy"`.

### 3.4 Copy del último paso (CTA)
- Título final: **"Tu historia profesional merece ser contada."**
- Texto: "No necesitas más horas. Necesitas las herramientas correctas."
- Botón primario: **"Comenzar tour"** → lanza intro.js.
- Botón secundario: **"Empezar a usar"** → cierra splash, va al Dashboard.
- Link: "Omitir onboarding".

### 3.5 Archivos propuestos
- Nuevo: `apps/web/src/components/onboarding/SplashScreen.tsx`
- Nuevo: `apps/web/src/components/onboarding/splash-steps.ts` (datos de las 4 cards + imágenes)
- Nuevo: `apps/web/src/components/onboarding/OnboardingGate.tsx` (decide mostrar splash/tour según flag)
- Editar: `apps/web/src/app/dashboard/layout.tsx` o `dashboard-client.tsx` (montar gate)
- Editar: `/api/profile` (GET/PATCH `onboarding_done`) — o columna nueva + migración Drizzle.

---

## 4. Tour guiado con intro.js

### 4.1 Librería
- `intro.js` (CSS propio) — o el wrapper `intro.js-react` si se prefiere API declarativa.
- Instalación: `npm i intro.js` + importar `intro.js/introjs.css` y estilos override de marca (`#0A66C2`, roundness, tipografía).
- El tour respeta dark mode y usa `highlightClass`/`overlay` de intro.js.

### 4.2 Cuándo aparece
- Al pulsar **"Comenzar tour"** desde el splash.
- **Siempre disponible** para cualquier usuario desde un botón de ayuda en el header del dashboard (icono `Compass` o `HelpCircle`) → vuelve a lanzarlo.
- Se puede re-lanzar desde Configuración ("Volver a ver el recorrido").

### 4.3 Mecánica cross-tab (importante)
El dashboard es por tabs (`DashboardProvider.activeTab`). intro.js requiere que el elemento objetivo exista en el DOM. El tour **cambia de tab programáticamente** en cada paso:
- `OnboardingTour` escucha `onchange` de intro.js: según el paso, llama `setActiveTab(tab)`.
- Tras el cambio de tab, espera el render (rAF/`setTimeout`) y ejecuta `intro.refresh()` para realinear el spotlight.
- Los elementos objetivo llevan `id`/`data-intro` estables para selectores confiables.

### 4.4 Pasos del tour

| # | Tab activa | Objetivo (selector) | Título | Mensaje |
|---|---|---|---|---|
| 1 | home | *(ninguno — tooltip centrado)* | Bienvenido | "Este es tu panel. Aquí gestionas noticias, generas contenido con IA y programas publicaciones para LinkedIn." |
| 2 | home | `#dash-welcome` (card "Bienvenido, {nombre}") | El Dashboard | "El centro de control: tus números de un vistazo y accesos directos a las acciones principales." |
| 3 | home | `#dash-stats` (grid de stats) | Tus métricas | "Noticias totales, por procesar, borradores IA y publicadas hoy. Haz clic para ir directo." |
| 4 | home | `#nav-sidebar` (sidebar) | Navegación | "Inicio, Noticias, IA, Calendario, Publicadas y Configuración. Cada sección hace una parte del trabajo." |
| 5 | config | `#cat-manager` (sección Categorías) | Configura tus categorías | "Activa las que ya existen o crea las tuyas. Solo las activas se usan al recolectar. Define qué noticias importan para tu industria." |
| 6 | news | `#btn-collect` (botón Recolectar) | Importa noticias | "Recolecta las noticias de tus categorías activas con un clic. Usa el buscador para temas específicos." |
| 7 | news | `#btn-ai` (botón "IA (n)") | Selecciona y envía a IA | "Marca las noticias que quieras publicar y envíalas al asistente de IA." |
| 8 | ai | `#ai-panel` (panel preview IA) | Publica con IA | "Elige estilo (crítico, educativo, satírico, ejecutivo), revisa el post, guárdalo como borrador." |
| 9 | calendar | `#cal-view` (calendario) | Programa la publicación | "Arrastra/agenda tu borrador en el calendario. El sistema publica solo en el horario elegido." |
| 10 | published | `#nav-published` | Historial | "Todo lo publicado y programado, con estado. Ahí ves tu impacto crecer." |
| 11 | home | *(ninguno)* | ¡Listo! | "Importa. Publica. Posiciónate. Tu próxima oportunidad puede empezar con un post." Botón: "Empezar a crear". |

### 4.5 Archivos propuestos
- Nuevo: `apps/web/src/components/onboarding/TourSteps.ts` (config de pasos: tab + selector + copy)
- Nuevo: `apps/web/src/components/onboarding/OnboardingTour.tsx` (controlador intro.js + cambio de tabs)
- Editar: `apps/web/src/components/news/news-manager.tsx` (añadir `id="btn-collect"`, `id="btn-ai"`)
- Editar: `apps/web/src/components/categories/category-manager.tsx` (`id="cat-manager"`)
- Editar: `apps/web/src/app/dashboard/layout.tsx` (`id="nav-sidebar"`, `id="nav-published"`, botón ayuda en header)
- Editar: `apps/web/src/components/scheduling/calendar-view.tsx` (`id="cal-view"`)
- Editar: `apps/web/src/components/news/published-view.tsx` (target del paso 10 si se prefiere contenido)
- Editar: `apps/web/src/app/globals.css` o import CSS de intro.js + override de marca.

---

## 5. Hallazgo adicional: noticias y borradores visibles para todos (bug)

El usuario reportó: *"Aparecen las noticias y borradores de todos... deben ser por usuario."* Confirmado en código:

- `apps/web/src/app/api/news/route.ts` → `GET` devuelve **todas** las noticias sin filtro por usuario.
- `apps/web/src/app/api/ai/saved-results/route.ts` → `GET` devuelve **todos** los borradores IA sin filtro.
- Schema (`packages/database/src/schema/news.ts` y `news-ai-results.ts`): **no existe columna `user_id`**.

### Propuesta de solución (diseño, no implementado aún)
1. **Migración Drizzle**: añadir `user_id` a `news` y `news_ai_results` (FK → `profiles.id`), con default al usuario que recolecta/genera.
2. `news-service.collectNews` → asociar noticias al `user_id` de la sesión.
3. `POST /api/ai/save` y `GET /api/ai/saved-results` → guardar/filtrar por `user_id`.
4. `GET /api/news`, `PATCH`, `DELETE` → filtrar/limitar por `user_id`.
5. `POST /api/news/collect` → dedupe global se mantiene (las noticias son compartidas como "insumo" pero cada usuario ve su colección) — **decidir**: ¿noticias compartidas o por usuario? Recomendación inicial: colección por usuario con dedupe global por `source_url` para no duplicar costos de NewsAPI.
6. Dashboard stats (`/api/stats`) → scoping por usuario.

> Esto se implementa como **tarea separada** del onboarding (es un cambio de schema + servicios). Se puede hacer en paralelo o después del splash/tour.

---

## 6. Plan de implementación (después de aprobación)

**Fase A — Onboarding visual (splash + tour)**
1. `npm i intro.js` en `apps/web`.
2. Migración `profiles.onboarding_done`.
3. Componentes `SplashScreen`, `OnboardingGate`, `OnboardingTour`, `TourSteps`, `splash-steps`.
4. Ids/selectores en componentes del dashboard.
5. Botón "volver a ver tour" en header.
6. Estilos intro.js con marca (`#0A66C2`).

**Fase B — Scoping por usuario**
1. Migración `user_id` en `news` y `news_ai_results`.
2. Ajuste de servicios y endpoints.
3. Stats por usuario.

**Verificación**
- `npm run lint` en `apps/web`.
- `npm run build` en `apps/web`.
- Prueba manual: registro nuevo → splash → tour completo → cada paso con spotlight correcto.
- Prueba móvil (splash apilado) y desktop.

---

## 7. Preguntas abiertas para el usuario

Resueltas durante la implementación:

1. **Noticias por usuario**: se implementó colección por usuario con dedupe por `(user_id, source_url)` (Fase B).
2. **Splash**: se muestra a usuarios nuevos y a existentes sin flag (`onboarding_done=false`); doble persistencia DB + localStorage.
3. **Imágenes**: las 4 cards usan Unsplash (URLs del doc, mismas de la landing). Reemplazables por generadas con `scripts/generate-splash-images.mjs` (requiere `GEMINI_API_KEY`).
4. **Tour**: se lanza al pulsar "Comenzar tour" desde el splash, y siempre desde el botón "Recorrido" del header.
