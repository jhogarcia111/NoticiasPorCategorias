"use client"

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react"

export type Tab = "home" | "news" | "ai" | "calendar" | "config" | "published" | "subscription" | "admin"
export type ConfigSubTab = "linkedin" | "sources"

interface DashboardState {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  configSubTab: ConfigSubTab
  setConfigSubTab: (tab: ConfigSubTab) => void
  selectedNewsIds: number[]
  setSelectedNewsIds: (ids: number[] | ((prev: number[]) => number[])) => void
  cachedNews: any[]
  setCachedNews: Dispatch<SetStateAction<any[]>>
}

const DashboardContext = createContext<DashboardState | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [configSubTab, setConfigSubTab] = useState<ConfigSubTab>("linkedin")
  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([])
  const [cachedNews, setCachedNews] = useState<any[]>([])

  return (
    <DashboardContext.Provider
      value={{
        activeTab, setActiveTab,
        configSubTab, setConfigSubTab,
        selectedNewsIds, setSelectedNewsIds,
        cachedNews, setCachedNews,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")
  return ctx
}
