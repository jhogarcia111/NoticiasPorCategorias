# Archivos Batch para Configuración

He creado varios archivos batch para facilitar la configuración y mantenimiento del proyecto:

## 📁 Archivos Batch Disponibles

### 1. `generate-env.bat`
**Propósito**: Genera el archivo `.env` con las credenciales de Supabase ya configuradas.

**Uso**: 
```bash
generate-env.bat
```

**Funcionalidad**:
- Crea el archivo `.env` con las credenciales de Supabase
- Pregunta antes de sobrescribir si ya existe
- Muestra un resumen de las credenciales configuradas

### 2. `setup-project.bat`
**Propósito**: Setup completo del proyecto (genera .env + instala dependencias).

**Uso**:
```bash
setup-project.bat
```

**Funcionalidad**:
- Ejecuta `generate-env.bat`
- Instala todas las dependencias con `npm install`
- Verifica que todo esté configurado correctamente
- Opción para iniciar el servidor de desarrollo

### 3. `update-env-credentials.bat`
**Propósito**: Actualiza credenciales específicas en el archivo `.env`.

**Uso**:
```bash
update-env-credentials.bat
```

**Funcionalidad**:
- Menú interactivo para seleccionar qué credenciales actualizar
- Opciones: LinkedIn, NewsAPI, OpenAI, Stability AI, o todas
- Actualiza solo las credenciales seleccionadas
- Mantiene las credenciales de Supabase intactas

### 4. `supabase-setup-guide.bat`
**Propósito**: Guía paso a paso para configurar Supabase.

**Uso**:
```bash
supabase-setup-guide.bat
```

**Funcionalidad**:
- Guía interactiva para configurar Supabase
- Instrucciones detalladas para cada paso
- Verificación de configuración
- Opción para instalar dependencias al final

## 🚀 Flujo de Trabajo Recomendado

### Para configuración inicial:
```bash
# Opción 1: Setup completo automático
setup-project.bat

# Opción 2: Paso a paso
generate-env.bat
npm install
npm run dev
```

### Para actualizar credenciales:
```bash
update-env-credentials.bat
```

### Para configurar Supabase:
```bash
supabase-setup-guide.bat
```

## 📋 Credenciales Configuradas

### ✅ Ya configuradas (Supabase):
- **URL**: `https://ctwyiygyefrbpmgnlkgg.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### ⏳ Pendientes de configurar:
- **LinkedIn Client ID**: Para OAuth de LinkedIn
- **LinkedIn Client Secret**: Para OAuth de LinkedIn
- **NewsAPI Key**: Para obtener noticias
- **OpenAI API Key**: Para generar resúmenes e imágenes
- **Stability AI API Key**: Alternativa para generar imágenes

## 🔧 Personalización

Si necesitas cambiar las credenciales de Supabase en el futuro, edita estos archivos:
- `generate-env.bat` (líneas 20-21)
- `update-env-credentials.bat` (líneas 45-46)

## 💡 Consejos de Uso

1. **Siempre ejecuta los batch files como administrador** si tienes problemas de permisos
2. **Mantén una copia de seguridad** de tu archivo `.env` antes de actualizarlo
3. **No compartas** el archivo `.env` - está en `.gitignore`
4. **Usa `update-env-credentials.bat`** cuando obtengas nuevas API keys

## 🆘 Solución de Problemas

### Error: "npm no se reconoce como comando"
- Instala Node.js desde https://nodejs.org
- Reinicia la terminal/CMD

### Error: "No se puede crear el archivo .env"
- Ejecuta como administrador
- Verifica permisos de escritura en la carpeta

### Error: "Supabase connection failed"
- Verifica que las credenciales sean correctas
- Asegúrate de que el proyecto de Supabase esté activo

---

**¡Usa estos archivos batch para una configuración rápida y sin errores!** 🚀
