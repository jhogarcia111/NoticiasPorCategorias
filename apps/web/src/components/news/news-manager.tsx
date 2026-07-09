"use client"

import { useState, useMemo } from "react"
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

export function NewsManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showUnprocessed, setShowUnprocessed] = useState(false)
  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([])
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null)
  const [customQuery, setCustomQuery] = useState("")
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatQuery, setNewCatQuery] = useState("")
  const [newCatDesc, setNewCatDesc] = useState("")

  const { data: categoriesData, isLoading: catsLoading } = useCategories()
  const toggleCategory = useToggleCategory()
  const createCategory = useCreateCategory()
  const categories = categoriesData || []

  const { data: newsData, isLoading } = useNews({ categoryId: selectedCategory, limit: 50, processed: null })
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
    return items
  }, [news, showUnprocessed, searchQuery])

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

  const handleMarkAsProcessed = async () => {
    if (selectedNewsIds.length === 0) return
    try { await markProcessedMutation.mutateAsync(selectedNewsIds); setSelectedNewsIds([]) }
    catch (error) { console.error("Error marking news as processed:", error) }
  }

  const handleSelectAll = () => {
    if (selectedNewsIds.length === filteredNews.length) setSelectedNewsIds([])
    else setSelectedNewsIds(filteredNews.map((item: any) => item.id))
  }

  const toggleNewsSelection = (newsId: number) => {
    setSelectedNewsIds((prev) => prev.includes(newsId) ? prev.filter((id) => id !== newsId) : [...prev, newsId])
  }

  const totalCount = filteredNews.length
  const unprocessedCount = filteredNews.filter((item: any) => !item.isProcessed).length
  const processedCount = filteredNews.filter((item: any) => item.isProcessed).length

  return (
    <div className="space-y-6">
      {alert && (
        <div className={cn(
          "p-4 rounded-md text-sm whitespace-pre-line",
          alert.variant === "success" && "bg-green-50 text-green-800 border border-green-200",
          alert.variant === "info" && "bg-blue-50 text-blue-800 border border-blue-200",
          alert.variant === "error" && "bg-red-50 text-red-800 border border-red-200"
        )}>
          <p className="font-medium">{alert.title}</p>
          {alert.message && <p className="mt-1 text-xs">{alert.message}</p>}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Noticias</h2>
          <p className="text-muted-foreground">Recolecta, selecciona y procesa noticias</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCollectNews} disabled={collectMutation.isPending}>
            <RefreshCw className={cn("h-4 w-4 mr-2", collectMutation.isPending && "animate-spin")} />
            Recolectar
          </Button>
          {selectedNewsIds.length > 0 && (
            <Button onClick={handleMarkAsProcessed} disabled={markProcessedMutation.isPending} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Procesar ({selectedNewsIds.length})
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Categorias</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowNewCat(!showNewCat)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Nueva
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showNewCat && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/30 space-y-3">
              <p className="text-sm font-medium">Nueva categoria personalizada</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nombre (ej: Seguridad Informatica)" />
                <Input value={newCatQuery} onChange={(e) => setNewCatQuery(e.target.value)} placeholder="Query (ej: cybersecurity OR hacking)" />
                <Input value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} placeholder="Descripcion" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowNewCat(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleCreateCategory} disabled={!newCatName.trim() || createCategory.isPending}>
                  {createCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                  Crear
                </Button>
              </div>
            </div>
          )}
          {catsLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat: any) => (
                <button key={cat.id} onClick={() => handleToggleCat(cat)}
                  className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    cat.isActive ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80")}
                  title={cat.isActive ? "Desactivar" : "Activar"}>
                  {cat.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Busqueda personalizada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Ej: OpenClaw, ciberseguridad, IA..." value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomSearch()} className="pl-10" />
            </div>
            <Button onClick={handleCustomSearch} disabled={!customQuery.trim() || collectMutation.isPending}>
              {collectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Buscar
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {["OpenClaw", "ciberseguridad", "inteligencia artificial", "programacion", "robotizacion", "Linux", "cloud computing", "blockchain"].map((s) => (
              <button key={s} onClick={() => { setCustomQuery(s); doCustomSearch(s) }}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-xs font-medium transition-colors">
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Filtrar resultados..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={selectedCategory ?? ""} onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Todas las categorias</option>
              {categories.filter((c: any) => c.isActive).map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={showUnprocessed} onChange={(e) => setShowUnprocessed(e.target.checked)} className="rounded border-gray-300" />
              Solo no procesadas
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{totalCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Seleccionadas</p><p className="text-2xl font-bold">{selectedNewsIds.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">No Procesadas</p><p className="text-2xl font-bold">{unprocessedCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Procesadas</p><p className="text-2xl font-bold">{processedCount}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div><CardTitle className="text-base">Noticias</CardTitle><CardDescription>{filteredNews.length} encontradas</CardDescription></div>
            {filteredNews.length > 0 && (
              <Button variant="outline" onClick={handleSelectAll} size="sm">
                {selectedNewsIds.length === filteredNews.length ? "Deseleccionar" : "Seleccionar Todo"}
              </Button>
            )}
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
    </div>
  )
}
