import nodemailer from "nodemailer"
import { getDb, emailTemplates } from "@noticias/database"
import { eq } from "drizzle-orm"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
})

const APP_NAME = "NoticiasPorCategorías"
const APP_URL = process.env.VITE_APP_URL || "https://noticias-por-categorias-web.vercel.app"
const APP_SLOGAN = "Organiza, categoriza y publica noticias profesionales en LinkedIn"

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return
  }

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
}

export async function sendTemplateEmail(
  templateKey: string,
  to: string,
  variables: Record<string, string>,
) {
  const db = getDb()
  const [template] = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.key, templateKey))
    .limit(1)

  if (!template || !template.isActive) return

  let html = template.htmlContent
  let subject = template.subject

  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value)
    subject = subject.replace(new RegExp(`{{${key}}}`, "g"), value)
  }

  await sendEmail({ to, subject, html })
}

export async function ensureDefaultTemplates() {
  const db = getDb()
  const existing = await db.select().from(emailTemplates).limit(1)
  if (existing.length > 0) return

  const defaults = [
    {
      key: "welcome",
      name: "Bienvenido a la aplicación",
      subject: "¡Bienvenido a {{app_name}}!",
      htmlContent: getWelcomeTemplate(),
      isActive: true,
    },
    {
      key: "reset-password",
      name: "Restablecer contraseña",
      subject: "Restablece tu contraseña - {{app_name}}",
      htmlContent: getResetPasswordTemplate(),
      isActive: true,
    },
    {
      key: "news-published",
      name: "Noticia publicada",
      subject: "Tu noticia ha sido publicada - {{app_name}}",
      htmlContent: getNewsPublishedTemplate(),
      isActive: true,
    },
    {
      key: "suggested-news",
      name: "Noticias sugeridas",
      subject: "Noticias que podrían interesarte - {{app_name}}",
      htmlContent: getSuggestedNewsTemplate(),
      isActive: false,
    },
    {
      key: "weekly-summary",
      name: "Resumen semanal",
      subject: "Tu resumen semanal - {{app_name}}",
      htmlContent: getWeeklySummaryTemplate(),
      isActive: true,
    },
  ]

  for (const tpl of defaults) {
    await db.insert(emailTemplates).values(tpl)
  }
}

const baseStyles = `
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f6f9; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #0A66C2, #0055A4); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
  .header img { max-height: 60px; margin-bottom: 10px; }
  .header h1 { color: #ffffff; margin: 10px 0 0; font-size: 24px; }
  .header p { color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 14px; }
  .body { background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; }
  .body h2 { color: #1a1a2e; font-size: 20px; margin-top: 0; }
  .body p { color: #555; line-height: 1.6; font-size: 15px; }
  .button { display: inline-block; background: #0A66C2; color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 20px 0; }
  .button:hover { background: #0055A4; }
  .benefits { display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0; }
  .benefit-box { flex: 1 1 calc(50% - 12px); background: #f0f7ff; border: 1px solid #d4e4f7; border-radius: 10px; padding: 16px; text-align: center; }
  .benefit-box h4 { margin: 0 0 6px; color: #0A66C2; font-size: 14px; }
  .benefit-box p { margin: 0; font-size: 12px; color: #666; }
  .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  .footer a { color: #0A66C2; text-decoration: none; }
`

function getWelcomeTemplate(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${baseStyles}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>{{app_name}}</h1>
    <p>{{app_slogan}}</p>
  </div>
  <div class="body">
    <h2>¡Bienvenido, {{user_name}}!</h2>
    <p>Nos alegra mucho que te hayas unido a {{app_name}}. Estamos aquí para ayudarte a organizar, categorizar y publicar noticias profesionales en LinkedIn de forma automática con inteligencia artificial.</p>
    <p>Con nuestra plataforma podrás:</p>
    <div class="benefits">
      <div class="benefit-box">
        <h4>📰 Gestión de Noticias</h4>
        <p>Recolecta y organiza noticias de tus fuentes favoritas automáticamente</p>
      </div>
      <div class="benefit-box">
        <h4>🤖 IA Integrada</h4>
        <p>Genera resúmenes y contenido optimizado para LinkedIn con IA</p>
      </div>
      <div class="benefit-box">
        <h4>📅 Programación</h4>
        <p>Planifica tus publicaciones en el momento ideal para tu audiencia</p>
      </div>
      <div class="benefit-box">
        <h4>📈 Mayor Alcance</h4>
        <p>Aumenta tu exposición profesional con contenido consistente</p>
      </div>
    </div>
    <p style="text-align:center">
      <a href="{{app_url}}/dashboard" class="button">Ir al Dashboard</a>
    </p>
    <p>Si tienes alguna pregunta, no dudes en responder a este correo.</p>
    <p>¡Empieza a publicar hoy!</p>
  </div>
  <div class="footer">
    <p>© 2024 {{app_name}}. Todos los derechos reservados.</p>
    <p><a href="{{app_url}}">{{app_url}}</a></p>
  </div>
</div>
</body></html>`
}

function getResetPasswordTemplate(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${baseStyles}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>{{app_name}}</h1>
    <p>{{app_slogan}}</p>
  </div>
  <div class="body">
    <h2>Restablece tu contraseña</h2>
    <p>Hola, {{user_name}}.</p>
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en {{app_name}}. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
    <p style="text-align:center">
      <a href="{{reset_url}}" class="button">Restablecer Contraseña</a>
    </p>
    <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura. El enlace expirará en 1 hora.</p>
    <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
    <p style="font-size:12px; word-break:break-all; color:#888;">{{reset_url}}</p>
  </div>
  <div class="footer">
    <p>© 2024 {{app_name}}. Todos los derechos reservados.</p>
    <p><a href="{{app_url}}">{{app_url}}</a></p>
  </div>
</div>
</body></html>`
}

