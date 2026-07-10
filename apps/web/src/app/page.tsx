"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import {
  TrendingUp, Sparkles, Calendar, Zap, Users, Globe, ChevronRight,
  Star, CheckCircle2, ArrowRight, Clock, BarChart3, Shield,
  Linkedin, Newspaper, Brain, Image, ChevronLeft
} from "lucide-react"

const stats = [
  { value: "10K+", label: "Publicaciones realizadas" },
  { value: "98%", label: "Tasa de publicaci\u00f3n exitosa" },
  { value: "500+", label: "Usuarios activos" },
  { value: "4.9", label: "Calificaci\u00f3n promedio" },
]

const benefits = [
  {
    icon: Newspaper,
    title: "Noticias curadas al instante",
    desc: "Recolectamos las noticias m\u00e1s relevantes de tu industria desde m\u00faltiples fuentes y las organizamos por categor\u00edas.",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: Brain,
    title: "IA que escribe por ti",
    desc: "DeepSeek AI genera res\u00famenes, publicaciones optimizadas, hashtags y prompts de imagen en segundos.",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    icon: Linkedin,
    title: "Publicaci\u00f3n directa a LinkedIn",
    desc: "Conecta tus perfiles y publica automaticamente sin salir de la plataforma. Soporte para multiples cuentas.",
    color: "text-[#0A66C2]",
    bg: "bg-[#0A66C2]/10",
  },
  {
    icon: Calendar,
    title: "Calendario inteligente",
    desc: "Programa tus publicaciones con horarios optimizados. El sistema publica por ti en el mejor momento.",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    icon: BarChart3,
    title: "4 estilos de escritura",
    desc: "Elige entre cr\u00edtico, educativo, sat\u00edrico o ejecutivo. La IA se adapta a tu voz y audiencia.",
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    icon: Globe,
    title: "Multi-idioma",
    desc: "Soporte completo para Espa\u00f1ol e Ingl\u00e9s. Ideal para profesionales bilinguales y audiencias globales.",
    color: "text-teal-600",
    bg: "bg-teal-100",
  },
]

const testimonials = [
  {
    name: "Carlos Mendoza",
    role: "Consultor de Innovaci\u00f3n",
    avatar: "CM",
    text: "Antes pasaba 3 horas diarias creando contenido. Ahora lo hace la IA y yo solo reviso. Mi engagement subi\u00f3 4x.",
    rating: 5,
  },
  {
    name: "Ana Luc\u00eda Ram\u00edrez",
    role: "Directora de Marketing",
    avatar: "AL",
    text: "Conectar LinkedIn fue instant\u00e1neo. En mi primera semana ya ten\u00eda 5 publicaciones programadas y listas.",
    rating: 5,
  },
  {
    name: "Roberto Jim\u00e9nez",
    role: "CEO en TechStartup",
    avatar: "RJ",
    text: "La funcionalidad de calendario me salv\u00f3. Programa un mes en 10 minutos y olv\u00eddese. Resultados incre\u00edbles.",
    rating: 5,
  },
  {
    name: "Mar\u00eda Fernanda D\u00edaz",
    role: "Estratega de Marca Personal",
    avatar: "MF",
    text: "Los 4 estilos de escritura son brutales. Uso el ejecutivo para clientes y el sat\u00edrico para mi marca personal.",
    rating: 5,
  },
]

const plans = [
  {
    name: "Freemium",
    price: "$0",
    period: "siempre gratis",
    desc: "Perfecto para probar la plataforma",
    features: [
      "1 perfil de LinkedIn",
      "10 noticias/mes",
      "1 categor\u00eda",
      "Estilo de escritura \u00fanico",
      "Soporte por email",
    ],
    cta: "Comenzar gratis",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mes",
    desc: "Para profesionales que crecen en LinkedIn",
    features: [
      "3 perfiles de LinkedIn",
      "300 noticias/mes",
      "10 categor\u00edas",
      "4 estilos de escritura",
      "Calendario completo",
      "Publicaci\u00f3n autom\u00e1tica",
      "Soporte prioritario",
    ],
    cta: "Empezar prueba gratis",
    popular: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "/mes",
    desc: "Para agencias y equipos",
    features: [
      "10 perfiles de LinkedIn",
      "Noticias ilimitadas",
      "Categor\u00edas ilimitadas",
      "4 estilos de escritura",
      "Calendario completo",
      "Hasta 3 miembros de equipo",
      "API access",
      "Soporte dedicado 24/7",
    ],
    cta: "Contactar ventas",
    popular: false,
  },
]

const metrics = [
  { icon: Clock, value: "10 min", label: "de configuraci\u00f3n inicial" },
  { icon: TrendingUp, value: "3.5x", label: "m\u00e1s engagement en LinkedIn" },
  { icon: Zap, value: "90%", label: "menos tiempo creando contenido" },
  { icon: Users, value: "500+", label: "profesionales conf\u00edan en nosotros" },
]

