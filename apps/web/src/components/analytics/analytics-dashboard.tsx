"use client"

import { useMemo } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAnalyticsDashboard, useRefreshPostMetrics } from "@/hooks/use-analytics"
import {
  BarChart3,
  Eye,
  ThumbsUp,
  MessageCircle,
  TrendingUp,
  Users,
  RefreshCw,
  Loader2,
  Link as LinkIcon,
  Calendar,
  Target,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const fmt = (n: number | null | undefined) =>
  n != null ? n.toLocaleString("es-ES") : "—"

const pct = (n: number | null | undefined) =>
  n != null ? `${n.toFixed(1)}%` : "—"

function MetricBadge({ icon: Icon, label, value, color, bg }: {
  icon: any; label: string; value: string | number; color: string; bg: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", bg, color)}>
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
      <strong>{value}</strong>
    </span>
  )
}

function TrendChart({ data }: { data: { weekStart: string; impressions: number; posts: number }[] }) {
  const max = Math.max(...data.map((d) => d.impressions), 1)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <BarChart3 className="h-10 w-10 text-muted-foreground/40 mb-2" />
        <p className="text-sm">Aun no hay tendencia semanal</p>
        <p className="text-xs">Las metricas se acumulan al publicar y refrescar los posts</p>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 h-44">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="text-[10px] font-medium text-muted-foreground truncate">
            {d.impressions > 0 ? fmt(d.impressions) : ""}
          </span>
          <div
            className="w-full rounded-t bg-gradient-to-t from-[#0A66C2]/20 to-[#0A66C2] transition-all"
            style={{ height: `${Math.max((d.impressions / max) * 100, d.impressions > 0 ? 6 : 2)}%` }}
            title={`${fmt(d.impressions)} impresiones`}
          />
          <span className="text-[10px] text-muted-foreground truncate">
            {format(new Date(d.weekStart), "dd/MM", { locale: es })}
          </span>
        </div>
      ))}
    </div>
  )
}

