# Publicador de Noticias LinkedIn

Una aplicación web para gestionar múltiples perfiles de LinkedIn y publicar resúmenes de noticias con imágenes generadas por IA.

## 🚀 Características

- **Gestión de Perfiles**: Conecta múltiples perfiles de LinkedIn (personal/empresa)
- **Recolección Automática**: Obtiene noticias de NewsAPI y fuentes RSS
- **IA Integrada**: Genera resúmenes e imágenes con OpenAI/Stability AI
- **Programación**: Programa publicaciones en LinkedIn
- **Dashboards**: Interfaces diferenciadas para usuarios y administradores
- **Seguridad**: Autenticación con Supabase y encriptación de tokens

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **APIs**: LinkedIn API, NewsAPI, OpenAI/Stability AI
- **UI**: shadcn/ui components + Lucide React icons

## 📋 Prerrequisitos

- Node.js 18+ 
- Cuenta de Supabase
- Cuenta de LinkedIn Developer
- API Key de NewsAPI
- API Key de OpenAI o Stability AI

## ⚙️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd publicador-noticias-linkedin
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` con tus credenciales:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   VITE_LINKEDIN_CLIENT_ID=tu_linkedin_client_id
   VITE_LINKEDIN_CLIENT_SECRET=tu_linkedin_client_secret
   VITE_NEWSAPI_KEY=tu_newsapi_key
   VITE_OPENAI_API_KEY=tu_openai_key
   ```

4. **Configurar Supabase**
   - Crear nuevo proyecto en [supabase.com](https://supabase.com)
   - Ejecutar el script SQL del esquema de base de datos
   - Configurar políticas RLS
   - Configurar Edge Functions

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 🗄️ Base de Datos

El proyecto incluye un esquema completo de PostgreSQL con las siguientes tablas principales:

- `profiles` - Perfiles de usuario
- `categories` - Categorías de noticias
- `linkedin_profiles` - Perfiles de LinkedIn conectados
- `news` - Noticias recolectadas
- `scheduled_posts` - Publicaciones programadas
- `audits` - Logs del sistema

## 🔧 Configuración de APIs

### LinkedIn API
1. Crear aplicación en [LinkedIn Developer Portal](https://developer.linkedin.com)
2. Configurar redirect URI: `https://publicadordenoticias.excelparaejecutivos.net/auth/linkedin/callback`
3. Solicitar permisos: `r_liteprofile`, `w_member_social`, `w_organization_social`

### NewsAPI
1. Registrarse en [newsapi.org](https://newsapi.org)
2. Obtener API key gratuita (100 requests/día)

### OpenAI
1. Crear cuenta en [OpenAI](https://openai.com)
2. Generar API key para GPT-4 y DALL-E

## 🚀 Deployment

### Configuración del Dominio
- Dominio: `publicadordenoticias.excelparaejecutivos.net`
- Configurar como subdominio en el hosting

### Build para Producción
```bash
npm run build
```

### Variables de Entorno en Producción
Asegúrate de configurar todas las variables de entorno en tu hosting:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_LINKEDIN_CLIENT_ID`
- `VITE_LINKEDIN_CLIENT_SECRET`
- `VITE_NEWSAPI_KEY`
- `VITE_OPENAI_API_KEY`

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── auth/          # Componentes de autenticación
│   ├── common/        # Componentes reutilizables
│   ├── dashboard/     # Dashboards de usuario y admin
│   ├── news/          # Gestión de noticias
│   ├── profiles/      # Gestión de perfiles LinkedIn
│   └── scheduling/    # Programación de publicaciones
├── contexts/          # Contextos de React
├── hooks/             # Custom hooks
├── services/          # Servicios de API
├── utils/             # Utilidades
└── pages/             # Páginas principales
```

## 🔐 Seguridad

- Autenticación con Supabase Auth
- Encriptación de tokens de LinkedIn
- Row Level Security (RLS) en PostgreSQL
- Validación de entrada en formularios
- Manejo seguro de errores

## 📊 Monitoreo

- Logs de auditoría en tabla `audits`
- Métricas de uso en dashboard admin
- Alertas por email para errores críticos
- Monitoreo de cuotas de APIs

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo

---

**Desarrollado para excelparaejecutivos.net**
