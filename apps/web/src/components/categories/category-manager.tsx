"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Plus, Trash2, Check, X, Loader2, ToggleLeft, ToggleRight, FolderOpen, Search, Tag } from "lucide-react"

interface Category {
  id: number
  name: string
  description: string | null
  newsapiCategory: string | null
  rssFeedUrl: string | null
  providerType: string
  isActive: boolean
  usageCount: number
}

const NEWSAPI_CATEGORIES = [
  "business", "entertainment", "general", "health", "science", "sports", "technology",
]

export function CategoryManager() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", newsapiCategory: "", providerType: "newsapi" })
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCats(data.data || [])
    } catch {
      setAlert({ type: "error", message: "Error al cargar categorías" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 4000)
  }

  const handleToggle = async (cat: Category) => {
    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, isActive: !cat.isActive }),
      })
      if (!res.ok) throw new Error("Error")
      setCats((prev) => prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c)))
    } catch {
      showAlert("error", "Error al actualizar categoría")
    }
  }

  const handleAdd = async () => {
    if (!form.name.trim()) {
      showAlert("error", "El nombre es requerido")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          newsapiCategory: form.newsapiCategory || null,
          providerType: form.providerType,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCats((prev) => [data.data, ...prev])
      setForm({ name: "", description: "", newsapiCategory: "", providerType: "newsapi" })
      setShowForm(false)
      showAlert("success", "Categoría creada")
    } catch (e: any) {
      showAlert("error", e.message || "Error al crear")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría?")) return
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error")
      setCats((prev) => prev.filter((c) => c.id !== id))
      showAlert("success", "Categoría eliminada")
    } catch {
      showAlert("error", "Error al eliminar")
    }
  }

  const activeCount = cats.filter((c) => c.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
          <p className="text-muted-foreground">
            {activeCount} de {cats.length} activas — Solo las activas se usan al recolectar
          </p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setForm({ name: "", description: "", newsapiCategory: "", providerType: "newsapi" }) }}>
          <Plus className="h-4 w-4 mr-2" /> Nueva Categoría
        </Button>
      </div>

      {alert && (
        <div className={cn(
          "p-3 rounded-md text-sm",
          alert.type === "success" && "bg-green-50 text-green-800 border border-green-200",
          alert.type === "error" && "bg-red-50 text-red-800 border border-red-200"
        )}>
          {alert.message}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Nueva Categoría</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded-md"><X className="h-4 w-4" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <Input placeholder="Ej: Ciberseguridad" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <Input placeholder="Noticias sobre..." value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría NewsAPI</label>
                <select value={form.newsapiCategory}
                  onChange={(e) => setForm({ ...form, newsapiCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">— Sin mapeo a NewsAPI —</option>
                  {NEWSAPI_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Si no tiene mapeo, solo usará fuentes RSS</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <select value={form.providerType}
                  onChange={(e) => setForm({ ...form, providerType: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="newsapi">NewsAPI</option>
                  <option value="rss">RSS</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
            </div>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Guardar Categoría
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : cats.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay categorías</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {cats.map((cat) => (
            <Card key={cat.id} className={cn(!cat.isActive && "opacity-50 bg-muted/20")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("p-2 rounded-md", cat.isActive ? "bg-primary/10" : "bg-muted")}>
                      <FolderOpen className={cn("h-5 w-5", cat.isActive ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {cat.newsapiCategory && (
                          <Badge variant="outline" className="text-xs">NewsAPI: {cat.newsapiCategory}</Badge>
                        )}
                        {cat.rssFeedUrl && (
                          <Badge variant="outline" className="text-xs">RSS</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">{cat.providerType}</Badge>
                        {cat.usageCount > 0 && (
                          <span className="text-xs text-muted-foreground">{cat.usageCount} usos</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button onClick={() => handleToggle(cat)}
                      className={cn(
                        "p-2 rounded-md transition-colors flex items-center gap-1",
                        cat.isActive ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"
                      )}
                      title={cat.isActive ? "Desactivar" : "Activar"}>
                      {cat.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                      title="Eliminar">
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
