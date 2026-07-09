"use client"

import type { Session } from "next-auth"
import { useState } from "react"
import { UserDropdown } from "@/components/user-dropdown"
import { NewsManager } from "@/components/news/news-manager"
import { AIManager } from "@/components/ai/ai-manager"
import { LinkedInProfilesManager } from "@/components/linkedin/linkedin-profiles-manager"
import { SourcesManager } from "@/components/sources/sources-manager"
import { EditProfileDialog } from "@/components/edit-profile-dialog"

interface DashboardClientProps {
  user: Session["user"]
}

type Tab = "news" | "ai" | "config"

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("news")
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [configSubTab, setConfigSubTab] = useState<"linkedin" | "sources">("linkedin")

  // Lifted state for selected news (shared between NewsManager and AIManager)
  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([])
  const [cachedNews, setCachedNews] = useState<any[]>([])

  const tabs: { id: Tab; label: string }[] = [
    { id: "news", label: "Noticias" },
    { id: "ai", label: "Procesar con IA" },
    { id: "config", label: "Configuración" },
  ]

  const configTabs = [
    { id: "linkedin" as const, label: "Perfiles LinkedIn" },
    { id: "sources" as const, label: "Fuentes de Noticias" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-8">
          <h1 className="text-xl font-semibold">Panel de Control</h1>
          <div className="flex items-center gap-4">
            <UserDropdown
              userName={user.name}
              userEmail={user.email}
              onEditProfile={() => setShowEditProfile(true)}
            />
          </div>
        </div>
      </header>

      <div className="border-b">
        <div className="flex gap-0 px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="p-8">
        {activeTab === "news" && (
          <NewsManager
            selectedNewsIds={selectedNewsIds}
            onSelectionChange={setSelectedNewsIds}
            onNewsDataChange={setCachedNews}
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
      </main>

      <EditProfileDialog isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
    </div>
  )
}
