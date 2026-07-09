"use client"

import { signOut } from "next-auth/react"
import type { Session } from "next-auth"
import { useState } from "react"
import { NewsManager } from "@/components/news/news-manager"
import { LinkedInProfilesManager } from "@/components/linkedin/linkedin-profiles-manager"
import { SchedulingConfig } from "@/components/scheduling/scheduling-config"
import { ScheduledPostsManager } from "@/components/scheduling/scheduled-posts-manager"
import { AutoScheduleNews } from "@/components/scheduling/auto-schedule-news"
import { AIManager } from "@/components/ai/ai-manager"

interface DashboardClientProps {
  user: Session["user"]
}

type Tab = "news" | "linkedin" | "scheduling" | "ai"

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("news")
  const [schedulingSubTab, setSchedulingSubTab] = useState<"config" | "posts" | "auto">("config")

  const tabs: { id: Tab; label: string }[] = [
    { id: "news", label: "Noticias" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "scheduling", label: "Programación" },
    { id: "ai", label: "IA" },
  ]

  const schedulingTabs = [
    { id: "config" as const, label: "Configuración" },
    { id: "posts" as const, label: "Posts Programados" },
    { id: "auto" as const, label: "Auto Programar" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-8">
          <h1 className="text-xl font-semibold">Panel de Control</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <button
              onClick={() => signOut()}
              className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive hover:bg-destructive/20"
            >
              Cerrar Sesión
            </button>
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
        {activeTab === "news" && <NewsManager />}

        {activeTab === "linkedin" && <LinkedInProfilesManager />}

        {activeTab === "scheduling" && (
          <div className="space-y-6">
            <div className="border-b">
              <div className="flex gap-0">
                {schedulingTabs.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSchedulingSubTab(st.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      schedulingSubTab === st.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
            {schedulingSubTab === "config" && <SchedulingConfig />}
            {schedulingSubTab === "posts" && <ScheduledPostsManager />}
            {schedulingSubTab === "auto" && <AutoScheduleNews />}
          </div>
        )}

        {activeTab === "ai" && <AIManager />}
      </main>
    </div>
  )
}
