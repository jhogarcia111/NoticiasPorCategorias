"use client"

import { useEffect, useRef } from "react"
import introJs from "intro.js"
import { useDashboard } from "@/app/dashboard/dashboard-context"
import { tourSteps } from "./TourSteps"

interface OnboardingTourProps {
  start: boolean
  onComplete?: () => void
}

export function OnboardingTour({ start, onComplete }: OnboardingTourProps) {
  const { activeTab, setActiveTab } = useDashboard()
  const activeTabRef = useRef(activeTab)
  activeTabRef.current = activeTab

  useEffect(() => {
    if (!start) return

    const intro = introJs()
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

    intro.onBeforeChange((_, currentStep) => {
      const step = tourSteps[currentStep]
      if (step?.tab && step.tab !== activeTabRef.current) {
        setActiveTab(step.tab)
        window.setTimeout(() => intro.refresh(true), 500)
      }
      return true
    })

    intro.onComplete(() => onComplete?.())
    intro.onExit(() => onComplete?.())

    intro.start()
    return () => {
      intro.exit(true)
    }
  }, [start, setActiveTab, onComplete])

  return null
}