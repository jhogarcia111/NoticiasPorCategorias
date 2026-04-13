# 🤖 Guía para Conectar Cursor al Project Tracker

## 📋 **Contexto del Proyecto**

Estás trabajando en el proyecto **"Noticias por Categorías- Linkedin"** (ID: 17) que está integrado al **Project Tracker**, un sistema de gestión de proyectos con piloto automático. Este documento te permitirá conectar tu sesión de Cursor con el sistema centralizado.

## 🎯 **Información del Proyecto**

### **Proyecto Actual:**
- **Nombre**: Noticias por Categorías- Linkedin
- **ID en Project Tracker**: 17
- **Tipo**: web
- **Estado**: Activo
- **Ubicación**: C:\Users\Jho\Documents\GitHub\ProjectTracker\docs\project-guides
- **Descripción**: Proyecto integrado con Project Tracker

### **Sistema Project Tracker:**
- **Backend**: http://localhost:3003
- **Frontend**: http://localhost:3000
- **Base de Datos**: MySQL (`project_tracker_standalone`)
- **Proyecto Principal**: Project Tracker (ID: 16)

## 🔧 **Configuración Inicial**

### **1. Verificar Conexión al Project Tracker**

```javascript
// Script para verificar conexión
const http = require('http');

function checkProjectTracker() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3003,
      path: '/api/project-tracker/projects/17',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const project = JSON.parse(data);
          console.log('✅ Proyecto Noticias por Categorías- Linkedin conectado:', project.name);
          resolve(project);
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Usar: checkProjectTracker().then(console.log).catch(console.error);
```

### **2. Verificar Features del Proyecto**

```javascript
// Script para ver features del proyecto
async function getProjectFeatures() {
  const response = await fetch('http://localhost:3003/api/project-tracker/features/17');
  const data = await response.json();
  console.log('📋 Features del Noticias por Categorías- Linkedin:', data.features?.length || 0);
  return data;
}
```

## 🚀 **Flujo de Trabajo con Project Tracker**

### **Proceso Establecido:**

#### **1. Crear Feature (Siempre que hagas cambios)**
```javascript
// Crear feature para documentar cambios
const featureData = {
  projectId: 17, // ID del Noticias por Categorías- Linkedin
  featureName: "Descripción concisa del cambio",
  description: "Descripción detallada del problema/solución",
  status: "pendiente", // SIEMPRE empezar con "pendiente"
  priority: "alta", // alta, media, baja
  assignedTo: "Sistema",
  isError: false,
  isImprovement: true,
  problemComment: "Descripción del problema identificado",
  resultComment: "Descripción de la solución implementada",
  progressComment: "Estado actual del desarrollo"
};

// Enviar al Project Tracker
fetch('http://localhost:3003/api/project-tracker/features', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(featureData)
});
```

#### **2. Cambiar Estado Durante Desarrollo**
```javascript
// Al comenzar a trabajar en la feature
fetch(`http://localhost:3003/api/project-tracker/features/${featureId}/status`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: "en_desarrollo" })
});

// Al terminar la implementación
fetch(`http://localhost:3003/api/project-tracker/features/${featureId}/status`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: "en_pruebas" })
});
```

#### **3. Agregar Comentarios al Historial**
```javascript
// Documentar cambios en el historial
const commentData = {
  changeReason: "Tipo de cambio",
  newValue: "Descripción detallada del cambio realizado",
  commentType: "Una mejora" // o "Un error", "Repetir", "Funcionó"
};

fetch(`http://localhost:3003/api/project-tracker/features/${featureId}/history`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(commentData)
});
```

## 📊 **Estados de Features (CRÍTICO)**

### **Flujo Correcto:**
```
pendiente → en_desarrollo → en_pruebas → aprobado
```

### **Reglas Importantes:**
- ✅ **SIEMPRE** crear features con estado "pendiente" inicialmente
- ✅ **NUNCA** crear con estado "en_pruebas" desde el inicio
- ✅ Cambiar a "en_pruebas" solo cuando esté 100% implementado
- ✅ El usuario audita y aprueba features en "en_pruebas"

## 🛠️ **Scripts Útiles para Cursor**

### **Script Completo de Integración**
```javascript
// Guardar como: project-tracker-integration.js
const http = require('http');

class ProjectTrackerIntegration {
  constructor(projectId = 17) {
    this.projectId = projectId;
    this.baseUrl = 'http://localhost:3003/api/project-tracker';
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3003,
        path: path,
        method: method,
        headers: { 'Content-Type': 'application/json' }
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData));
          } catch (error) {
            resolve(responseData);
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  // Crear nueva feature
  async createFeature(featureData) {
    const data = {
      projectId: this.projectId,
      status: "pendiente",
      assignedTo: "Sistema",
      isError: false,
      isImprovement: true,
      ...featureData
    };
    
    return await this.makeRequest('/features', 'POST', data);
  }

  // Cambiar estado de feature
  async updateFeatureStatus(featureId, status) {
    return await this.makeRequest(`/features/${featureId}/status`, 'PUT', { status });
  }

  // Agregar comentario al historial
  async addComment(featureId, commentData) {
    return await this.makeRequest(`/features/${featureId}/history`, 'POST', commentData);
  }

  // Obtener features del proyecto
  async getFeatures() {
    return await this.makeRequest(`/features/${this.projectId}`);
  }

  // Obtener detalles del proyecto
  async getProject() {
    return await this.makeRequest(`/projects/${this.projectId}`);
  }
}

// Uso:
const tracker = new ProjectTrackerIntegration(17);

