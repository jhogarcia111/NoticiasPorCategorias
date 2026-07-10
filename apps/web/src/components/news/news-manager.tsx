"use client"

import { useState, useMemo, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { NewsList } from "./news-list"
import { useNews, useCollectNews, useMarkNewsAsProcessed } from "@/hooks/use-news"
import { useCategories, useToggleCategory, useCreateCategory } from "@/hooks/use-categories"
import {
  Search, RefreshCw, CheckCircle, Circle, Download, Plus, Trash2, Globe, X, Loader2, ToggleLeft, ToggleRight, Sparkles,
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

  // Use external ids if provided, otherwise use internal
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

  // Sync news data to parent for AI tab
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
    if (!confirm("¿Eliminar TODAS las noticias? Esta acción no se puede deshacer.")) return
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
    if (!confirm(`¿Eliminar todas las noticias de esta categoría?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/news?categoryId=${deleteCatId}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error)
      showAlert("success", "Noticias eliminadas de la categoría", "")
      setDeleteCatId(null)
      queryClient.invalidateQueries({ queryKey: ["news"] })
    } catch (e: any) { showAlert("error", "Error", e.message) }
    finally { setDeleting(false) }
  }

  const totalCount = filteredNews.length
  const unprocessedCount = filteredNews.filter((item: any) => !item.isProcessed).length
  const processedCount = filteredNews.filter((item: any) => item.isProcessed).length

  return (
    <div className="space-y-3">
      {alert && (
        <div className={cn(
          "p-3 rounded-md text-xs whitespace-pre-line",
          alert.variant === "success" && "bg-green-50 text-green-800 border border-green-200",
          alert.variant === "info" && "bg-blue-50 text-blue-800 border border-blue-200",
          alert.variant === "error" && "bg-red-50 text-red-800 border border-red-200"
        )}>
          <p className="font-medium text-sm">{alert.title}</p>
          {alert.message && <p className="mt-0.5 text-xs">{alert.message}</p>}
        </div>
      )}

      {/* Three columns: Categories + Custom Search + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Col 1: Categorías */}
        <div className="border rounded-lg p-3 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categorías</span>
            <button onClick={() => setShowNewCat(!showNewCat)} className="text-xs text-primary hover:underline">+ Nueva</button>
          </div>
          {showNewCat && (
            <div className="mb-3 p-3 border rounded-lg bg-muted/30 space-y-2">
              <Input size={20} value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nombre" className="h-8 text-xs" />
              <Input size={20} value={newCatQuery} onChange={(e) => setNewCatQuery(e.target.value)} placeholder="Query (opcional)" className="h-8 text-xs" />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCategory} disabled={!newCatName.trim() || createCategory.isPending} className="text-xs h-7">
                  {createCategory.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />} Crear
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNewCat(false)} className="text-xs h-7">Cancelar</Button>
              </div>
            </div>
          )}
          {catsLoading ? (
            <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat: any) => (
                <button key={cat.id} onClick={() => handleToggleCat(cat)}
                  className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border",
                    cat.isActive ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-transparent")}>
                  {cat.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Col 2: Búsqueda personalizada */}
      <div className="border rounded-lg p-3 bg-card">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Búsqueda personalizada</span>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input placeholder="Ej: OpenClaw, IA, ciberseguridad..." value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSearch()} className="pl-8 h-8 text-xs" />
          </div>
          <Button size="sm" onClick={handleCustomSearch} disabled={!customQuery.trim() || collectMutation.isPending} className="text-xs h-8">
            {collectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />} Buscar
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {["OpenClaw", "ciberseguridad", "IA", "robots", "programación", "Linux", "cloud", "blockchain"].map((s) => (
            <button key={s} onClick={() => { setCustomQuery(s); doCustomSearch(s) }}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-[10px] font-medium">{s}</button>
          ))}
        </div>
      </div>

      {/* Col 3: Filtros */}
      <div className="border rounded-lg p-3 bg-card">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Filtros</span>
        <div className="space-y-2">
          <div className="flex gap-1">
            {[
              { value: "all", label: "🌐 Todo" },
              { value: "es", label: "🇨🇴" },
              { value: "en", label: "🇺🇸" },
            ].map((opt) => (
              <button key={opt.value} onClick={() => setLanguageFilter(opt.value)}
                className={cn("px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                  languageFilter === opt.value ? "bg-primary/10 text-primary border-primary/30" : "bg-background text-muted-foreground border-input hover:bg-muted")}>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input placeholder="Filtrar resultados..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          <div className="flex gap-2">
            <select value={selectedCategory ?? ""} onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="flex-1 h-8 px-2 text-xs border border-input bg-background rounded-md">
              <option value="">Todas</option>
              {categories.filter((c: any) => c.isActive).map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={showUnprocessed} onChange={(e) => setShowUnprocessed(e.target.checked)} className="rounded" />
              No proc.
            </label>
          </div>
        </div>
      </div>
      </div> {/* close 3-column grid */}

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{totalCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Seleccionadas</p><p className="text-2xl font-bold">{selectedNewsIds.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">No Procesadas</p><p className="text-2xl font-bold">{unprocessedCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Procesadas</p><p className="text-2xl font-bold">{processedCount}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Noticias</CardTitle>
              <CardDescription className="text-xs">{filteredNews.length} encontradas</CardDescription>
              <Button size="sm" onClick={handleCollectNews} disabled={collectMutation.isPending} className="h-7 text-[11px] px-2.5">
                <RefreshCw className={cn("h-3 w-3 mr-1", collectMutation.isPending && "animate-spin")} />
                Recolectar
              </Button>
              {selectedNewsIds.length > 0 && (
                <Button size="sm" onClick={handleGoToAI} variant="outline" className="h-7 text-[11px] px-2.5">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  🤖 IA ({selectedNewsIds.length})
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {filteredNews.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-7 text-[11px]">
                  {selectedNewsIds.length === filteredNews.length ? "Deseleccionar" : "Todo"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : (
            <NewsList news={filteredNews} onNewsSelect={toggleNewsSelection} selectedNews={selectedNewsIds} />
          )}
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-red-700">Zona de peligro — limpieza de datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Eliminar noticias de una categoría específica</p>
              <div className="flex gap-2">
                <select value={deleteCatId ?? ""} onChange={(e) => setDeleteCatId(e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-1.5 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Seleccionar categoría...</option>
                  {categories.filter((c: any) => c.isActive).map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={handleDeleteByCategory}
                  disabled={!deleteCatId || deleting} className="text-red-600 border-red-200 hover:bg-red-50">
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                  Eliminar
                </Button>
              </div>
            </div>
            <div className="border-l pl-3">
              <p className="text-xs text-muted-foreground mb-1.5">Eliminar TODAS las noticias</p>
              <Button variant="destructive" size="sm" onClick={handleDeleteAll}
                disabled={deleting}>
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                Limpiar todo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
