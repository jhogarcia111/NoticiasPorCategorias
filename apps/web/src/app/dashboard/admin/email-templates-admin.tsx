"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Eye, EyeOff, Mail, Loader2, Save, X, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailTemplate {
  id: number
  key: string
  name: string
  subject: string
  htmlContent: string
  isActive: boolean
}

export function EmailTemplatesAdmin() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EmailTemplate | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/email-templates")
      const json = await res.json()
      if (json.data) setTemplates(json.data)
    } catch (e) {
      console.error("Error fetching templates", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const toggleActive = async (tpl: EmailTemplate) => {
    try {
      await fetch(`/api/admin/email-templates/${tpl.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !tpl.isActive }),
      })
      setTemplates(prev =>
        prev.map(t => (t.id === tpl.id ? { ...t, isActive: !t.isActive } : t)),
      )
    } catch (e) {
      console.error("Error toggling template", e)
    }
  }

  const saveTemplate = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await fetch(`/api/admin/email-templates/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          subject: editing.subject,
          htmlContent: editing.htmlContent,
        }),
      })
      setTemplates(prev =>
        prev.map(t => (t.id === editing.id ? { ...editing } : t)),
      )
      setEditing(null)
    } catch (e) {
      console.error("Error saving template", e)
    } finally {
      setSaving(false)
    }
  }

  const seedTemplates = async () => {
    try {
      await fetch("/api/admin/seed-templates", { method: "POST" })
      await fetchTemplates()
    } catch (e) {
      console.error("Error seeding templates", e)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Plantillas de Correo</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona las plantillas de correo electrónico utilizadas por la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          {templates.length === 0 && (
            <Button size="sm" onClick={seedTemplates}>
              <RefreshCw className="h-4 w-4 mr-1" /> Crear plantillas por defecto
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchTemplates}>
            <RefreshCw className="h-4 w-4 mr-1" /> Recargar
          </Button>
        </div>
      </div>

      {editing ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Editar: {editing.name}</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={saveTemplate} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asunto</label>
              <input
                type="text"
                value={editing.subject}
                onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido HTML</label>
              <textarea
                value={editing.htmlContent}
                onChange={(e) => setEditing({ ...editing, htmlContent: e.target.value })}
                rows={12}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className={cn(!tpl.isActive && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "p-2 rounded-lg mt-0.5",
                      tpl.isActive ? "bg-green-50" : "bg-gray-100",
                    )}>
                      <Mail className={cn(
                        "h-5 w-5",
                        tpl.isActive ? "text-green-600" : "text-gray-400",
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{tpl.name}</h4>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          tpl.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500",
                        )}>
                          {tpl.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">{tpl.key}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        Asunto: {tpl.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(tpl)}
                      title={tpl.isActive ? "Desactivar" : "Activar"}
                    >
                      {tpl.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing({ ...tpl })}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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