// Ejemplo de uso:
async function ejemploUso() {
  // 1. Crear feature
  const feature = await tracker.createFeature({
    featureName: "Implementar autenticación de usuarios",
    description: "Agregar sistema de login y registro de usuarios",
    priority: "alta",
    problemComment: "Falta sistema de autenticación",
    resultComment: "Implementar JWT y middleware de autenticación"
  });
  
  console.log('Feature creada:', feature);
  
  // 2. Cambiar a desarrollo
  await tracker.updateFeatureStatus(feature.idFeature, "en_desarrollo");
  
  // 3. Agregar comentario
  await tracker.addComment(feature.idFeature, {
    changeReason: "Implementación iniciada",
    newValue: "Creado middleware de autenticación JWT",
    commentType: "Una mejora"
  });
  
  // 4. Marcar como terminado
  await tracker.updateFeatureStatus(feature.idFeature, "en_pruebas");
}

module.exports = ProjectTrackerIntegration;
```

## 🎯 **Casos de Uso Comunes para web**

### **1. Implementar Nueva Funcionalidad**
```javascript
// 1. Crear feature
const feature = await tracker.createFeature({
  featureName: "Agregar validación de formularios",
  description: "Implementar validación client-side y server-side",
  priority: "media",
  problemComment: "Los formularios no tienen validación",
  resultComment: "Implementar validación con Yup y React Hook Form"
});

// 2. Trabajar en la feature
await tracker.updateFeatureStatus(feature.idFeature, "en_desarrollo");

// 3. Documentar progreso
await tracker.addComment(feature.idFeature, {
  changeReason: "Progreso",
  newValue: "Validación client-side implementada",
  commentType: "Una mejora"
});

// 4. Terminar implementación
await tracker.updateFeatureStatus(feature.idFeature, "en_pruebas");
```

### **2. Corregir Bug**
```javascript
// 1. Crear feature de bug
const bug = await tracker.createFeature({
  featureName: "Fix: Error en cálculo de salarios",
  description: "Corregir fórmula de cálculo que está dando resultados incorrectos",
  priority: "alta",
  isError: true,
  problemComment: "La fórmula de cálculo de salarios está incorrecta",
  resultComment: "Corregir fórmula matemática en función calculateSalary"
});

// 2. Trabajar en la corrección
await tracker.updateFeatureStatus(bug.idFeature, "en_desarrollo");

// 3. Documentar la corrección
await tracker.addComment(bug.idFeature, {
  changeReason: "Bug corregido",
  newValue: "Fórmula corregida: salario = horas * tarifa * 1.2",
  commentType: "Funcionó"
});

// 4. Marcar como listo para prueba
await tracker.updateFeatureStatus(bug.idFeature, "en_pruebas");
```

## 🔍 **Verificación y Monitoreo**

### **Verificar Estado del Proyecto**
```javascript
// Ver todas las features del proyecto
const features = await tracker.getFeatures();
console.log('Features activas:', features.features.filter(f => f.status !== 'aprobado'));

// Ver features pendientes
const pendientes = features.features.filter(f => f.status === 'pendiente');
console.log('Features pendientes:', pendientes.length);

// Ver features en desarrollo
const enDesarrollo = features.features.filter(f => f.status === 'en_desarrollo');
console.log('Features en desarrollo:', enDesarrollo.length);
```

### **Dashboard del Proyecto**
- **URL**: http://localhost:3000
- **Navegación**: Proyectos → Noticias por Categorías- Linkedin
- **Funcionalidades**: Ver features, agregar comentarios, cambiar estados

## 🚨 **Troubleshooting**

### **Error: "ECONNREFUSED"**
- Verificar que el servidor Project Tracker esté corriendo en puerto 3003
- Ejecutar: `npm run dev` en la carpeta del Project Tracker

### **Error: "Project not found"**
- Verificar que el proyecto ID 17 existe
- Usar el script de verificación de conexión

### **Error: "Feature not created"**
- Verificar que todos los campos requeridos estén presentes
- Asegurar que el estado inicial sea "pendiente"

## 📚 **Documentación Adicional**

### **Archivos de Referencia:**
- `docs/GUIA_AGENTES_CURSOR.md` - Guía completa para agentes
- `docs/WORKFLOW_DEVELOPMENT.md` - Flujo de trabajo establecido
- `docs/FLUJO_ESTADOS_FEATURES.md` - Estados de features
- `README.md` - Documentación principal del proyecto

### **Endpoints Principales:**
- `GET /api/project-tracker/projects/17` - Detalles del proyecto
- `GET /api/project-tracker/features/17` - Features del proyecto
- `POST /api/project-tracker/features` - Crear feature
- `PUT /api/project-tracker/features/:id/status` - Cambiar estado
- `POST /api/project-tracker/features/:id/history` - Agregar comentario

## 🎉 **Conclusión**

Con esta guía, puedes:

1. ✅ **Conectar** tu sesión de Cursor al Project Tracker
2. ✅ **Documentar** todos los cambios como features
3. ✅ **Seguir** el flujo de estados correcto
4. ✅ **Mantener** trazabilidad completa del desarrollo
5. ✅ **Integrar** con el piloto automático del sistema

**Resultado**: Desarrollo del Noticias por Categorías- Linkedin completamente integrado al sistema de gestión de proyectos, con documentación automática y seguimiento completo.

---

**Para usar en Cursor**: Copia este documento completo y pégaselo al agente de Cursor en la otra sesión. El agente entenderá cómo conectarse al Project Tracker y trabajar con el proyecto Noticias por Categorías- Linkedin.

**Última actualización**: 2 de octubre de 2025  
**Versión**: 1.0  
**Proyecto**: Noticias por Categorías- Linkedin (ID: 17)
