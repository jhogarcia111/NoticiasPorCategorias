"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useScheduling } from "@/hooks/use-scheduling"
import { useLinkedInProfiles } from "@/hooks/use-linkedin"
import { useNews } from "@/hooks/use-news"
import {
  Calendar,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Settings,
  Users,
  FileText,
} from "lucide-react"

export function AutoScheduleNews() {
  const { configs, scheduleMultiplePosts, isSchedulingMultiple, stats } = useScheduling()
  const { data: profilesData } = useLinkedInProfiles()
  const profiles = profilesData?.data || []
  const { data: newsData } = useNews({ limit: 50, processed: null })
  const news = newsData?.data || []

  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [selectedConfig, setSelectedConfig] = useState<any>(null)
  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const unprocessedNews = news.filter((item: any) => !item.isProcessed)

  const handleProfileChange = (profileId: number) => {
    const profile = profiles.find((p: any) => p.id === profileId)
    setSelectedProfile(profile)
    const config = configs.find((c: any) => c.linkedinProfileId === profileId)
    setSelectedConfig(config)
  }

  const handleScheduleNews = async () => {
    if (!selectedProfile) {
      setErrorMessage("Por favor selecciona un perfil de LinkedIn")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }
    if (!selectedConfig) {
      setErrorMessage("No hay configuración de programación para este perfil")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }
    if (selectedNewsIds.length === 0) {
      setErrorMessage("Por favor selecciona al menos una noticia para programar")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    try {
      const newsToSchedule = news.filter((item: any) => selectedNewsIds.includes(item.id))
      await scheduleMultiplePosts({ linkedinProfileId: selectedProfile.id, newsItems: newsToSchedule, config: selectedConfig })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      setSelectedNewsIds([])
    } catch (error: any) {
      setErrorMessage(`Error al programar noticias: ${error.message}`)
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    }
  }

  const toggleNewsSelection = (newsId: number) => {
    setSelectedNewsIds((prev) =>
      prev.includes(newsId) ? prev.filter((id) => id !== newsId) : [...prev, newsId]
    )
  }

  const getConfigSummary = (config: any) => {
    if (!config) return "Sin configuración"
    const dayNames: Record<string, string> = {
      monday: "Lun", tuesday: "Mar", wednesday: "Mié",
      thursday: "Jue", friday: "Vie", saturday: "Sáb", sunday: "Dom",
    }
    const enabledDays = Object.entries(dayNames)
      .filter(([day]) => config[`${day}_enabled`])
      .map(([day, name]) => `${name}(${config[`${day}_posts_count`] || 0})`)
    return enabledDays.length > 0 ? enabledDays.join(", ") : "Sin días habilitados"
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="p-4 rounded-md text-sm bg-green-50 text-green-800 border border-green-200">
          <CheckCircle className="h-4 w-4 inline mr-2" />
          ¡Noticias programadas exitosamente! Se han creado {selectedNewsIds.length} publicaciones programadas.
        </div>
      )}
      {showError && (
        <div className="p-4 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
          <AlertCircle className="h-4 w-4 inline mr-2" />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Noticias Disponibles</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{unprocessedNews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Seleccionadas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{selectedNewsIds.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-muted-foreground">Perfiles Conectados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-muted-foreground">Posts Programados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuración de Programación</span>
          </CardTitle>
          <CardDescription>
            Selecciona el perfil de LinkedIn y revisa la configuración de programación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Perfil de LinkedIn</label>
            <select
              value={selectedProfile?.id || ""}
              onChange={(e) => handleProfileChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecciona un perfil</option>
              {profiles.map((profile: any) => (
                <option key={profile.id} value={profile.id}>
                  {profile.firstName} {profile.lastName}
                </option>
              ))}
            </select>
          </div>
          {selectedProfile && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="default">Perfil seleccionado</Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedProfile.firstName} {selectedProfile.lastName}
                </span>
              </div>
              {selectedConfig ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge>Configuración encontrada</Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedConfig.enabled ? "Habilitada" : "Deshabilitada"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Días habilitados:</strong> {getConfigSummary(selectedConfig)}</p>
                    <p><strong>Zona horaria:</strong> {selectedConfig.timezone}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge variant="warning">Sin configuración</Badge>
                  <span className="text-sm text-muted-foreground">
                    Este perfil no tiene configuración de programación
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Seleccionar Noticias</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedNewsIds.length} de {unprocessedNews.length} seleccionadas
              </span>
              {unprocessedNews.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedNewsIds.length === unprocessedNews.length) {
                      setSelectedNewsIds([])
                    } else {
                      setSelectedNewsIds(unprocessedNews.map((item: any) => item.id))
                    }
                  }}
                >
                  {selectedNewsIds.length === unprocessedNews.length
                    ? "Deseleccionar Todo"
                    : "Seleccionar Todo"}
                </Button>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Selecciona las noticias que quieres programar automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unprocessedNews.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay noticias disponibles para programar.</p>
              <p className="text-sm">Recolecta noticias primero.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unprocessedNews.slice(0, 10).map((newsItem: any) => (
                <div
                  key={newsItem.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedNewsIds.includes(newsItem.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleNewsSelection(newsItem.id)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNewsIds.includes(newsItem.id)}
                      onChange={() => toggleNewsSelection(newsItem.id)}
                      className="mt-1 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{newsItem.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {newsItem.summary || newsItem.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">{newsItem.sourceName}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {newsItem.publishedAt ? new Date(newsItem.publishedAt).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {unprocessedNews.length > 10 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ... y {unprocessedNews.length - 10} noticias más
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleScheduleNews}
          disabled={!selectedProfile || !selectedConfig || selectedNewsIds.length === 0 || isSchedulingMultiple}
          size="lg"
          className="px-8"
        >
          <Zap className="h-4 w-4 mr-2" />
          {isSchedulingMultiple
            ? "Programando..."
            : `Programar ${selectedNewsIds.length} Noticias`}
        </Button>
      </div>
    </div>
  )
}
