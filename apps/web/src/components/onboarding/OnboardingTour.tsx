"use client"

import { useEffect, useRef } from "react"
import { useDashboard } from "@/app/dashboard/dashboard-context"
import { tourSteps } from "./TourSteps"

interface OnboardingTourProps {
  start: boolean
  onComplete?: () => void
}

const MAX_MOUNT_RETRIES = 90

function isVisible(el: Element | null): boolean {
  if (!el) return false
  if (el instanceof HTMLElement && el.offsetParent !== null) return true
  const rect = el.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

export function OnboardingTour({ start, onComplete }: OnboardingTourProps) {
  const { activeTab, setActiveTab } = useDashboard()
  const activeTabRef = useRef(activeTab)
  activeTabRef.current = activeTab

  useEffect(() => {
    if (!start) return

    let disposed = false
    let intro: any = null
    let switching = false

    const load = async () => {
      if (disposed) return
      const { default: introJs } = await import("intro.js")
      if (disposed) return

      intro = introJs()
      intro.setOptions({
        steps: tourSteps.map((s) => ({
          title: s.title,
          intro: s.intro,
          element: s.element || null,
          position: s.position || "floating",
        })),
        showProgress: true,
        showStepNumbers: false,
        exitOnOverlayClick: false,
        disableInteraction: true,
        overlayOpacity: 0.45,
        nextLabel: "Siguiente",
        prevLabel: "Anterior",
        skipLabel: "Salir",
        doneLabel: "¡Empezar!",
        tooltipClass: "np-intro-tooltip",
        highlightClass: "np-intro-highlight",
      })

      // Al pasar a un paso de otra tab: bloquea el avance, hace clic real en el
      // menú para abrir la sección, espera a que el elemento diana esté visible
      // y recién entonces reanuda para mostrar la leyenda sobre el escenario ya abierto.
      intro.onBeforeChange((_target: any, _currentStep: number, nextStepIndex: number) => {
        const nextStep = tourSteps[nextStepIndex]
        if (!nextStep?.tab || nextStep.tab === activeTabRef.current || switching) return true

        switching = true
        const navBtn = document.querySelector(`#nav-${nextStep.tab}`) as HTMLElement | null
        if (navBtn) {
          navBtn.click()
        } else {
          setActiveTab(nextStep.tab)
        }

        const resolveAfterMount = (retries = 0) => {
          if (disposed) return
          const el = nextStep.element ? document.querySelector(nextStep.element) : document.body
          if (!isVisible(el)) {
            if (retries >= MAX_MOUNT_RETRIES) {
              switching = false
              return
            }
            requestAnimationFrame(() => resolveAfterMount(retries + 1))
            return
          }
          // Doble rAF: deja que imágenes/layout terminen de posicionar el target
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              if (disposed) return
              switching = false
              setTimeout(() => {
                if (disposed) return
                intro?.next()
              }, 200)
            }),
          )
        }

        resolveAfterMount()
        return false
      })

      intro.onComplete(() => onComplete?.())
      intro.onExit(() => onComplete?.())

      intro.start()
    }

    load()

    return () => {
      disposed = true
      intro?.exit(true)
    }
  }, [start, setActiveTab, onComplete])

  return null
}