# Configuración de LinkedIn API

## 1. Crear una aplicación en LinkedIn Developer Portal

1. Ve a [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Inicia sesión con tu cuenta de LinkedIn
3. Haz clic en "Create App"
4. Completa la información:
   - **App name**: `Publicador de Noticias`
   - **LinkedIn Page**: Selecciona una página de LinkedIn (opcional)
   - **Privacy policy URL**: `https://excelparaejecutivos.net/privacy`
   - **App logo**: Sube un logo (opcional)

## 2. Configurar OAuth 2.0

1. En tu aplicación, ve a la pestaña "Auth"
2. En "OAuth 2.0 settings", agrega estas URLs de redirección:
   - **Desarrollo**: `http://localhost:3000/auth/linkedin/callback`
   - **Producción**: `https://publicadordenoticias.excelparaejecutivos.net/auth/linkedin/callback`

## 3. Solicitar permisos

1. En la pestaña "Products", solicita estos productos:
   - **Sign In with LinkedIn using OpenID Connect**
   - **Share on LinkedIn** (para publicar contenido)

## 4. Obtener credenciales

1. En la pestaña "Auth", copia:
   - **Client ID**
   - **Client Secret**

## 5. Configurar variables de entorno

Actualiza tu archivo `.env` con las credenciales:

```env
VITE_LINKEDIN_CLIENT_ID=78n6h2jz1loe3d
VITE_LINKEDIN_CLIENT_SECRET=WPL_AP1.siFOMwSxf35GQScy.shP4dQ==
VITE_LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

## 6. Configurar Supabase

1. Ve a tu proyecto de Supabase
2. Ejecuta el script SQL `setup-linkedin-scheduling.sql` en el SQL Editor
3. Esto creará las tablas necesarias para LinkedIn y programación

## 7. Probar la integración

1. Inicia la aplicación: `npm run dev`
2. Ve a la pestaña "LinkedIn" en el dashboard
3. Haz clic en "Conectar Perfil"
4. Autoriza la aplicación en LinkedIn
5. Verifica que el perfil se conecte correctamente

## 8. Configurar programación

1. Ve a la pestaña "Programación"
2. Selecciona un perfil de LinkedIn
3. Configura los horarios de publicación
4. Guarda la configuración

## 9. Programar noticias

1. Ve a la sección "Programar Noticias"
2. Selecciona noticias no procesadas
3. Haz clic en "Programar Noticias"
4. Las noticias se programarán automáticamente según tu configuración

## Permisos necesarios

La aplicación solicitará estos permisos:
- `r_liteprofile`: Para obtener información básica del perfil
- `r_emailaddress`: Para obtener el email del usuario
- `w_member_social`: Para publicar contenido en LinkedIn

## Limitaciones de LinkedIn API

- **Rate limits**: LinkedIn tiene límites de API que varían según el plan
- **Content policies**: El contenido debe cumplir con las políticas de LinkedIn
- **Token expiration**: Los tokens de acceso expiran y necesitan renovación

## Solución de problemas

### Error: "Invalid redirect URI"
- Verifica que la URL de redirección en LinkedIn coincida exactamente con la configurada
- Asegúrate de que no haya espacios o caracteres extra

### Error: "Insufficient permissions"
- Verifica que hayas solicitado los productos correctos en LinkedIn Developer Portal
- Asegúrate de que la aplicación esté aprobada para los permisos solicitados

### Error: "Token expired"
- Los tokens de LinkedIn expiran periódicamente
- La aplicación manejará automáticamente la renovación cuando sea posible

## Producción

Para producción, actualiza:
1. Las URLs de redirección en LinkedIn Developer Portal
2. Las variables de entorno en tu servidor
3. La configuración de Supabase para el dominio de producción
