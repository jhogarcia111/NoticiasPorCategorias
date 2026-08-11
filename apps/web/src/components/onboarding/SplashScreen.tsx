"use client"

import { useEffect, useCallback, useState } from "react"
import { ChevronLeft, ChevronRight, X, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { splashSteps } from "./splash-steps"

interface SplashScreenProps {
  onFinish: (startTour: boolean) => void
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState<Record<string, boolean>>({})

  const step = splashSteps[current]
  const isLast = current === splashSteps.length - 1
  const Icon = step.icon

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCurrent((c) => Math.min(c + 1, splashSteps.length - 1))
      if (e.key === "ArrowLeft") setCurrent((c) => Math.max(c - 1, 0))
      if (e.key === "Escape") onFinish(false)
    },
    [onFinish],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-gradient-to-br from-[#0A66C2] via-[#084a9c] to-[#062b5c] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
      />
      <div className="relative mx-auto flex min-h-full max-w-6xl flex-col justify-center px-4 py-8 md:px-8">
        <div className="absolute right-4 top-4 flex items-center gap-4">
          <button
            onClick={() => onFinish(false)}
            className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
          >
            Omitir
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div className="order-2 lg:order-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-blue-200">{step.eyebrow}</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              {step.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-blue-100/90 md:text-xl">{step.description}</p>

            <ul className="mt-6 space-y-2.5">
              {step.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-blue-50/90">
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-amber-300" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {isLast ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => onFinish(true)}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-[#0A66C2] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Comenzar tour
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => onFinish(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  Empezar a usar
                </button>
              </div>
            ) : (
              <div className="mt-8 flex items-center gap-2">
                <button
                  onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
                  disabled={current === 0}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrent((c) => Math.min(c + 1, splashSteps.length - 1))}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0A66C2] shadow transition-all hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#0d2e5c]">
                {splashSteps.map((s) => (
                  <img
                    key={s.id}
                    src={s.image}
                    alt={s.alt}
                    loading="lazy"
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                      current === splashSteps.indexOf(s) ? "opacity-100" : "opacity-0",
                    )}
                    onLoad={() => setLoaded((l) => ({ ...l, [s.id]: true }))}
                    onError={(e) => {
                      const target = e.currentTarget
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = "1"
                        target.src =
                          "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80"
                      }
                    }}
                  />
                ))}
                {!loaded[step.id] && (
                  <div className="absolute inset-0 flex items-center justify-center text-blue-200/70">Cargando…</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {splashSteps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              aria-label={`Ir al paso ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}