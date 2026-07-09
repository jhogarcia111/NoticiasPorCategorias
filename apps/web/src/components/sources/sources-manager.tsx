"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Plus, Trash2, Globe, Rss, ExternalLink, RefreshCw, X, Check, Loader2 } from "lucide-react"

const CATEGORIES = [
  { id: 1, name: "Tecnología" },
  { id: 2, name: "Negocios" },
  { id: 3, name: "Finanzas" },
  { id: 4, name: "Salud" },
  { id: 5, name: "Ciencia" },
]

interface NewsSource {
  id: number
  name: string
  url: string
  type: string
  categoryId: number | null
  language: string
  isActive: boolean
  lastFetchedAt: string | null
  fetchIntervalMinutes: number
  createdAt: string
}

export function SourcesManager() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", url: "", type: "rss", categoryId: "", language: "es" })
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [testingId, setTestingId] = useState<number | null>(null)
  const [testResults, setTestResults] = useState<Record<number, { ok: boolean; count?: number; error?: string }>>({})

  const fetchSources = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/sources")
      const data = await res.json()
      setSources(data.data || [])
    } catch (e: any) {
      setAlert({ type: "error", message: "Error al cargar fuentes" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 4000)
  }

  const handleTest = async (source: NewsSource) => {
    setTestingId(source.id)
    try {
      const res = await fetch("/api/sources/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: source.url }),
      })
      const data = await res.json()
      if (res.ok && data.data) {
        const { items, feedTitle } = data.data
        setTestResults((prev) => ({ ...prev, [source.id]: { ok: true, count: items } }))
        showAlert("success", `✅ "${feedTitle}": ${items} artículos encontrados`)
      } else {
        throw new Error(data.error || "Error al probar feed")
      }
    } catch (e: any) {
      setTestResults((prev) => ({ ...prev, [source.id]: { ok: false, error: e.message } }))
      showAlert("error", `❌ ${source.name}: ${e.message}`)
    }
    setTestingId(null)
  }

  const handleAdd = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      showAlert("error", "Nombre y URL son requeridos")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          url: form.url.trim(),
          type: form.type,
          categoryId: form.categoryId ? parseInt(form.categoryId) : null,
          language: form.language,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSources((prev) => [data.data, ...prev])
      setForm({ name: "", url: "", type: "rss", categoryId: "", language: "es" })
      setShowForm(false)
      showAlert("success", "Fuente agregada correctamente")
    } catch (e: any) {
      showAlert("error", e.message || "Error al agregar fuente")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (source: NewsSource) => {
    try {
      const res = await fetch("/api/sources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: source.id, isActive: !source.isActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, isActive: !s.isActive } : s)))
    } catch (e: any) {
      showAlert("error", e.message || "Error al actualizar")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta fuente?")) return
    try {
      const res = await fetch(`/api/sources?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSources((prev) => prev.filter((s) => s.id !== id))
      showAlert("success", "Fuente eliminada")
    } catch (e: any) {
      showAlert("error", e.message || "Error al eliminar")
    }
  }

  const suggestedFeeds = [
    { name: "BBC Mundo", url: "https://feeds.bbci.co.uk/mundo/rss.xml", categoryId: 1 },
    { name: "El País Tecnología", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada/tecnologia", categoryId: 1 },
    { name: "CNBC Finance", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664", categoryId: 3 },
    { name: "National Geographic Science", url: "https://www.nationalgeographic.com/content/natgeo/en_us/science/rss.xml", categoryId: 5 },
    { name: "WHO News", url: "https://www.who.int/rss-feeds/news-english.xml", categoryId: 4 },
  ]

  const handleAddSuggested = async (feed: typeof suggestedFeeds[0]) => {
    setForm({ name: feed.name, url: feed.url, type: "rss", categoryId: String(feed.categoryId), language: "es" })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fuentes de Noticias</h2>
          <p className="text-muted-foreground">Administra fuentes RSS y APIs para recolectar noticias</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSources} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Recargar
          </Button>
          <Button onClick={() => { setShowForm(!showForm); setForm({ name: "", url: "", type: "rss", categoryId: "", language: "es" }) }}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Fuente
          </Button>
        </div>
      </div>

      {alert && (
        <div
          className={cn(
            "p-4 rounded-md text-sm",
            alert.type === "success" && "bg-green-50 text-green-800 border border-green-200",
            alert.type === "error" && "bg-red-50 text-red-800 border border-red-200"
          )}
        >
          {alert.message}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Nueva Fuente</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <Input
                  placeholder="Ej: BBC Mundo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <Input
                  placeholder="https://ejemplo.com/rss.xml"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="rss">RSS</option>
                  <option value="api">API</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sin categoría</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="pt">Portugués</option>
                </select>
              </div>
            </div>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Guardar Fuente
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Fuentes sugeridas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {suggestedFeeds.map((feed, i) => (
              <button
                key={i}
                onClick={() => handleAddSuggested(feed)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-xs font-medium transition-colors"
              >
                <Rss className="h-3 w-3 text-orange-500" />
                {feed.name}
                <Plus className="h-3 w-3 ml-0.5" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : sources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay fuentes configuradas</p>
            <p className="text-sm text-muted-foreground">Agrega fuentes RSS o APIs para recolectar noticias</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sources.map((source) => (
            <Card key={source.id} className={cn(!source.isActive && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("p-2 rounded-md", source.type === "rss" ? "bg-orange-100" : "bg-blue-100")}>
                      {source.type === "rss" ? <Rss className="h-4 w-4 text-orange-600" /> : <Globe className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{source.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-md">{source.url}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {source.type === "rss" ? "RSS" : "API"}
                        </Badge>
                        {source.categoryId && (
                          <Badge variant="secondary" className="text-xs">
                            {CATEGORIES.find((c) => c.id === source.categoryId)?.name || "—"}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {source.language?.toUpperCase()}
                        </Badge>
                        {source.lastFetchedAt && (
                          <span className="text-xs text-muted-foreground">
                            Última: {new Date(source.lastFetchedAt).toLocaleDateString("es-ES")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(source)}
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        source.isActive ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"
                      )}
                      title={source.isActive ? "Desactivar" : "Activar"}
                    >
                      {source.isActive ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleTest(source)}
                      disabled={testingId === source.id}
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-30"
                      title="Probar fuente"
                    >
                      {testingId === source.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </button>
                    {testResults[source.id] && (
                      <span className={cn(
                        "text-xs font-medium",
                        testResults[source.id].ok ? "text-green-600" : "text-red-600"
                      )}>
                        {testResults[source.id].ok ? `${testResults[source.id].count}` : "!"}
                      </span>
                    )}
                    <button
                      onClick={() => window.open(source.url, "_blank")}
                      className="p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                      title="Abrir URL"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
