"use client"

import type { Session } from "next-auth"
import { useState } from "react"
import { NewsManager } from "@/components/news/news-manager"
import { AIManager } from "@/components/ai/ai-manager"
import { LinkedInProfilesManager } from "@/components/linkedin/linkedin-profiles-manager"
import { SourcesManager } from "@/components/sources/sources-manager"
import { CalendarView } from "@/components/scheduling/calendar-view"

interface DashboardClientProps {
  user: Session["user"]
}

type Tab = "news" | "ai" | "config" | "calendar"

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("news")
  const [configSubTab, setConfigSubTab] = useState<"linkedin" | "sources">("linkedin")

  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([])
  const [cachedNews, setCachedNews] = useState<any[]>([])

  const tabs: { id: Tab; label: string }[] = [
    { id: "news", label: "📰 Noticias" },
    { id: "ai", label: "🤖 Procesar con IA" },
    { id: "calendar", label: "📅 Calendario" },
    { id: "config", label: "⚙️ Configuración" },
  ]

  const configTabs = [
    { id: "linkedin" as const, label: "👤 Perfiles LinkedIn" },
    { id: "sources" as const, label: "📡 Fuentes de Noticias" },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Sub navigation tabs */}
      <div className="border-b bg-white sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-4 md:px-8">
        {activeTab === "news" && (
          <NewsManager
            selectedNewsIds={selectedNewsIds}
            onSelectionChange={setSelectedNewsIds}
            onNewsDataChange={setCachedNews}
            onNavigate={(tab) => setActiveTab(tab as Tab)}
          />
        )}

        {activeTab === "ai" && (
          <AIManager selectedNewsIds={selectedNewsIds} news={cachedNews} />
        )}

        {activeTab === "config" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LinkedInProfilesManager />
            <SourcesManager />
          </div>
        )}

        {activeTab === "calendar" && <CalendarView />}
      </main>

    </div>
  )
}
