"use client"

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react"

export type Tab = "home" | "news" | "ai" | "calendar" | "config" | "published" | "subscription" | "admin"
export type ConfigSubTab = "linkedin" | "sources"
export type ContentTypeId = "linkedin-post" | "blog" | "video" | "social"
export type SourceMode = "news" | "scientific" | "patents" | "url"

interface DashboardState {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  configSubTab: ConfigSubTab
  setConfigSubTab: (tab: ConfigSubTab) => void
  selectedNewsIds: number[]
  setSelectedNewsIds: (ids: number[] | ((prev: number[]) => number[])) => void
  cachedNews: any[]
  setCachedNews: Dispatch<SetStateAction<any[]>>
  aiSidebarOpen: boolean
  setAiSidebarOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  intendedContentType: ContentTypeId | null
  setIntendedContentType: (v: ContentTypeId | null) => void
  intendedSourceMode: SourceMode | null
  setIntendedSourceMode: (v: SourceMode | null) => void
}

const DashboardContext = createContext<DashboardState | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [configSubTab, setConfigSubTab] = useState<ConfigSubTab>("linkedin")
  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([])
  const [cachedNews, setCachedNews] = useState<any[]>([])
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true)
  const [intendedContentType, setIntendedContentType] = useState<ContentTypeId | null>(null)
  const [intendedSourceMode, setIntendedSourceMode] = useState<SourceMode | null>(null)

  return (
    <DashboardContext.Provider
      value={{
        activeTab, setActiveTab,
        configSubTab, setConfigSubTab,
        selectedNewsIds, setSelectedNewsIds,
        cachedNews, setCachedNews,
        aiSidebarOpen, setAiSidebarOpen,
        intendedContentType, setIntendedContentType,
        intendedSourceMode, setIntendedSourceMode,
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
