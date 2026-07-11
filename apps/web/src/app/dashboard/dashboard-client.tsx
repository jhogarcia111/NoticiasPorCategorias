"use client"

import type { Session } from "next-auth"
import { useState, useMemo } from "react"
import { useDashboard, type Tab, type ConfigSubTab } from "./dashboard-context"
import { NewsManager } from "@/components/news/news-manager"
import { AIManager } from "@/components/ai/ai-manager"
import { LinkedInProfilesManager } from "@/components/linkedin/linkedin-profiles-manager"
import { SourcesManager } from "@/components/sources/sources-manager"
import { CalendarView } from "@/components/scheduling/calendar-view"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNews } from "@/hooks/use-news"
import { cn } from "@/lib/utils"
import {
  Newspaper, Brain, Calendar, Settings, Sparkles,
  RefreshCw, CheckCircle2, Clock, ArrowRight,
} from "lucide-react"

interface DashboardClientProps {
  user: Session["user"]
}

const quickActions: { id: string; label: string; icon: any; tab: Tab }[] = [
  { id: "collect", label: "Recolectar noticias", icon: RefreshCw, tab: "news" },
  { id: "ai", label: "Procesar con IA", icon: Brain, tab: "ai" },
  { id: "calendar", label: "Ver calendario", icon: Calendar, tab: "calendar" },
]

function StatsCard({ icon: Icon, label, value, color, bg }: {
  icon: any; label: string; value: string | number; color: string; bg: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-lg", bg)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const { activeTab, setActiveTab, selectedNewsIds, setSelectedNewsIds, cachedNews, setCachedNews } = useDashboard()
  const [configSubTab, setConfigSubTab] = useState<ConfigSubTab>("linkedin")

  const { data: allNewsData } = useNews({ limit: 1 })

  const totalNews = allNewsData?.total ?? allNewsData?.data?.length ?? "—"

  const configTabs: { id: ConfigSubTab; label: string }[] = [
    { id: "linkedin", label: "Perfiles LinkedIn" },
    { id: "sources", label: "Fuentes de Noticias" },
  ]

  return (
    <>
      {activeTab === "home" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Bienvenido, {user.name || "Usuario"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Gestiona tus noticias, genera contenido con IA y programa publicaciones para LinkedIn.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Newspaper className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={Newspaper} label="Noticias totales" value={totalNews} color="text-blue-600" bg="bg-blue-50" />
            <StatsCard icon={Clock} label="Por procesar" value="—" color="text-amber-600" bg="bg-amber-50" />
            <StatsCard icon={Calendar} label="Programadas" value="—" color="text-purple-600" bg="bg-purple-50" />
            <StatsCard icon={CheckCircle2} label="Publicadas hoy" value="—" color="text-green-600" bg="bg-green-50" />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Accesos directos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => setActiveTab(action.tab)}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "news" && (
        <NewsManager
          selectedNewsIds={selectedNewsIds}
          onSelectionChange={setSelectedNewsIds}
          onNewsDataChange={(news) => setCachedNews(news)}
          onNavigate={(tab) => setActiveTab(tab as Tab)}
        />
      )}

      {activeTab === "ai" && (
        <AIManager selectedNewsIds={selectedNewsIds} news={cachedNews} />
      )}

      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Perfiles LinkedIn</h3>
            <LinkedInProfilesManager />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Fuentes de Noticias</h3>
            <SourcesManager />
          </div>
        </div>
      )}

      {activeTab === "calendar" && <CalendarView />}
    </>
  )
}
