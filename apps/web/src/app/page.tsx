"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  TrendingUp, Sparkles, Calendar, Zap, Globe, ChevronRight,
  Star, CheckCircle2, ArrowRight, Clock, BarChart3,
  Linkedin, Newspaper, Brain, MessageCircle, Quote, Target,
  ArrowLeft, Pause, Play, Shield, Users, Search, RefreshCw,
  Smartphone, Layers, Award, Coffee, Eye, Rocket
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const heroSlides = [
  {
    headline: "Tu conocimiento merece ser visto.\nNosotros ponemos las palabras.",
    sub: "La IA escribe con tu estilo y tu voz. Tú solo elige las noticias que importan. Publica con confianza desde el día uno.",
    img: "https://image.pollinations.ai/prompt/professional_corporate_employee_sitting_at_desk_modern_office_natural_lighting_looking_at_laptop_with_confident_satisfied_smile_glass_desk_ergonomic_chair_clean_professional_atmosphere_cinematic_shot_realistic_photography?width=800&height=600&nofeed=true",
    alt: "Profesional satisfecho frente a su laptop en oficina moderna",
  },
  {
    headline: "10 minutos al mes.\nContenido para todo el mes.",
    sub: "Conecta tus fuentes de noticias, la IA genera los posts, programa las publicaciones. Tu presencia en LinkedIn funciona sola.",
    img: "https://image.pollinations.ai/prompt/confident_executive_presenting_in_meeting_room_modern_office_warm_lighting_colleagues_listening_attentively_leadership_body_language_business_dress_code_glass_walls_cinematic_shot_realistic_photography?width=800&height=600&nofeed=true",
    alt: "Ejecutivo liderando reunión con su equipo",
  },
  {
    headline: "Las noticias de tu industria + IA =\nTú sonando como el experto que eres.",
    sub: "La plataforma encuentra lo más relevante para tu nicho y lo transforma en posts optimizados. Sin pensar qué escribir.",
    img: "https://image.pollinations.ai/prompt/professional_employee_receiving_award_trophy_applause_from_colleagues_modern_office_celebration_happy_proud_expression_team_recognizing_achievement_corporate_success_cinematic_shot_realistic?width=800&height=600&nofeed=true",
    alt: "Profesional recibiendo reconocimiento de su equipo",
  },
  {
    headline: "Mientras tú trabajas,\ntu perfil trabaja por ti.",
    sub: "Programación inteligente, publicación automática, contenido consistente. El algoritmo de LinkedIn premia la frecuencia.",
    img: "https://image.pollinations.ai/prompt/relaxed_professional_drinking_coffee_smiling_at_phone_modern_home_office_blurred_dashboard_with_growth_charts_in_background_career_success_satisfaction_warm_atmosphere_cinematic_shot_realistic?width=800&height=600&nofeed=true",
    alt: "Profesional relajado viendo resultados con café",
  },
]

const benefits = [
  {
    icon: Newspaper,
    title: "De la noticia a tu perfil en 2 clics",
    desc: "Olvídate del bloqueo creativo. Selecciona las noticias que te interesan y la IA genera un post pulido y profesional. Tú solo das el visto bueno.",
    img: "https://image.pollinations.ai/prompt/professional_employee_at_desk_dual_monitor_setup_split_screen_news_articles_and_linkedin_profile_expression_of_relief_and_satisfaction_modern_office_natural_lighting_ergonomic_chair_realistic?width=600&height=400&nofeed=true",
    alt: "Profesional con dos pantallas: noticias y LinkedIn",
  },
  {
    icon: MessageCircle,
    title: "Suena a ti, no a un robot",
    desc: "4 estilos de escritura: crítico, educativo, satírico, ejecutivo. La IA se adapta a tu personalidad. Tu audiencia sentirá que eres tú escribiendo.",
    img: "https://image.pollinations.ai/prompt/two_diverse_professionals_conversing_animatedly_in_modern_office_cafeteria_coffee_cups_warm_atmosphere_positive_body_language_genuine_connection_smiling_colleagues_corporate_realistic?width=600&height=400&nofeed=true",
    alt: "Dos profesionales conversando animadamente",
  },
  {
    icon: Calendar,
    title: "Publica sin publicar",
    desc: "Programa tu calendario una vez y olvídate. El sistema publica automáticamente en los horarios óptimos. Presencia 24/7 sin mover un dedo.",
    img: "https://image.pollinations.ai/prompt/professional_presenting_growth_charts_in_boardroom_colleagues_attending_modern_glass_office_professional_attire_confident_presentation_skills_projected_data_screen_realistic?width=600&height=400&nofeed=true",
    alt: "Profesional presentando en sala de juntas",
  },
  {
    icon: Award,
    title: "Conviértete en la referencia de tu industria",
    desc: "Contenido relevante y consistente atrae headhunters, clientes y oportunidades. Tu próximo ascenso puede empezar con un post.",
    img: "https://image.pollinations.ai/prompt/professional_being_congratulated_by_colleagues_handshake_celebration_modern_office_diverse_team_happy_expressions_career_milestone_recognition_successful_corporate_environment_realistic?width=600&height=400&nofeed=true",
    alt: "Profesional siendo felicitado por colegas",
  },
  {
    icon: Target,
    title: "Solo lo que importa para tu industria",
    desc: "Más de 10 categorías o crea las tuyas. La plataforma busca las noticias más relevantes para que no pierdas tiempo buscando.",
    img: "https://image.pollinations.ai/prompt/focused_professional_reading_tablet_with_coffee_cup_cozy_modern_home_office_natural_lighting_concentrated_expression_relaxed_atmosphere_plant_decoration_realistic?width=600&height=400&nofeed=true",
    alt: "Profesional concentrado leyendo en tablet",
  },
  {
    icon: BarChart3,
    title: "Mira cómo crece tu impacto",
    desc: "Estadísticas claras de alcance, interacciones y crecimiento. Ver los resultados en números es el mejor combustible para seguir.",
    img: "https://image.pollinations.ai/prompt/professional_pointing_at_dashboard_with_upward_charts_and_metrics_colleague_looking_with_interest_team_celebrating_business_results_modern_office_happy_employees_corporate_success_realistic?width=600&height=400&nofeed=true",
    alt: "Equipo celebrando resultados frente a dashboard",
  },
]

