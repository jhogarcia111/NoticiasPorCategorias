"use client"

import Link from "next/link"
import { useState } from "react"
import {
  TrendingUp, Sparkles, Calendar, Zap, Globe, ChevronRight,
  Star, CheckCircle2, ArrowRight, Clock, BarChart3,
  Linkedin, Newspaper, Brain, MessageCircle, Quote, Target
} from "lucide-react"
import { Logo } from "@/components/logo"

const benefits = [
  {
    icon: Newspaper,
    title: "Importa noticias de tu nicho",
    desc: "Conecta tus fuentes favoritas o elige entre 10+ categorías. La plataforma recolecta las noticias más relevantes para tu industria automáticamente.",
    color: "text-blue-600",
    bg: "bg-blue-100",
    img: "https://image.pollinations.ai/prompt/clean_professional_dashboard_dark_mode_news_feed_technology_headlines_modern_UI_flat_design_no_people?width=600&height=400&nofeed=true",
  },
  {
    icon: MessageCircle,
    title: "Publica con tu misma forma de hablar",
    desc: "La IA aprende tu tono y estilo. No sonarás a robot. Elige entre 4 estilos: crítico, educativo, satírico o ejecutivo. Tu voz, aumentada.",
    color: "text-purple-600",
    bg: "bg-purple-100",
    img: "https://image.pollinations.ai/prompt/clean_minimalist_writing_interface_laptop_screen_showing_text_editor_AI_assistant_sidebar_no_people_flat_design?width=600&height=400&nofeed=true",
  },
  {
    icon: Linkedin,
    title: "Comparte contenido de calidad",
    desc: "No más publicar por publicar. Cada noticia se transforma en un post optimizado para LinkedIn con resumen, hashtags e imagen generada por IA.",
    color: "text-[#0A66C2]",
    bg: "bg-[#0A66C2]/10",
    img: "https://image.pollinations.ai/prompt/linkedin_profile_page_clean_modern_dark_blue_theme_news_article_card_UI_no_people_flat_design?width=600&height=400&nofeed=true",
  },
  {
    icon: Calendar,
    title: "Programa y olvídate",
    desc: "Define tu calendario de publicaciones una vez. El sistema se encarga de mantener tu presencia activa mientras tú trabajas en lo importante.",
    color: "text-green-600",
    bg: "bg-green-100",
    img: "https://image.pollinations.ai/prompt/calendar_interface_mockup_clean_grid_weekly_schedule_appointment_blocks_no_people_flat_minimalist_design?width=600&height=400&nofeed=true",
  },
  {
    icon: Target,
    title: "Posiciónate como experto",
    desc: "Publica contenido fresco y relevante de forma consistente. Tu audiencia te reconocerá como una autoridad en tu campo.",
    color: "text-orange-600",
    bg: "bg-orange-100",
    img: "https://image.pollinations.ai/prompt/professional_growth_chart_upward_trend_dashboard_analytics_metrics_no_people_minimalist_flat_design?width=600&height=400&nofeed=true",
  },
  {
    icon: Globe,
    title: "Alcance multilingüe",
    desc: "Crea contenido en español e inglés. Ideal para llegar a audiencias globales sin perder la autenticidad de tu mensaje.",
    color: "text-teal-600",
    bg: "bg-teal-100",
    img: "https://image.pollinations.ai/prompt/world_map_connected_dots_global_network_clean_minimalist_flat_design_no_people_blue_teal_palette?width=600&height=400&nofeed=true",
  },
]

const steps = [
  {
    icon: Newspaper,
    title: "Importa noticias",
    desc: "Conecta tus fuentes o elige categorías. La plataforma busca lo más relevante para tu nicho.",
  },
  {
    icon: Brain,
    title: "La IA escribe contigo",
    desc: "Selecciona tu estilo y la IA genera un post con tu voz. Tú apruebas, ajustas o regeneras.",
  },
  {
    icon: Linkedin,
    title: "Publica en LinkedIn",
    desc: "Un clic y el post está en tu perfil. O programa varios para que se publiquen automáticamente.",
  },
  {
    icon: MessageCircle,
    title: "Interactúa y crece",
    desc: "Contenido consistente y de calidad atrae a las personas correctas. Las oportunidades llegan solas.",
  },
]

