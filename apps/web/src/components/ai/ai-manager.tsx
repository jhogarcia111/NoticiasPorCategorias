"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { promptTemplates } from "@/data/prompt-templates"
import {
  Brain, RefreshCw, FileText, Hash, Sparkles, Copy, Check, ChevronDown, ChevronUp, Eye, EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AIManagerProps {
  selectedNewsIds: number[]
  news: any[]
}

export function AIManager({ selectedNewsIds, news }: AIManagerProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(promptTemplates[0].id)
  const [showPrompt, setShowPrompt] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [customText, setCustomText] = useState("")

  const selectedNews = useMemo(() => {
    return news.filter((n: any) => selectedNewsIds.includes(n.id))
  }, [news, selectedNewsIds])

  const selectedTemplate = promptTemplates.find((t) => t.id === selectedTemplateId) || promptTemplates[0]

  const handleProcess = async () => {
    setProcessing(true)
    setResult(null)
    // Build the full prompt: system prompt + selected news content
    const newsContent = selectedNews.map((n: any, i: number) =>
      `--- NOTICIA ${i + 1} ---\nTítulo: ${n.title}\nFuente: ${n.sourceName}\nFecha: ${n.publishedAt || ""}\nResumen: ${n.summary || ""}\nContenido: ${n.content || n.summary || "No disponible"}\nURL: ${n.sourceUrl || ""}`
    ).join("\n\n")

    const fullPrompt = `${selectedTemplate.systemPrompt}\n\n### NOTICIAS A PROCESAR:\n${newsContent || customText || "(No hay contenido adicional)"}`

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "linkedin-post",
          newsItems: selectedNews.map((n: any) => ({
            id: n.id,
            title: n.title,
            summary: n.summary || n.content,
            source_url: n.sourceUrl,
          })),
          options: {
            style: "custom",
            systemPrompt: selectedTemplate.systemPrompt,
            customPrompt: customText || undefined,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al procesar")
      setResult(data.data || "Sin respuesta")
    } catch (e: any) {
      setResult(`Error: ${e.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, typeof promptTemplates> = {}
    promptTemplates.forEach((t) => {
      if (!grouped[t.category]) grouped[t.category] = []
      grouped[t.category].push(t)
    })
    return grouped
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Procesar con IA</h2>
          <p className="text-muted-foreground">Selecciona un estilo y genera contenido con DeepSeek</p>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-muted-foreground">DeepSeek AI</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: news + template selector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected news */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Noticias seleccionadas ({selectedNewsIds.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No hay noticias seleccionadas</p>
                  <p className="text-xs mt-1">Ve a la pestaña Noticias y selecciona las que quieras procesar</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedNews.map((n: any) => (
                    <div key={n.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded-md">
                      <span className="text-xs font-mono text-muted-foreground mt-0.5">#{n.id}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.sourceName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <label className="block text-xs text-muted-foreground mb-1">O texto personalizado adicional</label>
                <textarea value={customText} onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Instrucciones extra para la IA (opcional)..."
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={2} />
              </div>
              <Button onClick={handleProcess} disabled={processing || (selectedNews.length === 0 && !customText.trim())}
                className="mt-3 w-full">
                {processing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {processing ? "Procesando..." : "Procesar con IA"}
              </Button>
            </CardContent>
          </Card>

          {/* Template selector */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Plantillas de estilo</CardTitle>
                <button onClick={() => setShowPrompt(!showPrompt)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  {showPrompt ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showPrompt ? "Ocultar prompt" : "Ver prompt completo"}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{category}</p>
                  <div className="space-y-2">
                    {templates.map((t) => (
                      <button key={t.id} onClick={() => setSelectedTemplateId(t.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all",
                          selectedTemplateId === t.id
                            ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                            : "hover:bg-muted border-transparent"
                        )}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t.name}</span>
                          {selectedTemplateId === t.id && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {showPrompt && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-700 mb-2">Prompt completo que se enviará a DeepSeek:</p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans">{selectedTemplate.systemPrompt}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: result */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Resultado</CardTitle>
                {result && !result.startsWith("Error") && (
                  <button onClick={handleCopyResult}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Copiar">
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {processing ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 animate-spin mb-3" />
                  <p className="text-sm">Procesando con DeepSeek...</p>
                  <p className="text-xs mt-1">Esto puede tomar unos segundos</p>
                </div>
              ) : result ? (
                <div className={cn(
                  "p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed",
                  result.startsWith("Error") ? "bg-red-50 text-red-800" : "bg-gray-50 text-gray-800"
                )}>
                  {result}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">Selecciona noticias y un estilo</p>
                  <p className="text-xs mt-1">Luego presiona "Procesar con IA"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
