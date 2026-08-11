"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useProfile, useUpdateProfile } from "@/hooks/use-profile"
import { SplashScreen } from "./SplashScreen"
import { OnboardingTour } from "./OnboardingTour"

export function OnboardingGate() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const { data: profile } = useProfile(userId)
  const updateProfile = useUpdateProfile()

  const [showSplash, setShowSplash] = useState(false)
  const [startTour, setStartTour] = useState(false)
  const [checked, setChecked] = useState(false)
  const splashShownRef = useRef(false)

  useEffect(() => {
    if (!userId || checked) return
    if (typeof window === "undefined") return
    const localSeen = window.localStorage.getItem("np_welcome_seen")
    if (localSeen === "1") {
      setChecked(true)
      return
    }
    if (profile) {
      if (!profile.onboardingDone) setShowSplash(true)
      setChecked(true)
    }
  }, [userId, profile, checked])

  const markDone = useCallback(async () => {
    splashShownRef.current = true
    try {
      window.localStorage.setItem("np_welcome_seen", "1")
      if (userId) {
        await updateProfile.mutateAsync({
          userId,
          onboardingDone: true,
          welcomeSeenAt: new Date().toISOString(),
        })
      }
    } catch {
      // offline safe: localStorage ya marcó visto
    }
  }, [userId, updateProfile])

  const handleFinish = useCallback(
    async (withTour: boolean) => {
      await markDone()
      setShowSplash(false)
      if (withTour) setStartTour(true)
    },
    [markDone],
  )

  useEffect(() => {
    const listener = () => setStartTour(true)
    window.addEventListener("np:start-tour", listener)
    return () => window.removeEventListener("np:start-tour", listener)
  }, [])

  if (showSplash) {
    return <SplashScreen onFinish={handleFinish} />
  }

  return <OnboardingTour start={startTour} onComplete={() => setStartTour(false)} />
}