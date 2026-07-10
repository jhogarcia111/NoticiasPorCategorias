"use client"

import type { Session } from "next-auth"
import { useState } from "react"
import { UserDropdown } from "@/components/user-dropdown"
import { NewsManager } from "@/components/news/news-manager"
import { AIManager } from "@/components/ai/ai-manager"
import { LinkedInProfilesManager } from "@/components/linkedin/linkedin-profiles-manager"
import { SourcesManager } from "@/components/sources/sources-manager"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { CalendarView } from "@/components/scheduling/calendar-view"

interface DashboardClientProps {
  user: Session["user"]
}

type Tab = "news" | "ai" | "config" | "calendar"

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("news")
  const [showEditProfile, setShowEditProfile] = useState(false)
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
      {/* Compact header with title + user dropdown + tabs */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold">📰 NoticiasPorCategorias</h1>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">v1.1.0</span>
            </div>
            <div className="flex items-center">
              <UserDropdown
                userName={user.name}
                userEmail={user.email}
                onEditProfile={() => setShowEditProfile(true)}
              />
            </div>
          </div>
          <div className="flex gap-0 -mx-1">
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
          <div className="space-y-6">
            <div className="border-b">
              <div className="flex gap-0">
                {configTabs.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setConfigSubTab(st.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      configSubTab === st.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
            {configSubTab === "linkedin" && <LinkedInProfilesManager />}
            {configSubTab === "sources" && <SourcesManager />}
          </div>
        )}

        {activeTab === "calendar" && <CalendarView />}
      </main>

      <EditProfileDialog isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
    </div>
  )
}
