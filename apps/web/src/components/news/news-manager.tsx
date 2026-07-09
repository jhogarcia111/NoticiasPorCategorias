"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { NewsList } from "./news-list"
import { useNews, useCollectNews, useMarkNewsAsProcessed } from "@/hooks/use-news"
import {
  Search,
  RefreshCw,
  CheckCircle,
  Circle,
  Download,
  Filter,
  Hash,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Category {
  id: number; name: string; isActive: boolean; newsapiCategory: string | null
}

export function NewsManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showUnprocessed, setShowUnprocessed] = useState(false)
  const [selectedNewsIds, setSelectedNewsIds] = useState<number[]>([])
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null)
  const [keywordSearch, setKeywordSearch] = useState("")

  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => {
      setCategories(d.data || [])
    }).catch(() => {})
  }, [])

  const { data: newsData, isLoading } = useNews({
    categoryId: selectedCategory,
    limit: 50,
    processed: null,
  })

  const collectMutation = useCollectNews()
  const markProcessedMutation = useMarkNewsAsProcessed()

  const news = newsData?.data || []

  const filteredNews = useMemo(() => {
    let items = news
    if (showUnprocessed) {
      items = items.filter((item: any) => !item.isProcessed)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      items = items.filter(
        (item: any) =>
          item.title?.toLowerCase().includes(q) ||
          item.summary?.toLowerCase().includes(q) ||
          item.content?.toLowerCase().includes(q) ||
          item.sourceName?.toLowerCase().includes(q)
      )
    }
    return items
  }, [news, showUnprocessed, searchQuery])

  const handleCollectNews = async () => {
    try {
      const opts: any = {}
      if (keywordSearch.trim()) opts.query = keywordSearch.trim()
      const result = await collectMutation.mutateAsync(opts)
      const data = result?.data || result || []
      const totalCollected = Array.isArray(data)
        ? data.reduce((sum: number, cat: any) => sum + (cat.collected || 0), 0)
        : 0

      const details = Array.isArray(data)
        ? data.map((cat: any) => {
            const errors = cat.errors?.filter(Boolean) || []
            const src = cat.sources?.filter(Boolean) || []
            return `${cat.category}: ${cat.collected || 0} noticias${src.length ? ` [${src.join(", ")}]` : ""}${errors.length ? ` ⚠ ${errors.join("; ")}` : ""}`
          }).join("\n")
        : ""

      if (totalCollected > 0) {
        setAlert({
          variant: "success",
          title: `✓ ${totalCollected} noticias recolectadas`,
          message: details,
        })
      } else {
        const hasErrors = Array.isArray(data) && data.some((c: any) => c.errors?.length)
        setAlert({
          variant: hasErrors ? "error" : "info",
          title: hasErrors ? "⚠ Recolección con errores" : "Recolección completada",
          message: details || "No se encontraron noticias nuevas.",
        })
      }
    } catch (error: any) {
      setAlert({
        variant: "error",
        title: "Error al recolectar noticias",
        message: error.message || "Ocurrió un error al recolectar noticias.",
      })
    }
    setTimeout(() => setAlert(null), 8000)
  }

  const handleMarkAsProcessed = async () => {
    if (selectedNewsIds.length === 0) return
    try {
      await markProcessedMutation.mutateAsync(selectedNewsIds)
      setSelectedNewsIds([])
    } catch (error) {
      console.error("Error marking news as processed:", error)
    }
  }

  const handleSelectAll = () => {
    if (selectedNewsIds.length === filteredNews.length) {
      setSelectedNewsIds([])
    } else {
      setSelectedNewsIds(filteredNews.map((item: any) => item.id))
    }
  }

  const handleNewsSelection = (newsId: number) => {
    setSelectedNewsIds((prev) =>
      prev.includes(newsId) ? prev.filter((id) => id !== newsId) : [...prev, newsId]
    )
  }

  const totalCount = filteredNews.length
  const unprocessedCount = filteredNews.filter((item: any) => !item.isProcessed).length
  const processedCount = filteredNews.filter((item: any) => item.isProcessed).length

  return (
    <div className="space-y-6">
      {alert && (
        <div
          className={cn(
            "p-4 rounded-md text-sm",
            alert.variant === "success" && "bg-green-50 text-green-800 border border-green-200",
            alert.variant === "info" && "bg-blue-50 text-blue-800 border border-blue-200",
            alert.variant === "error" && "bg-red-50 text-red-800 border border-red-200"
          )}
        >
          <p className="font-medium">{alert.title}</p>
          <p>{alert.message}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Noticias</h2>
          <p className="text-muted-foreground">Recolecta y gestiona noticias para publicar en LinkedIn</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleCollectNews} disabled={collectMutation.isPending}>
            <RefreshCw className={cn("h-4 w-4 mr-2", collectMutation.isPending && "animate-spin")} />
            Recolectar Noticias
          </Button>
          {selectedNewsIds.length > 0 && (
            <Button
              onClick={handleMarkAsProcessed}
              disabled={markProcessedMutation.isPending}
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Procesadas ({selectedNewsIds.length})
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar en resultados</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filtrar noticias cargadas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={selectedCategory ?? ""}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {!cat.isActive ? "(inactiva)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por keyword</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ej: OpenClaw, ciberseguridad..."
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Busca en NewsAPI + RSS. Se combina con "Recolectar Noticias"
              </p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnprocessed}
                  onChange={(e) => setShowUnprocessed(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Solo no procesadas</span>
              </label>
            </div>
          </div>

          {/* Active categories indicator */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground font-medium">Categorías activas:</span>
            {categories.filter(c => c.isActive).length === 0 ? (
              <span className="text-xs text-destructive">Ninguna — desactiva desde la pestaña Categorías</span>
            ) : (
              categories.filter(c => c.isActive).map(cat => (
                <Badge key={cat.id} variant="secondary" className="text-xs">
                  {cat.name}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Noticias</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <Download className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Seleccionadas</p>
                <p className="text-2xl font-bold text-gray-900">{selectedNewsIds.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">No Procesadas</p>
                <p className="text-2xl font-bold text-gray-900">{unprocessedCount}</p>
              </div>
              <Circle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Procesadas</p>
                <p className="text-2xl font-bold text-gray-900">{processedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Noticias Recolectadas</CardTitle>
              <CardDescription>{filteredNews.length} noticias encontradas</CardDescription>
            </div>
            {filteredNews.length > 0 && (
              <Button variant="outline" onClick={handleSelectAll} size="sm">
                {selectedNewsIds.length === filteredNews.length
                  ? "Deseleccionar Todo"
                  : "Seleccionar Todo"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <NewsList
              news={filteredNews}
              onNewsSelect={handleNewsSelection}
              selectedNews={selectedNewsIds}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