const plans = [
  {
    name: "Gratis",
    price: "$0",
    period: "siempre",
    desc: "Para probar el poder de la plataforma",
    features: [
      "1 publicación por mes",
      "Texto limitado a 200 caracteres",
      "1 perfil de LinkedIn",
      "1 categoría de noticias",
      "Publicación manual (sin calendario)",
    ],
    cta: "Comenzar gratis",
    popular: false,
    highlight: "Ideal para conocer la plataforma",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mes",
    desc: "Para profesionales que crecen en LinkedIn",
    features: [
      "Publicaciones ilimitadas",
      "Texto completo sin límites",
      "3 perfiles de LinkedIn",
      "10 categorías de noticias",
      "Calendario inteligente",
      "Programación automática",
      "4 estilos de escritura",
      "Soporte prioritario",
    ],
    cta: "Empezar prueba gratis",
    popular: true,
    highlight: "La opción más elegida",
  },
  {
    name: "Business",
    price: "$79",
    period: "/mes",
    desc: "Para agencias y equipos",
    features: [
      "Todo lo de Pro",
      "Perfiles ilimitados de LinkedIn",
      "Categorías ilimitadas",
      "Hasta 3 miembros de equipo",
      "API access",
      "Soporte dedicado 24/7",
    ],
    cta: "Contactar ventas",
    popular: false,
    highlight: "Para escalar",
  },
]

const faqs = [
  {
    q: "¿Necesito experiencia en LinkedIn para usar la plataforma?",
    a: "No. La plataforma está diseñada para cualquier profesional. Conectas tu perfil, eliges tus temas y la IA se encarga del contenido. Tú solo revisas y publicas.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí. No hay contratos anuales ni permanencias. Cancela cuando quieras desde tu panel de control. Sin multas ni penalizaciones.",
  },
  {
    q: "¿Qué tipo de noticias puedo importar?",
    a: "Puedes elegir entre más de 10 categorías predefinidas como tecnología, negocios, salud, ciencia y entretenimiento. También puedes agregar tus propias fuentes RSS.",
  },
  {
    q: "¿Cómo funciona el límite del plan Gratis?",
    a: "En el plan Gratis puedes publicar 1 post por mes con un máximo de 200 caracteres. Es suficiente para probar la calidad del contenido generado por IA y decidir si el plan Pro es para ti.",
  },
  {
    q: "¿La IA realmente escribe con mi estilo?",
    a: "Sí. Puedes elegir entre 4 estilos de escritura: crítico, educativo, satírico y ejecutivo. Cada uno ajusta el tono, la estructura y el lenguaje para que suene a ti, no a un bot.",
  },
]

