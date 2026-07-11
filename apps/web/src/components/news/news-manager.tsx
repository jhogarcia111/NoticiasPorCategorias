"use client"

import { useState, useMemo, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { NewsList } from "./news-list"
import { useNews, useCollectNews, useMarkNewsAsProcessed } from "@/hooks/use-news"
import { useCategories, useToggleCategory, useCreateCategory } from "@/hooks/use-categories"
import {
  Search, RefreshCw, CheckCircle, Circle, Download, Plus, Trash2, Globe, X, Loader2,
  Sparkles, Newspaper, Clock, BarChart3, Filter, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NewsManagerProps {
  selectedNewsIds?: number[]
  onSelectionChange?: (ids: number[]) => void
  onNewsDataChange?: (news: any[]) => void
  onNavigate?: (tab: string) => void
}

export function NewsManager({ selectedNewsIds: externalIds, onSelectionChange, onNewsDataChange, onNavigate }: NewsManagerProps = {}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showUnprocessed, setShowUnprocessed] = useState(false)
  const [languageFilter, setLanguageFilter] = useState<string>("all")
  const [internalSelectedIds, setInternalSelectedIds] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showDangerZone, setShowDangerZone] = useState(false)

  const selectedNewsIds = externalIds ?? internalSelectedIds
  const setSelectedNewsIds = (ids: number[] | ((prev: number[]) => number[])) => {
    const resolved = typeof ids === "function" ? ids(externalIds ?? internalSelectedIds) : ids
    if (onSelectionChange) {
      onSelectionChange(resolved)
    } else {
      setInternalSelectedIds(resolved)
    }
  }

  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null)
  const [customQuery, setCustomQuery] = useState("")
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatQuery, setNewCatQuery] = useState("")
  const [newCatDesc, setNewCatDesc] = useState("")
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const queryClient = useQueryClient()

  const { data: categoriesData, isLoading: catsLoading } = useCategories()
  const toggleCategory = useToggleCategory()
  const createCategory = useCreateCategory()
  const categories = categoriesData || []

  const { data: newsData, isLoading } = useNews({ categoryId: selectedCategory, limit: 50, processed: null })

  useEffect(() => {
    const items = newsData?.data || []
    if (onNewsDataChange && items.length > 0) {
      onNewsDataChange(items)
    }
  }, [newsData, onNewsDataChange])

  const collectMutation = useCollectNews()
  const markProcessedMutation = useMarkNewsAsProcessed()

  const news = newsData?.data || []

  const filteredNews = useMemo(() => {
    let items = news
    if (showUnprocessed) items = items.filter((item: any) => !item.isProcessed)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      items = items.filter((item: any) =>
        item.title?.toLowerCase().includes(q) || item.summary?.toLowerCase().includes(q) ||
        item.content?.toLowerCase().includes(q) || item.sourceName?.toLowerCase().includes(q))
    }
    if (languageFilter !== "all") {
      items = items.filter((item: any) => item.language === languageFilter)
    }
    return items
  }, [news, showUnprocessed, searchQuery, languageFilter])

  const showAlert = (variant: string, title: string, message: string) => {
    setAlert({ variant, title, message })
    setTimeout(() => setAlert(null), 8000)
  }

  const handleCollectNews = async () => {
    try {
      const result = await collectMutation.mutateAsync({})
      const data = result?.data || result || []
      const totalCollected = Array.isArray(data)
        ? data.reduce((sum: number, cat: any) => sum + (cat.collected || 0), 0) : 0
      const details = Array.isArray(data)
        ? data.map((cat: any) => {
            const errors = cat.errors?.filter(Boolean) || []
            const src = cat.sources?.filter(Boolean) || []
            return `${cat.category}: ${cat.collected || 0}${src.length ? ` [${src.join(", ")}]` : ""}${errors.length ? ` [ERR] ${errors.join("; ")}` : ""}`
          }).join("\n") : ""
      if (totalCollected > 0) showAlert("success", `OK ${totalCollected} noticias recolectadas`, details)
      else showAlert("info", "Recoleccion completada", details || "No se encontraron noticias nuevas.")
    } catch (error: any) {
      showAlert("error", "Error", error.message || "Ocurrio un error al recolectar noticias.")
    }
  }

  const doCustomSearch = async (query: string) => {
    if (!query.trim()) return
    try {
      const result = await collectMutation.mutateAsync({ query: query.trim() })
      const data = result?.data || result || []
      const customResult = Array.isArray(data) ? data.find((r: any) => r.category?.includes("Busqueda")) : null
      const count = customResult?.collected || 0
      const errors = customResult?.errors?.filter(Boolean) || []
      if (count > 0) showAlert("success", `OK "${query}": ${count} resultados`, "")
      else if (errors.length) showAlert("error", `"${query}"`, errors.join("; "))
      else showAlert("info", `"${query}": sin resultados`, "")
    } catch (error: any) {
      showAlert("error", "Error en busqueda", error.message)
    }
  }

  const handleCustomSearch = () => doCustomSearch(customQuery)

  const handleToggleCat = async (cat: any) => {
    try {
      await toggleCategory.mutateAsync({ id: cat.id, isActive: !cat.isActive })
      showAlert("success", cat.isActive ? `"${cat.name}" desactivada` : `"${cat.name}" activada`, "")
    } catch (e: any) { showAlert("error", "Error", e.message) }
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    try {
      await createCategory.mutateAsync({ name: newCatName.trim(), description: newCatDesc.trim() || undefined, newsapiCategory: "technology", query: newCatQuery.trim() || undefined })
      setNewCatName(""); setNewCatQuery(""); setNewCatDesc(""); setShowNewCat(false)
      showAlert("success", `Categoria "${newCatName}" creada`, "Aparecera en la lista de categorias activas")
    } catch (e: any) { showAlert("error", "Error", e.message) }
  }

  const handleGoToAI = () => {
    if (selectedNewsIds.length === 0) return
    onNavigate?.("ai")
  }

  const handleSelectAll = () => {
    if (selectedNewsIds.length === filteredNews.length) setSelectedNewsIds([])
    else setSelectedNewsIds(filteredNews.map((item: any) => item.id))
  }

  const toggleNewsSelection = (newsId: number) => {
    setSelectedNewsIds((prev) => prev.includes(newsId) ? prev.filter((id) => id !== newsId) : [...prev, newsId])
  }

  const handleDeleteAll = async () => {
    if (!confirm("¿Eliminar TODAS las noticias? Esta accion no se puede deshacer.")) return
    setDeleting(true)
    try {
      const res = await fetch("/api/news?all=true", { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error)
      showAlert("success", "Todas las noticias eliminadas", "")
      queryClient.invalidateQueries({ queryKey: ["news"] })
    } catch (e: any) { showAlert("error", "Error", e.message) }
    finally { setDeleting(false) }
  }

  const handleDeleteByCategory = async () => {
    if (!deleteCatId) return
    if (!confirm("¿Eliminar todas las noticias de esta categoria?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/news?categoryId=${deleteCatId}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error)
      showAlert("success", "Noticias eliminadas de la categoria", "")
      setDeleteCatId(null)
      queryClient.invalidateQueries({ queryKey: ["news"] })
    } catch (e: any) { showAlert("error", "Error", e.message) }
    finally { setDeleting(false) }
  }

  const totalCount = filteredNews.length
  const unprocessedCount = filteredNews.filter((item: any) => !item.isProcessed).length
  const processedCount = filteredNews.filter((item: any) => item.isProcessed).length

  const suggestedSearches = ["OpenClaw", "ciberseguridad", "IA", "robots", "programacion", "Linux", "cloud", "blockchain"]

  return (
    <div className="space-y-5">
      {alert && (
        <div className={cn(
          "p-3 rounded-md text-sm whitespace-pre-line border",
          alert.variant === "success" && "bg-green-50 text-green-800 border-green-200",
          alert.variant === "info" && "bg-blue-50 text-blue-800 border-blue-200",
          alert.variant === "error" && "bg-red-50 text-red-800 border-red-200"
        )}>
          <p className="font-medium">{alert.title}</p>
          {alert.message && <p className="mt-0.5 text-xs text-muted-foreground">{alert.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: totalCount, icon: Newspaper, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Seleccionadas", value: selectedNewsIds.length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Por procesar", value: unprocessedCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Procesadas", value: processedCount, icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar noticias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn("h-9", showFilters && "bg-primary/5 border-primary/30")}
              >
                <Filter className="h-4 w-4 mr-1.5" />
                Filtros
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" onClick={handleCollectNews} disabled={collectMutation.isPending} className="h-9">
                <RefreshCw className={cn("h-4 w-4 mr-1.5", collectMutation.isPending && "animate-spin")} />
                Recolectar
              </Button>
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Input
                  placeholder="Busqueda personalizada..."
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomSearch()}
                  className="h-9 pr-9"
                />
                <button
                  onClick={handleCustomSearch}
                  disabled={!customQuery.trim() || collectMutation.isPending}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-muted disabled:opacity-30"
                >
                  {collectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                </button>
              </div>
              {selectedNewsIds.length > 0 && (
                <Button size="sm" variant="outline" onClick={handleGoToAI} className="h-9">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  IA ({selectedNewsIds.length})
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Categorias:</span>
                {catsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                        selectedCategory === null
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-input hover:bg-muted",
                      )}
                    >
                      Todas
                    </button>
                    {categories.filter((c: any) => c.isActive).map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                          selectedCategory === cat.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-input hover:bg-muted",
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowNewCat(!showNewCat)}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-input text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Plus className="h-3 w-3 inline mr-0.5" />
                      Nueva
                    </button>
                  </>
                )}
              </div>

              {showNewCat && (
                <div className="flex flex-wrap items-end gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Nombre</label>
                    <Input size={20} value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nombre" className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Query (opcional)</label>
                    <Input size={20} value={newCatQuery} onChange={(e) => setNewCatQuery(e.target.value)} placeholder="Query" className="h-8 text-xs" />
                  </div>
                  <Button size="sm" onClick={handleCreateCategory} disabled={!newCatName.trim() || createCategory.isPending} className="h-8 text-xs">
                    {createCategory.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                    Crear
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowNewCat(false)} className="h-8 text-xs">Cancelar</Button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Idioma:</span>
                  <div className="flex gap-1">
                    {[
                      { value: "all", label: "Todos" },
                      { value: "es", label: "ES" },
                      { value: "en", label: "EN" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setLanguageFilter(opt.value)}
                        className={cn(
                          "px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                          languageFilter === opt.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-input hover:bg-muted",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUnprocessed}
                    onChange={(e) => setShowUnprocessed(e.target.checked)}
                    className="rounded border-input"
                  />
                  Solo no procesadas
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs font-medium text-muted-foreground self-center">Busquedas rapidas:</span>
                {suggestedSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setCustomQuery(s); doCustomSearch(s) }}
                    className="px-2.5 py-0.5 bg-muted hover:bg-muted/80 rounded-full text-[11px] font-medium text-muted-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showFilters && categories.filter((c: any) => c.isActive).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.filter((c: any) => c.isActive).slice(0, 8).map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleToggleCat(cat)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                    cat.isActive ? "bg-primary/5 text-primary border-primary/20" : "bg-muted text-muted-foreground border-transparent"
                  )}
                >
                  {cat.name}
                </button>
              ))}
              {categories.filter((c: any) => c.isActive).length > 8 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{categories.filter((c: any) => c.isActive).length - 8} mas
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold">Noticias</h3>
            <Badge variant="outline" className="text-xs font-normal">{filteredNews.length} encontradas</Badge>
          </div>
          <div className="flex items-center gap-2">
            {filteredNews.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-8 text-xs">
                {selectedNewsIds.length === filteredNews.length ? "Deseleccionar todo" : "Seleccionar todo"}
              </Button>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <NewsList news={filteredNews} onNewsSelect={toggleNewsSelection} selectedNews={selectedNewsIds} />
          )}
        </CardContent>
      </Card>

      <div>
        <button
          onClick={() => setShowDangerZone(!showDangerZone)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", showDangerZone && "rotate-180")} />
          Zona de peligro — limpieza de datos
        </button>
        {showDangerZone && (
          <Card className="mt-3 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Eliminar noticias de una categoria</p>
                  <div className="flex gap-2">
                    <select
                      value={deleteCatId ?? ""}
                      onChange={(e) => setDeleteCatId(e.target.value ? Number(e.target.value) : null)}
                      className="px-3 py-1.5 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">Seleccionar categoria...</option>
                      {categories.filter((c: any) => c.isActive).map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteByCategory}
                      disabled={!deleteCatId || deleting}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                      Eliminar
                    </Button>
                  </div>
                </div>
                <div className="border-l pl-4">
                  <p className="text-xs text-muted-foreground mb-1.5">Eliminar TODAS las noticias</p>
                  <Button variant="destructive" size="sm" onClick={handleDeleteAll} disabled={deleting}>
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                    Limpiar todo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