const steps = [
  {
    icon: Linkedin,
    title: "Conecta tu LinkedIn",
    desc: "Autenticación segura en segundos. Tu perfil está listo para recibir contenido generado por IA.",
  },
  {
    icon: Search,
    title: "Elige tus temas",
    desc: "Noticias curadas para tu nicho. Más de 10 categorías o crea las tuyas. Solo lo relevante para ti.",
  },
  {
    icon: RefreshCw,
    title: "Revisa y personaliza",
    desc: "La IA escribe, tú decides. Elige entre 4 estilos, ajusta el tono y da el visto bueno final.",
  },
  {
    icon: Rocket,
    title: "Programa y crece",
    desc: "Publicación automática en los mejores horarios. Resultados reales sin esfuerzo diario.",
  },
]

const plans = [
  {
    name: "Gratis",
    price: "$0",
    priceCOP: "$0",
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
    price: "$29 USD",
    priceCOP: "$110.000 COP",
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
    price: "$79 USD",
    priceCOP: "$300.000 COP",
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
  {
    q: "No soy escritor, ¿la IA realmente va a sonar a mí?",
    a: "Totalmente. La IA no escribe en genérico. Analiza el tono que prefieras y genera contenido con tu misma forma de expresarte. Elige entre crítico, educativo, satírico o ejecutivo. Tu audiencia jurará que lo escribiste tú.",
  },
  {
    q: "¿Puedo programar todo un mes en una sola sesión?",
    a: "Sí. Dedica 10 minutos al mes a seleccionar noticias, la IA genera los posts y tú los programas. El sistema publica automáticamente en los horarios óptimos. Tú olvídate y dedícate a tu trabajo.",
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isPaused])

  function goToSlide(index: number) {
    setCurrentSlide(index)
  }

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  return (
    <div className="overflow-hidden">

      {/* HERO CAROUSEL */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/50" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0A66C2/05_1px,transparent_1px),linear-gradient(to_bottom,#0A66C2/05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="mx-auto mb-10 flex max-w-fit items-center gap-2 rounded-full border bg-white/80 px-4 py-1.5 text-sm shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#0A66C2]" />
            <span className="font-medium">Nuevo: Asistente IA con 4 estilos de escritura</span>
          </div>
          <div
            className="relative overflow-hidden rounded-2xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={cn(
                    "grid gap-10 lg:grid-cols-2 lg:items-center transition-all duration-700",
                    index === currentSlide ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none",
                  )}
                >
                  <div className={cn("p-6 md:p-10", index !== currentSlide && "hidden")}>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl whitespace-pre-line">
                      {slide.headline.split("\n").map((line, i) => (
                        <span key={i}>
                          {i === 0 ? line : (
                            <span className="text-[#0A66C2]">{line}</span>
                          )}
                          {i === 0 && <br />}
                        </span>
                      ))}
                    </h1>
                    <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
                      {slide.sub}
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
                  <div className={cn("relative", index !== currentSlide && "hidden")}>
                    <div className="relative overflow-hidden rounded-xl bg-gray-100 shadow-lg">
                      <img
                        src={slide.img}
                        alt={slide.alt}
                        className="h-full w-full object-cover aspect-[4/3] transition-transform duration-700 hover:scale-105"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentSlide
                      ? "w-8 bg-[#0A66C2]"
                      : "w-2 bg-gray-300 hover:bg-gray-400",
                  )}
                  aria-label={`Ir al slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md backdrop-blur transition-all hover:bg-white md:block"
              aria-label="Anterior"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md backdrop-blur transition-all hover:bg-white md:block"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 shadow-md backdrop-blur transition-all hover:bg-white md:right-20 md:top-20"
              aria-label={isPaused ? "Reanudar" : "Pausar"}
            >
              {isPaused ? (
                <Play className="h-4 w-4 text-gray-700" />
              ) : (
                <Pause className="h-4 w-4 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Creado para profesionales como tú
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {[
              "Directores", "Gerentes", "Consultores", "Ejecutivos",
              "Emprendedores", "Marketers", "CEO's", "Team Leaders",
            ].map((l) => (
              <span
                key={l}
                className="rounded-lg border bg-muted/50 px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:border-[#0A66C2]/30 hover:text-[#0A66C2] hover:bg-blue-50/50"
              >
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
            <Badge variant="secondary" className="mb-4">Beneficios</Badge>
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
                className={cn(
                  "group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1",
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
                )}
              >
                <div className="flex-1 p-6 md:p-8">
                  <div className="mb-4 inline-flex rounded-lg bg-[#0A66C2]/10 p-3">
                    <b.icon className="h-6 w-6 text-[#0A66C2]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                </div>
                <div className="relative min-h-[200px] w-full md:w-64 shrink-0 overflow-hidden">
                  <img
                    src={b.img}
                    alt={b.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="bg-gradient-to-b from-white to-blue-50/50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Proceso</Badge>
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
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A66C2] to-blue-600 text-2xl font-bold text-white shadow-lg shadow-[#0A66C2]/20">
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

      {/* FOMO */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600">
              <Zap className="h-4 w-4" />
              La ventaja de actuar ahora
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Tus colegas están publicando. ¿Tú aún no?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Cada día sin contenido nuevo es un día que alguien más ocupa tu lugar en el algoritmo.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                  <Eye className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-semibold text-gray-900">El 78% de los reclutadores revisa LinkedIn antes de contratar</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  ¿Qué ven cuando buscan tu nombre? ¿Un perfil sin actividad o una autoridad en tu campo? Tu próxima oportunidad laboral puede depender de lo que publicas hoy.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="font-semibold text-gray-900">El tiempo no se recupera</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Crear contenido de calidad toma horas. Horas que podrías estar cerrando negocios o con tu familia. La IA hace el trabajo pesado en segundos mientras tú te enfocas en lo que importa.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-gray-900">Tu competencia ya usa IA</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mientras tú piensas qué publicar, ellos ya están programando su contenido del mes. La pregunta no es si usar IA para LinkedIn, sino cuándo vas a empezar.
                </p>
              </CardContent>
            </Card>
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
            <Badge variant="secondary" className="mb-4">Planes</Badge>
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
                className={cn(
                  "relative rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-lg",
                  p.popular && "border-[#0A66C2] ring-2 ring-[#0A66C2]/20 scale-[1.02]",
                )}
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
                {p.priceCOP && p.name !== "Gratis" && (
                  <p className="mt-1 text-xs text-muted-foreground">{p.priceCOP}</p>
                )}
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
                  className={cn(
                    "mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all",
                    p.popular
                      ? "bg-[#0A66C2] text-white shadow-lg shadow-[#0A66C2]/25 hover:bg-[#0055A4]"
                      : "border bg-white text-gray-700 hover:bg-gray-50",
                  )}
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
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border bg-white shadow-sm">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronRight
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                      activeFaq === i && "rotate-90",
                    )}
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
      <section className="relative isolate overflow-hidden bg-gradient-to-r from-[#0A66C2] to-blue-700 py-20 md:py-28">
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff/10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff/10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                Tu historia profesional merece ser contada
              </h2>
              <p className="mt-4 text-lg text-blue-100 md:text-xl">
                No necesitas más horas al día. Necesitas las herramientas correctas.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-[#0A66C2] shadow-lg transition-all hover:bg-blue-50 hover:-translate-y-0.5"
                >
                  Empieza gratis ahora
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative overflow-hidden rounded-xl bg-white/10 shadow-lg backdrop-blur">
                <img
                  src="https://image.pollinations.ai/prompt/happy_professional_team_celebrating_success_modern_office_diverse_colleagues_laughing_toasting_with_coffee_cups_career_achievement_warm_lighting_corporate_culture_cinematic_realistic?width=800&height=600&nofeed=true"
                  alt="Equipo profesional celebrando el éxito"
                  className="h-full w-full object-cover aspect-[4/3] transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
