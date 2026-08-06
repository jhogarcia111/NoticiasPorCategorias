"use client"

import { useState, useEffect } from "react"
import type { Session } from "next-auth"
import { useDashboard, type Tab } from "./dashboard-context"
import { NewsManager } from "@/components/news/news-manager"
import { AIManager } from "@/components/ai/ai-manager"
import { LinkedInProfilesManager } from "@/components/linkedin/linkedin-profiles-manager"
import { SourcesManager } from "@/components/sources/sources-manager"
import { CategoryManager } from "@/components/categories/category-manager"
import { CalendarView } from "@/components/scheduling/calendar-view"
import { PublishedView } from "@/components/news/published-view"
import { EmailTemplatesAdmin } from "./admin/email-templates-admin"
import { AdminSubscriptions } from "@/components/admin/admin-subscriptions"
import { SubscriptionManager } from "@/components/subscription/subscription-manager"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Newspaper, Brain, Calendar,
  RefreshCw, CheckCircle2, Clock, ArrowRight, Gem, PenSquare, ExternalLink,
} from "lucide-react"

interface DashboardClientProps {
  user: Session["user"]
}

const quickActions: { id: string; label: string; icon: any; tab: Tab }[] = [
  { id: "collect", label: "Recolectar noticias", icon: RefreshCw, tab: "news" },
  { id: "ai", label: "Procesar con IA", icon: Brain, tab: "ai" },
  { id: "calendar", label: "Ver calendario", icon: Calendar, tab: "calendar" },
]

function StatsCard({ icon: Icon, label, value, color, bg, onClick }: {
  icon: any; label: string; value: string | number; color: string; bg: string; onClick?: () => void
}) {
  return (
    <Card className={cn(onClick && "cursor-pointer hover:shadow-md hover:border-primary/30 transition-all")}>
      <CardContent className="p-4" onClick={onClick}>
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

  const [stats, setStats] = useState<{ totalNews: number; unprocessed: number; drafts: number; scheduled: number; publishedToday: number } | null>(null)

  const [usage, setUsage] = useState<{ used: number; limit: number; limitLabel: string; plan: string } | null>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => setStats(d.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/usage?userId=${user.id}`)
        .then(r => r.json())
        .then(d => setUsage(d))
        .catch(() => {})
    }
  }, [user?.id])

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
            <StatsCard icon={Newspaper} label="Noticias totales" value={stats?.totalNews ?? "—"} color="text-blue-600" bg="bg-blue-50" onClick={() => setActiveTab("news")} />
            <StatsCard icon={Clock} label="Por procesar" value={stats?.unprocessed ?? "—"} color="text-amber-600" bg="bg-amber-50" onClick={() => setActiveTab("news")} />
            <StatsCard icon={PenSquare} label="Borradores IA" value={stats?.drafts ?? "—"} color="text-sky-600" bg="bg-sky-50" onClick={() => setActiveTab("ai")} />
            <StatsCard icon={CheckCircle2} label="Publicadas hoy" value={stats?.publishedToday ?? "—"} color="text-green-600" bg="bg-green-50" onClick={() => setActiveTab("published")} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab("calendar")}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-50">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Programadas ({stats?.scheduled ?? "—"})</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-sky-50">
                  <PenSquare className="h-5 w-5 text-sky-600" />
                </div>
                <span className="text-sm font-medium">Borradores de IA ({stats?.drafts ?? "—"})</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>

          {usage && usage.limit !== Infinity && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Plan {usage.plan} — {usage.used}/{usage.limitLabel} publicaciones este mes
                    </span>
                    {usage.used >= usage.limit ? (
                      <Badge variant="destructive" className="text-xs">Límite alcanzado</Badge>
                    ) : usage.used >= usage.limit * 0.8 ? (
                      <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">Por agotarse</Badge>
                    ) : null}
                  </div>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${usage.used >= usage.limit ? "bg-red-500" : "bg-yellow-500"}`}
                    style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                  />
                </div>
                {usage.used >= usage.limit && (
                  <p className="text-xs text-red-600 mt-2">
                    Actualiza tu plan para seguir publicando.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

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
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Categorías</h3>
            <CategoryManager />
          </div>
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
        </div>
      )}

      {activeTab === "calendar" && <CalendarView />}

      {activeTab === "published" && <PublishedView />}

      {activeTab === "subscription" && <SubscriptionManager user={user} />}

      {activeTab === "admin" && (
        <div className="space-y-8">
          <EmailTemplatesAdmin />
          <AdminSubscriptions />
        </div>
      )}
    </>)
  }
