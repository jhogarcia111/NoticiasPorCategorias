# Noticias por Categorías- Linkedin

## 📋 Descripción
Herramienta para organizar y categorizar noticias en LinkedIn que permite a los usuarios filtrar contenido por categorías específicas, crear feeds personalizados, y recibir notificaciones sobre temas de interés. Incluye análisis de tendencias, seguimiento de hashtags, y herramientas de engagement. Facilita la gestión de información profesional y el networking efectivo. Dirigido a profesionales, empresarios, y usuarios activos de LinkedIn que buscan optimizar su consumo de contenido profesional. 

## 🎯 Información del Proyecto
- **ID en Project Tracker**: 17
- **Tipo**: web
- **Estado**: Activo

## 🌐 Puertos Asignados
- **Backend**: http://localhost:3017
- **Frontend**: http://localhost:4017

## 🗄️ Base de Datos
- **Nombre**: `project_17`
- **Tipo**: MySQL
- **Puerto**: 3306
- **Host**: localhost
- **Cadena de Conexión**: `mysql://root@localhost:3306/project_17`


## 🚀 Inicio Rápido

### 1. Verificar Conexión al Project Tracker
```bash
curl http://localhost:3000/api/project-tracker/projects/17
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Iniciar Desarrollo
```bash
# Backend
npm run dev

# Frontend (en otra terminal)
cd frontend && npm run dev
```

## 📚 Documentación
- [Guía de Integración con Cursor](./docs/GUIA_CURSOR_NOTICIAS_POR_CATEGORÍAS-_LINKEDIN.md)
- [Guía de Debug Móvil](./docs/GUIA_DEBUG_MOVIL.md)
- [Project Tracker](http://localhost:3000)

## 🔧 Comandos Útiles

### Crear Feature
```bash
curl -X POST http://localhost:3000/api/project-tracker/features \
  -H "Content-Type: application/json" \
  -d '{"projectId": 17, "featureName": "Nueva Feature", "description": "Descripción", "status": "pendiente"}'
```

### Ver Features del Proyecto
```bash
curl http://localhost:3000/api/project-tracker/features?projectId=17
```

---
*Generado automáticamente por Project Tracker*