const logos = [
  "Consultor\u00edas", "Startups", "Agencias", "Freelancers",
  "Directivos", "Creadores", "Acad\u00e9micos", "CEO's",
]

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [isAuto, setIsAuto] = useState(true)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    if (!isAuto) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [isAuto, next])

  const t = testimonials[current]

  return (
    <div
      className="relative mx-auto max-w-2xl"
      onMouseEnter={() => setIsAuto(false)}
      onMouseLeave={() => setIsAuto(true)}
    >
      <div className="rounded-2xl border bg-white p-8 shadow-lg md:p-12">
        <div className="mb-6 flex gap-1">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="mb-6 text-lg leading-relaxed text-gray-700">&ldquo;{t.text}&rdquo;</p>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A66C2] text-sm font-bold text-white">
            {t.avatar}
          </div>
          <div>
            <p className="font-semibold">{t.name}</p>
            <p className="text-sm text-muted-foreground">{t.role}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={prev} className="rounded-full border p-2 transition-colors hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === current ? "bg-[#0A66C2] w-6" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <button onClick={next} className="rounded-full border p-2 transition-colors hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
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
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
              De la noticia a la{" "}
              <span className="bg-gradient-to-r from-[#0A66C2] to-[#1DB954] bg-clip-text text-transparent">
                oportunidad
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Automatiza tu presencia en LinkedIn con IA. Recolecta noticias, genera contenido viral y
              publica autom\u00e1ticamente. Todo desde un solo lugar.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
                Iniciar sesi\u00f3n
              </Link>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border bg-white/80 p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-[#0A66C2] md:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS BANNER */}
      <section className="border-y bg-gradient-to-r from-[#0A66C2]/5 via-white to-[#1DB954]/5 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="text-center">
                <m.icon className="mx-auto mb-2 h-6 w-6 text-[#0A66C2]" />
                <p className="text-xl font-bold text-gray-900 md:text-2xl">{m.value}</p>
                <p className="text-sm text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b bg-white py-8">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Usado por profesionales de todo tipo
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {logos.map((l) => (
              <span key={l} className="rounded-lg border bg-muted/50 px-4 py-2 text-sm font-semibold text-muted-foreground">
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="beneficios" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Todo lo que necesitas para dominar LinkedIn
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Una plataforma completa que automatiza todo tu flujo de contenido.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`mb-4 inline-flex rounded-lg ${b.bg} p-3`}>
                  <b.icon className={`h-6 w-6 ${b.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-b from-white to-blue-50/50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              C\u00f3mo funciona
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              En 4 pasos empiezas a publicar contenido generado por IA en LinkedIn.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              { step: "1", title: "Conecta tu LinkedIn", desc: "Autenticaci\u00f3n OAuth segura con un clic. Nunca compartimos tus credenciales.", icon: Linkedin },
              { step: "2", title: "Elige tus categor\u00edas", desc: "Selecciona los temas que te interesan. La IA busca noticias relevantes para ti.", icon: Newspaper },
              { step: "3", title: "Revisa y personaliza", desc: "La IA genera la publicaci\u00f3n perfecta. T\u00fa solo apruebas o ajustas el tono.", icon: Sparkles },
              { step: "4", title: "Programa y olv\u00eddate", desc: "Define horarios y frecuencia. El sistema publica por ti autom\u00e1ticamente.", icon: Calendar },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A66C2] text-2xl font-bold text-white shadow-lg shadow-[#0A66C2]/20">
                  <s.icon className="h-7 w-7" />
                </div>
                <div className="absolute left-[calc(50%+3rem)] top-8 hidden h-0.5 w-[calc(100%-5rem)] bg-gradient-to-r from-[#0A66C2]/30 to-transparent md:block" />
                <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOMO SOCIAL PROOF CAROUSEL */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0A66C2]/10 px-4 py-1.5 text-sm font-medium text-[#0A66C2]">
              <Users className="h-4 w-4" />
              Lo que dicen nuestros usuarios
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              \u00danete a los profesionales que ya transformaron su presencia en LinkedIn
            </h2>
          </div>
          <div className="mt-12">
            <TestimonialCarousel />
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-muted-foreground">Resultados comprobados</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-muted-foreground">Datos seguros</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-muted-foreground">Soporte en Espa\u00f1ol</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Planes para cada etapa
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Empieza gratis, escala cuando lo necesites. Sin sorpresas.
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
                      M\u00e1s popular
                    </span>
                  </div>
                )}
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
            Todos los planes incluyen 14 d\u00edas de prueba gratuita. Sin tarjeta de cr\u00e9dito.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            {[
              { q: "\u00bfNecesito tener experiencia en LinkedIn?", a: "No. La plataforma est\u00e1 dise\u00f1ada para cualquier profesional, desde principiantes hasta expertos. La IA se encarga del contenido t\u00fa solo conectas tu perfil." },
              { q: "\u00bfPuedo cancelar en cualquier momento?", a: "S\u00ed. No hay contratos anuales ni permanencias. Cancela cuando quieras desde tu panel de control sin penalizaciones." },
              { q: "\u00bfQu\u00e9 tipo de noticias puedo publicar?", a: "Puedes elegir entre m\u00e1s de 10 categor\u00edas (tecnolog\u00eda, negocios, salud, ciencia, entretenimiento, etc.) o crear categor\u00edas personalizadas con tus propias fuentes RSS." },
              { q: "\u00bfLa IA genera im\u00e1genes?", a: "S\u00ed. DeepSeek AI genera prompts optimizados para crear im\u00e1genes llamativas que acompa\u00f1en tus publicaciones en LinkedIn." },
              { q: "\u00bfPuedo tener m\u00faltiples perfiles de LinkedIn?", a: "S\u00ed. Los planes Pro y Business permiten conectar hasta 3 y 10 perfiles respectivamente, ideal para agencias y consultores." },
            ].map((faq, i) => (
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
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Tu pr\u00f3xima gran oportunidad empieza con una noticia
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            \u00danete a cientos de profesionales que ya est\u00e1n publicando contenido consistente en LinkedIn sin esfuerzo.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
      </section>
    </div>
  )
}