function getNewsPublishedTemplate(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${baseStyles}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>{{app_name}}</h1>
    <p>{{app_slogan}}</p>
  </div>
  <div class="body">
    <h2>✅ Noticia Publicada</h2>
    <p>Hola, {{user_name}}.</p>
    <p>Tu noticia <strong>"{{news_title}}"</strong> ha sido publicada exitosamente en LinkedIn.</p>
    <div style="background:#f9f9f9; border-radius:10px; padding:16px; margin:16px 0; border-left:4px solid #0A66C2;">
      <p style="margin:0; font-size:13px; color:#888;">Resumen de la publicación:</p>
      <p style="margin:8px 0 0; font-size:14px;">{{news_summary}}</p>
    </div>
    <p>Gracias por usar {{app_name}} para potenciar tu presencia profesional.</p>
    <div class="benefits">
      <div class="benefit-box">
        <h4>📰 + Noticias</h4>
        <p>Sigue publicando para mantener tu perfil activo</p>
      </div>
      <div class="benefit-box">
        <h4>📊 Estadísticas</h4>
        <p>Monitorea el rendimiento de tus publicaciones</p>
      </div>
    </div>
    <p style="text-align:center">
      <a href="{{app_url}}/dashboard" class="button">Ir al Dashboard</a>
    </p>
  </div>
  <div class="footer">
    <p>© 2024 {{app_name}}. Todos los derechos reservados.</p>
    <p><a href="{{app_url}}">{{app_url}}</a></p>
  </div>
</div>
</body></html>`
}

function getSuggestedNewsTemplate(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${baseStyles}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>{{app_name}}</h1>
    <p>{{app_slogan}}</p>
  </div>
  <div class="body">
    <h2>📢 Noticias que podrían interesarte</h2>
    <p>Hola, {{user_name}}.</p>
    <p>Hemos encontrado algunas noticias que creemos podrían ayudarte a aumentar tu exposición dentro de la red profesional:</p>
    <div style="background:#f9f9f9; border-radius:10px; padding:16px; margin:16px 0;">
      <p style="margin:0; font-size:14px; font-weight:600;">📌 {{news_1_title}}</p>
      <p style="margin:6px 0 0; font-size:13px; color:#666;">{{news_1_summary}}</p>
    </div>
    <div style="background:#f9f9f9; border-radius:10px; padding:16px; margin:16px 0;">
      <p style="margin:0; font-size:14px; font-weight:600;">📌 {{news_2_title}}</p>
      <p style="margin:6px 0 0; font-size:13px; color:#666;">{{news_2_summary}}</p>
    </div>
    <div style="background:#f9f9f9; border-radius:10px; padding:16px; margin:16px 0;">
      <p style="margin:0; font-size:14px; font-weight:600;">📌 {{news_3_title}}</p>
      <p style="margin:6px 0 0; font-size:13px; color:#666;">{{news_3_summary}}</p>
    </div>
    <p>Publicar contenido relevante de forma constante es clave para crecer tu red profesional. ¡No dejes pasar estas oportunidades!</p>
    <p style="text-align:center">
      <a href="{{app_url}}/dashboard" class="button">Ver Noticias</a>
    </p>
    <div class="benefits">
      <div class="benefit-box">
        <h4>📈 + Visibilidad</h4>
        <p>Publica regularmente para aumentar tu alcance</p>
      </div>
      <div class="benefit-box">
        <h4>🤖 Automatización</h4>
        <p>Deja que la IA genere el contenido por ti</p>
      </div>
    </div>
  </div>
  <div class="footer">
    <p>© 2024 {{app_name}}. Todos los derechos reservados.</p>
    <p><a href="{{app_url}}">{{app_url}}</a></p>
  </div>
</div>
</body></html>`
}

function getWeeklySummaryTemplate(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${baseStyles}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>{{app_name}}</h1>
    <p>{{app_slogan}}</p>
  </div>
  <div class="body">
    <h2>📊 Tu resumen semanal</h2>
    <p>Hola, {{user_name}}.</p>
    <p>Esto es lo que lograste esta semana en {{app_name}}:</p>
    <div class="benefits">
      <div class="benefit-box">
        <h4>📰 {{weekly_news_count}}</h4>
        <p>Noticias procesadas</p>
      </div>
      <div class="benefit-box">
        <h4>📝 {{weekly_posts_count}}</h4>
        <p>Publicaciones realizadas</p>
      </div>
      <div class="benefit-box">
        <h4>👁️ {{weekly_views}}</h4>
        <p>Vistas estimadas</p>
      </div>
      <div class="benefit-box">
        <h4>👍 {{weekly_engagement}}</h4>
        <p>Interacciones</p>
      </div>
    </div>
    <p>¡Sigue así! La consistencia es la clave para construir una presencia profesional sólida en LinkedIn.</p>
    <p style="text-align:center">
      <a href="{{app_url}}/dashboard" class="button">Ver Detalle</a>
    </p>
  </div>
  <div class="footer">
    <p>© 2024 {{app_name}}. Todos los derechos reservados.</p>
    <p><a href="{{app_url}}">{{app_url}}</a></p>
  </div>
</div>
</body></html>`
}

export { APP_NAME, APP_URL, APP_SLOGAN }
