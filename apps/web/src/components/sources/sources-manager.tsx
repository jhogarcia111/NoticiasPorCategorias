"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Plus, Trash2, Globe, Rss, ExternalLink, RefreshCw, X, Check, Loader2, Search } from "lucide-react"

const CATEGORIES = [
  { id: 1, name: "Tecnologia" },
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
  const [feedSearch, setFeedSearch] = useState("")
  const [discoverQuery, setDiscoverQuery] = useState("")
  const [discovering, setDiscovering] = useState(false)
  const [discoveredFeeds, setDiscoveredFeeds] = useState<any[]>([])
  const [sourceLangFilter, setSourceLangFilter] = useState<string>("all")

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
        showAlert("success", `"${feedTitle}": ${items} articulos encontrados`)
      } else {
        throw new Error(data.error || "Error al probar feed")
      }
    } catch (e: any) {
      setTestResults((prev) => ({ ...prev, [source.id]: { ok: false, error: e.message } }))
      showAlert("error", `${source.name}: ${e.message}`)
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

  const handleDelete = async (id: number, withNews = false) => {
    const msg = withNews ? "¿Eliminar fuente y TODAS las noticias asociadas?" : "¿Eliminar esta fuente? (las noticias se conservan)"
    if (!confirm(msg)) return
    try {
      const res = await fetch(`/api/sources?id=${id}&cleanup=${withNews}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSources((prev) => prev.filter((s) => s.id !== id))
      if (data.newsDeleted) showAlert("success", "Fuente eliminada + noticias asociadas limpiadas")
      else showAlert("success", "Fuente eliminada")
    } catch (e: any) {
      showAlert("error", e.message || "Error al eliminar")
    }
  }

  const suggestedFeeds = [
    { name: "MIT AI News", url: "https://news.mit.edu/topic/artificial-intelligence/rss.xml", categoryId: 1, group: "IA" },
    { name: "OpenAI Blog", url: "https://openai.com/blog/rss.xml", categoryId: 1, group: "IA" },
    { name: "Google AI Blog", url: "https://blog.research.google/atom.xml", categoryId: 1, group: "IA" },
    { name: "DeepMind Blog", url: "https://deepmind.google/discover/blog/feed.xml", categoryId: 1, group: "IA" },
    { name: "AI News", url: "https://www.artificialintelligence-news.com/feed/", categoryId: 1, group: "IA" },
    { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", categoryId: 1, group: "IA" },
    { name: "IEEE Spectrum Robotics", url: "https://spectrum.ieee.org/topic/robotics/rss", categoryId: 1, group: "Robotica" },
    { name: "Robotics Tomorrow", url: "https://www.roboticstomorrow.com/rss.php", categoryId: 1, group: "Robotica" },
    { name: "TechCrunch", url: "https://techcrunch.com/feed/", categoryId: 1, group: "Tech" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", categoryId: 1, group: "Tech" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", categoryId: 1, group: "Tech" },
    { name: "Wired", url: "https://www.wired.com/feed/rss", categoryId: 1, group: "Tech" },
    { name: "Hacker News", url: "https://hnrss.org/frontpage", categoryId: 1, group: "Tech" },
    { name: "CNBC Tech", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19854910", categoryId: 1, group: "Tech" },
    { name: "Xataka", url: "https://www.xataka.com/feed.xml", categoryId: 1, group: "Espanol" },
    { name: "El Espanol Tecnologia", url: "https://www.elespanol.com/feed/tecnologia.xml", categoryId: 1, group: "Espanol" },
    { name: "Genbeta", url: "https://www.genbeta.com/feed.xml", categoryId: 1, group: "Espanol" },
    { name: "BBC Mundo", url: "https://feeds.bbci.co.uk/mundo/rss.xml", categoryId: 1, group: "General" },
    { name: "El Pais Tecnologia", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada/tecnologia", categoryId: 1, group: "Espanol" },
  ]

  const detectLanguage = (url: string) => {
    try {
      const domain = new URL(url).hostname.toLowerCase()
      if (domain.endsWith('.es') || domain.includes('es.') || url.includes('/es/')) return "es"
    } catch {}
    return "en"
  }

  const feedGroups = [...new Set(suggestedFeeds.map((f) => f.group))]
  const filteredSuggestedFeeds = (feedSearch.trim()
    ? suggestedFeeds.filter(f =>
        f.name.toLowerCase().includes(feedSearch.toLowerCase()) ||
        f.group.toLowerCase().includes(feedSearch.toLowerCase()) ||
        f.url.toLowerCase().includes(feedSearch.toLowerCase()))
    : suggestedFeeds
  ).filter(f => !sources.some(s => s.url === f.url))
  const filteredFeedGroups = feedSearch.trim()
    ? [...new Set(filteredSuggestedFeeds.map((f) => f.group))]
    : feedGroups

  const handleAddSuggested = async (feed: typeof suggestedFeeds[0]) => {
    if (sources.some((s) => s.url === feed.url)) {
      showAlert("error", `"${feed.name}" ya esta agregada`)
      return
    }
    setForm({ name: feed.name, url: feed.url, type: "rss", categoryId: String(feed.categoryId), language: detectLanguage(feed.url) })
    setShowForm(true)
  }

  const handleDiscover = async () => {
    if (!discoverQuery.trim()) return
    setDiscovering(true)
    try {
      const res = await fetch("/api/news/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: discoverQuery.trim(),
          discover: true,
          pageSize: 20,
        }),
      })
      const data = await res.json()
      setDiscoveredFeeds(data.sources || [])
    } catch (e: any) {
      showAlert("error", `Error: ${e.message}`)
    } finally {
      setDiscovering(false)
    }
  }

  return (
    <div className="space-y-6">
      {alert && (
        <div className={cn(
          "p-4 rounded-lg text-sm border",
          alert.type === "success" && "bg-green-50 text-green-800 border-green-200",
          alert.type === "error" && "bg-red-50 text-red-800 border-red-200"
        )}>
          <div className="flex items-center gap-2">
            {alert.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-50">
            <Rss className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Fuentes de Noticias</h3>
            <p className="text-xs text-muted-foreground">Administra fuentes RSS y APIs para recolectar noticias</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSources} disabled={loading} className="h-9 text-xs">
            <RefreshCw className={cn("h-4 w-4 mr-1.5", loading && "animate-spin")} />
            Recargar
          </Button>
          <Button size="sm" onClick={() => { setShowForm(!showForm); setForm({ name: "", url: "", type: "rss", categoryId: "", language: "es" }) }} className="h-9 text-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Agregar Fuente
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-semibold">Nueva Fuente</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                <Input placeholder="Ej: BBC Mundo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">URL</label>
                <Input placeholder="https://ejemplo.com/rss.xml" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full h-9 px-3 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="rss">RSS</option>
                  <option value="api">API</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full h-9 px-3 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Sin categoria</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Idioma</label>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full h-9 px-3 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="es">Espanol</option>
                  <option value="en">Ingles</option>
                  <option value="pt">Portugues</option>
                </select>
              </div>
            </div>
            <Button onClick={handleAdd} disabled={saving} size="sm" className="h-9">
              {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
              Guardar Fuente
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Fuentes sugeridas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Buscar feeds por tema (ej: AI, robotics, salud)..."
            value={feedSearch}
            onChange={(e) => setFeedSearch(e.target.value)}
            className="h-9"
          />
          {filteredSuggestedFeeds.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin resultados para "{feedSearch}"</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredFeedGroups.map((group) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{group}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {filteredSuggestedFeeds.filter((f) => f.group === group).map((feed, i) => (
                      <button key={i} onClick={() => handleAddSuggested(feed)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-muted/80 rounded-full text-xs font-medium transition-colors group"
                      >
                        <Rss className="h-3 w-3 text-orange-500 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">{feed.name}</span>
                        <Plus className="h-3 w-3 text-green-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Descubrir Feeds por tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={discoverQuery} onChange={(e) => setDiscoverQuery(e.target.value)}
                placeholder="Ej: artificial intelligence, robotics, cybersecurity..."
                className="pl-9 h-9"
                onKeyDown={(e) => e.key === "Enter" && handleDiscover()} />
            </div>
            <Button onClick={handleDiscover} disabled={!discoverQuery.trim() || discovering} className="h-9 text-xs">
              {discovering ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Globe className="h-4 w-4 mr-1.5" />}
              Descubrir
            </Button>
          </div>
          {discoveredFeeds.length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Fuentes encontradas para "{discoverQuery}":
              </p>
              {discoveredFeeds.map((feed, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg text-sm">
                  <span className="font-medium truncate">{feed.name || feed.url}</span>
                  <Button variant="ghost" size="sm"
                    onClick={() => handleAddSuggested({ name: feed.name, url: feed.url, categoryId: 1, group: "Descubierto" })}
                    className="text-xs flex-shrink-0 h-7">
                    <Plus className="h-3 w-3 mr-1" /> Agregar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : sources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <div className="p-3 rounded-full bg-muted w-fit mx-auto mb-4">
              <Globe className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium">No hay fuentes configuradas</p>
            <p className="text-xs mt-1">Agrega fuentes RSS o APIs para recolectar noticias</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filtro:</span>
            {[
              { value: "all", label: "Todos" },
              { value: "es", label: "ES" },
              { value: "en", label: "EN" },
            ].map((opt) => (
              <button key={opt.value} onClick={() => setSourceLangFilter(opt.value)}
                className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                  sourceLangFilter === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-muted")}>
                {opt.label}
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-auto">
              {(sourceLangFilter === "all" ? sources : sources.filter(s => s.language === sourceLangFilter)).length} fuentes
            </span>
          </div>
          <div className="space-y-2">
            {(sourceLangFilter === "all" ? sources : sources.filter(s => s.language === sourceLangFilter)).map((source: any) => (
              <Card key={source.id} className={cn(!source.isActive && "opacity-60")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn("p-2 rounded-lg flex-shrink-0", source.type === "rss" ? "bg-orange-50" : "bg-blue-50")}>
                        {source.type === "rss" ? <Rss className="h-4 w-4 text-orange-600" /> : <Globe className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{source.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-md">{source.url}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] font-normal h-5">
                            {source.type === "rss" ? "RSS" : "API"}
                          </Badge>
                          {source.categoryId && (
                            <Badge variant="secondary" className="text-[10px] font-normal h-5">
                              {CATEGORIES.find((c) => c.id === source.categoryId)?.name || "—"}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] font-normal h-5">
                            {source.language?.toUpperCase()}
                          </Badge>
                          {source.lastFetchedAt && (
                            <span className="text-[10px] text-muted-foreground">
                              Ultima: {new Date(source.lastFetchedAt).toLocaleDateString("es-ES")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(source)}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          source.isActive ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"
                        )}
                        title={source.isActive ? "Desactivar" : "Activar"}
                      >
                        {source.isActive ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleTest(source)}
                        disabled={testingId === source.id}
                        className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-30"
                        title="Probar fuente"
                      >
                        {testingId === source.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      </button>
                      {testResults[source.id] && (
                        <span className={cn(
                          "text-xs font-medium px-1",
                          testResults[source.id].ok ? "text-green-600" : "text-red-600"
                        )}>
                          {testResults[source.id].ok ? testResults[source.id].count : "!"}
                        </span>
                      )}
                      <button
                        onClick={() => window.open(source.url, "_blank")}
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                        title="Abrir URL"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      <div className="border-l border-border pl-1 ml-1 flex gap-1">
                        <button onClick={() => handleDelete(source.id, false)}
                          className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                          title="Eliminar fuente (conserva noticias)">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(source.id, true)}
                          className="p-1.5 rounded-md text-red-700 hover:bg-red-100 transition-colors"
                          title="Eliminar fuente + noticias asociadas">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