function PostPerformance({ post, onRefresh, refreshing }: {
  post: any
  onRefresh: () => void
  refreshing: boolean
}) {
  const hasMetrics = post.latest && post.latest.source !== "pending" && post.latest.source !== "unavailable"
  const noData = !post.latest || (post.latest.impressions === 0 && post.latest.likes === 0 && post.latest.comments === 0 && post.latest.shares === 0)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground line-clamp-1 flex-1 min-w-0">
                {post.title || "Publicacion sin titulo"}
              </p>
              <Badge variant={hasMetrics ? "success" : noData ? "secondary" : "warning"} className="text-[10px] h-5">
                {hasMetrics ? "Metricas activas" : noData ? "Sin datos" : "Pendiente"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {post.postedAt ? format(new Date(post.postedAt), "dd/MM/yyyy HH:mm", { locale: es }) : "—"}
              {post.linkedinPostId && (
                <a
                  href={`https://www.linkedin.com/feed/update/${post.linkedinPostId.replace("urn:li:share:", "").replace("urn:li:ugcPost:", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#0A66C2] hover:underline"
                >
                  <LinkIcon className="h-3 w-3" />
                  Ver en LinkedIn
                </a>
              )}
            </p>

            {noData && post.latest?.source === "unavailable" && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                LinkedIn no expone metricas de posts personales via API publica
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <MetricBadge icon={Eye} label="Visualizaciones" value={fmt(post.latest?.impressions)} color="text-sky-700" bg="bg-sky-50" />
              <MetricBadge icon={ThumbsUp} label="Reacciones" value={fmt(post.latest?.likes)} color="text-blue-700" bg="bg-blue-50" />
              <MetricBadge icon={MessageCircle} label="Comentarios" value={fmt(post.latest?.comments)} color="text-violet-700" bg="bg-violet-50" />
              <MetricBadge icon={TrendingUp} label="Engagement" value={pct(post.latest?.engagementRate)} color="text-emerald-700" bg="bg-emerald-50" />
            </div>

            {post.metrics && post.metrics.length > 1 && (
              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-[10px] text-muted-foreground">Seguimiento:</span>
                {post.metrics.map((m: any) => (
                  <span key={m.snapshotDay} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    d{m.snapshotDay}: {fmt(m.impressions)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs flex-shrink-0"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refrescar metricas de este post"
          >
            {refreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsDashboard() {
  const { data: session } = useSession()
  const { data, isLoading, error } = useAnalyticsDashboard()
  const refreshMutation = useRefreshPostMetrics()
  const userId = session?.user?.id

  const profiles = useMemo(() => (data?.data && Array.isArray(data.data) ? data.data : []), [data])
  const hasProfiles = userId != null && profiles.length > 0

  const refreshPost = (postId: number) => {
    refreshMutation.mutate(postId)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!hasProfiles) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="p-4 rounded-full bg-muted mb-4">
          <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="text-base font-medium">Conecta un perfil de LinkedIn</p>
        <p className="text-sm mt-1">Las analiticas apareceran al conectar tu primer perfil y publicar</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          Error al cargar analiticas: {(error as Error).message}
        </div>
      )}

      {profiles.map((profile: any) => {
        const totalReach = profile.totals.impressions
        const joinedAt = profile.baseline?.snapshotDate || null
        const gainPct = profile.baseline?.initialFollowersCount > 0
          ? Math.round((profile.netFollowerGain / profile.baseline.initialFollowersCount) * 100)
          : 0

        return (
          <div key={profile.profile.id} className="space-y-6">
            {/* Panel de impacto */}
            <Card id="analytics-impact" className="overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#0A66C2] via-sky-400 to-emerald-400" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#0A66C2]" />
                  El Efecto NoticiasPorCategorias
                </CardTitle>
                <CardDescription>
                  Perfil: {profile.profile.firstName} {profile.profile.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 p-5 rounded-lg bg-gradient-to-br from-[#0A66C2]/5 to-sky-50 border border-[#0A66C2]/10">
                    <p className="text-2xl lg:text-3xl font-bold text-foreground leading-snug">
                      {joinedAt
                        ? `Desde que te uniste el ${format(new Date(joinedAt), "dd/MM/yyyy", { locale: es })}, tus posts han alcanzado a ${fmt(totalReach)} personas`
                        : `Tus posts han alcanzado a ${fmt(totalReach)} personas`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {profile.totals.posts} publicacion{profile.totals.posts !== 1 ? "es" : ""} via NoticiasPorCategorias
                      {totalReach > 0 ? ` — ${pct(profile.netFollowerGain >= 0 ? 100 : -100)} del alcance total atribuible a la herramienta` : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Users className="h-4 w-4 text-[#0A66C2]" />
                        Crecimiento de red
                      </div>
                      <p className="text-2xl font-bold text-foreground">+{fmt(profile.netFollowerGain)}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.baseline?.initialFollowersCount != null
                          ? `${fmt(profile.baseline.initialFollowersCount)} seguidores iniciales`
                          : "Baseline no capturado"}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        Crecimiento %
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {profile.baseline?.initialFollowersCount ? `+${gainPct}%` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">vs baseline de conexion</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tendencia */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#0A66C2]" />
                  Alcance por semana
                </CardTitle>
                <CardDescription>Impresiones generadas por tus publicaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart data={profile.trend || []} />
              </CardContent>
            </Card>

            {/* Rendimiento por publicacion */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Rendimiento por publicacion</h3>
                <span className="text-xs text-muted-foreground">{profile.posts.length} publicaciones</span>
              </div>
              {profile.posts.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <p className="text-sm">Aun no hay publicaciones con seguimiento</p>
                    <p className="text-xs mt-1">Publica noticias para ver sus metricas aqui</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {profile.posts.map((post: any) => (
                    <PostPerformance
                      key={post.id}
                      post={post}
                      onRefresh={() => refreshPost(post.id)}
                      refreshing={refreshMutation.isPending && refreshMutation.variables === post.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}