function ImageCard({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gray-100 shadow-sm ${className}`}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        loading="lazy"
      />
    </div>
  )
}

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  return (
    <div className="overflow-hidden">

      {/* HERO */}
      <section className="relative isolate px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/80 via-white to-white" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0A66C2/05_1px,transparent_1px),linear-gradient(to_bottom,#0A66C2/05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-8 flex max-w-fit items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-sm shadow-sm">
            <Sparkles className="h-4 w-4 text-[#0A66C2]" />
            <span className="font-medium">Nuevo: Asistente IA con 4 estilos de escritura</span>
          </div>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                Importa noticias.{" "}
                <span className="text-[#0A66C2]">Publica.</span>{" "}
                <span className="bg-gradient-to-r from-[#0A66C2] to-[#1DB954] bg-clip-text text-transparent">
                  Posiciónate.
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
                Comparte contenido de calidad, reciente y potente para tu nicho. La IA escribe con tu
                misma forma de hablar. Tú solo elige las noticias que importan.
              </p>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-lg bg-[#0A66C2] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#0A66C2]/25 transition-all hover:bg-[#0055A4] hover:shadow-xl hover:shadow-[#0A66C2]/30 hover:-translate-y-0.5"
                >
                  Comenzar gratis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:-translate-y-0.5"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
            <ImageCard
              src="https://image.pollinations.ai/prompt/clean_professional_dashboard_mockup_laptop_analytics_charts_news_feed_social_media_publishing_modern_UI_no_people_flat_illustration?width=800&height=600&nofeed=true"
              alt="Dashboard profesional de noticias e IA"
              className="h-80 md:h-96 lg:h-[28rem]"
            />
          </div>
        </div>
      </section>

      {/* TRUST BAR - Tipos de profesionales */}
      <section className="border-y bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Creado para profesionales como tú
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {[
              "Consultores", "Emprendedores", "Ejecutivos", "Freelancers",
              "Marketers", "Ingenieros", "Creadores", "CEO's",
            ].map((l) => (
              <span
                key={l}
                className="rounded-lg border bg-muted/50 px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS - con imágenes */}
      <section id="beneficios" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Todo lo que necesitas para destacar en LinkedIn
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              De la noticia a tu perfil. Sin esfuerzo manual.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className={`group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 sm:flex-row ${
                  i % 2 === 0 ? "" : "sm:flex-row-reverse"
                }`}
              >
                <div className="flex-1 p-6 md:p-8">
                  <div className={`mb-4 inline-flex rounded-lg ${b.bg} p-3`}>
                    <b.icon className={`h-6 w-6 ${b.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                </div>
                <div className="relative min-h-[200px] w-full sm:w-56 md:w-64 shrink-0 overflow-hidden">
                  <img
                    src={b.img}
                    alt={b.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS - Cómo funciona */}
      <section id="como-funciona" className="bg-gradient-to-b from-white to-blue-50/50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Así de fácil funciona
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              En 4 pasos transformas noticias en presencia de autoridad.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A66C2] text-2xl font-bold text-white shadow-lg shadow-[#0A66C2]/20">
                  <s.icon className="h-7 w-7" />
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+3rem)] top-8 hidden h-0.5 w-[calc(100%-5rem)] bg-gradient-to-r from-[#0A66C2]/30 to-transparent md:block" />
                )}
                <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0A66C2]/10 text-xs font-bold text-[#0A66C2]">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOMO SECTION - Sin testimonios falsos */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600">
              <Zap className="h-4 w-4" />
              La ventaja de actuar ahora
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Cada día que esperas, alguien más ocupa tu lugar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              En LinkedIn el algoritmo favorece la consistencia. Quien publica contenido relevante
              de forma regular, crece. Quien espera el momento perfecto, se queda atrás.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <TrendingUp className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-900">El algoritmo premia la frecuencia</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Publicar 1 vez al día durante un mes genera más alcance que 30 publicaciones en un día.
                La consistencia es la clave.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="font-semibold text-gray-900">El tiempo no se recupera</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Crear contenido de calidad toma horas. Horas que podrías estar cerrando negocios.
                La IA hace el trabajo pesado en segundos.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Quote className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900">Tu competencia ya usa IA</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Mientras tú piensas qué publicar, ellos ya están programando su contenido del mes.
                La pregunta no es si usar IA, sino cuándo empezar.
              </p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0A66C2] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#0A66C2]/25 transition-all hover:bg-[#0055A4] hover:-translate-y-0.5"
            >
              Empieza hoy, no mañana
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Elige el plan que te lleve al siguiente nivel
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Empieza gratis. Cuando sientas el poder de la IA, querrás más.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-lg ${
                  p.popular ? "border-[#0A66C2] ring-2 ring-[#0A66C2]/20 scale-[1.02]" : ""
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#0A66C2] px-4 py-1 text-xs font-semibold text-white">
                      <Star className="h-3 w-3 fill-white" />
                      Más popular
                    </span>
                  </div>
                )}
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#0A66C2]">
                  {p.highlight}
                </p>
                <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.name === "Business" ? "/contact" : "/register"}
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                    p.popular
                      ? "bg-[#0A66C2] text-white shadow-lg shadow-[#0A66C2]/25 hover:bg-[#0055A4]"
                      : "border bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p.cta}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Todos los planes incluyen 14 días de prueba gratuita. Sin tarjeta de crédito.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border bg-white">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronRight
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                      activeFaq === i ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {activeFaq === i && (
                  <div className="border-t px-6 py-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-[#0A66C2] to-blue-700 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Tu próxima oportunidad empieza con una noticia
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                No necesitas ser escritor, ni tener horas libres. Solo necesitas las noticias
                correctas y la IA que las convierte en tu voz.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-[#0A66C2] shadow-lg transition-all hover:bg-blue-50 hover:-translate-y-0.5"
                >
                  Empieza gratis ahora
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
            <ImageCard
              src="https://image.pollinations.ai/prompt/stylized_abstract_growth_ladder_stars_rocket_upward_professional_success_career_advancement_minimalist_flat_illustration_no_people?width=800&height=600&nofeed=true"
              alt="Crecimiento profesional con LinkedIn"
              className="h-72 md:h-80"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
