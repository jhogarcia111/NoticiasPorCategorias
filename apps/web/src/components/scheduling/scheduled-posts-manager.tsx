"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useScheduling } from "@/hooks/use-scheduling"
import { useLinkedInProfiles } from "@/hooks/use-linkedin"
import {
  Calendar,
  Clock,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Filter,
  Search,
} from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
  scheduled: "default",
  published: "success",
  failed: "destructive",
  cancelled: "secondary",
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Programado",
  published: "Publicado",
  failed: "Falló",
  cancelled: "Cancelado",
}

export function ScheduledPostsManager() {
  const { scheduledPosts, cancelPost, deletePost, isCancelling, isDeleting, stats } =
    useScheduling()
  const { data: profilesData } = useLinkedInProfiles()
  const profiles = profilesData?.data || []

  const [filters, setFilters] = useState({
    status: "",
    profile: "",
    search: "",
  })

  const filteredPosts = (scheduledPosts || []).filter((post: any) => {
    if (filters.status && post.status !== filters.status) return false
    if (filters.profile && post.linkedinProfileId !== Number(filters.profile)) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower) ||
        post.summary?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const handleCancelPost = async (postId: number) => {
    if (window.confirm("¿Estás seguro de que quieres cancelar este post?")) {
      try {
        await cancelPost(postId)
      } catch (error) {
        console.error("Error cancelling post:", error)
      }
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await deletePost(postId)
      } catch (error) {
        console.error("Error deleting post:", error)
      }
    }
  }

  const getProfileName = (profileId: number) => {
    const profile = profiles.find((p: any) => p.id === profileId)
    return profile ? `${profile.firstName} ${profile.lastName}` : "Perfil desconocido"
  }

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
    } catch {
      return "Fecha inválida"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Programados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Publicados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-muted-foreground">Fallidos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todos los estados</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Perfil</label>
              <select
                value={filters.profile}
                onChange={(e) => setFilters((prev) => ({ ...prev, profile: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todos los perfiles</option>
                {profiles.map((profile: any) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.firstName} {profile.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en títulos y contenido..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay posts programados que coincidan con los filtros.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post: any) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <Badge variant={(STATUS_COLORS[post.status] || "default") as any}>
                        {STATUS_LABELS[post.status] || post.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content || post.summary}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Programado: {formatDate(post.scheduledAt)}</span>
                      </div>
{post.postedAt && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Publicado: {formatDate(post.postedAt)}</span>
                        </div>
                      )}
                      <span>Perfil: {getProfileName(post.linkedinProfileId)}</span>
                    </div>
                    {post.errorMessage && (
                      <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{post.errorMessage}</span>
                      </div>
                    )}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.hashtags.map((hashtag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{hashtag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(post.news?.sourceUrl, "_blank")}
                      title="Ver noticia original"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    {post.status === "scheduled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelPost(post.id)}
                        disabled={isCancelling}
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={isDeleting}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
