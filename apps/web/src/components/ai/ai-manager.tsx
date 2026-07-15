"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { promptTemplates } from "@/data/prompt-templates"
import {
  Brain, RefreshCw, Sparkles, Copy, Check, ChevronDown, ChevronRight,
  Send, Calendar, Save, Loader2, ImageUp, X, Globe, ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

function parseAIResponse(response: string): { analysis: string; post: string; raw: string } {
  const analysisMatch = response.match(/---ANALISIS---([\s\S]*?)---POST---/)
  const postMatch = response.match(/---POST---([\s\S]*)$/)

  if (analysisMatch && postMatch) {
    return {
      analysis: analysisMatch[1].trim(),
      post: postMatch[1].trim(),
      raw: response,
    }
  }
  return { analysis: "", post: response, raw: response }
}

interface AIManagerProps {
  selectedNewsIds: number[]
  news: any[]
}

export function AIManager({ selectedNewsIds, news }: AIManagerProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(promptTemplates[0].id)
  const [showPrompt, setShowPrompt] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [parsedResult, setParsedResult] = useState<{ analysis: string; post: string; raw: string } | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: false,
    topics: false,
    "full-post": true,
    details: false,
  })
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [customText, setCustomText] = useState("")
  const [saving, setSaving] = useState(false)
  const [activeNewsIds, setActiveNewsIds] = useState<number[]>(selectedNewsIds)
  const [savedResults, setSavedResults] = useState<any[]>([])
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [recuperando, setRecuperando] = useState(false)
  const [posting, setPosting] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [profiles, setProfiles] = useState<any[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)
  const [scheduleDateTime, setScheduleDateTime] = useState("")
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/linkedin/profiles?userId=${session.user.id}`)
        .then((r) => r.json())
        .then((d) => setProfiles(d.data || []))
        .catch(() => {})
    }
  }, [session])

  useEffect(() => {
    setActiveNewsIds(selectedNewsIds)
    if (selectedNewsIds.length > 0) {
      setLoadingSaved(true)
      fetch(`/api/ai/results?newsIds=${selectedNewsIds.join(",")}`)
        .then((r) => r.json())
        .then((d) => { setSavedResults(d.data || []); setLoadingSaved(false) })
        .catch(() => setLoadingSaved(false))
    } else {
      setSavedResults([])
    }
  }, [selectedNewsIds])

  const toggleActiveNews = (id: number) => {
    setActiveNewsIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const activeNews = useMemo(() => {
    return news.filter((n: any) => activeNewsIds.includes(n.id))
  }, [news, activeNewsIds])

  const handleRecuperar = (saved: any) => {
    setRecuperando(true)
    setResult(saved.fullResponse || saved.linkedinPost || "")
    setParsedResult(parseAIResponse(saved.fullResponse || saved.linkedinPost || ""))
    setTimeout(() => setRecuperando(false), 300)
  }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setCustomImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveResult = async () => {
    if (!result || activeNewsIds.length === 0) return
    setSaving(true)
    try {
      for (const newsId of activeNewsIds) {
        await fetch("/api/ai/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newsId,
            templateId: selectedTemplateId,
            templateName: selectedTemplate.name,
            language: "es",
            linkedinPost: parsedResult?.post || result,
            fullResponse: result,
          }),
        })
      }
      setAlert({ type: "success", text: "Resultado guardado exitosamente" })
    } catch (e: any) {
      setAlert({ type: "error", text: `Error: ${e.message}` })
    } finally {
      setSaving(false)
    }
  }

  const handlePublishNow = async () => {
    if (!selectedProfileId || !result) return
    setPosting(true)
    try {
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: selectedProfileId,
            content: parsedResult?.post || result,
            title: activeNews[0]?.title || "",
            sourceUrl: activeNews[0]?.sourceUrl || "",
            userId: session?.user?.id || "",
            newsIds: activeNewsIds,
          }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAlert({ type: "success", text: "Publicado en LinkedIn exitosamente" })
    } catch (e: any) {
      setAlert({ type: "error", text: `Error al publicar: ${e.message}` })
    } finally {
      setPosting(false)
    }
  }

  const handleSchedule = async () => {
    if (!selectedProfileId || !scheduleDateTime || !result) return
    setScheduling(true)
    try {
      const res = await fetch("/api/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          type: "post",
          postData: {
            linkedinProfileId: selectedProfileId,
            title: activeNews[0]?.title || "Post generado por IA",
            content: parsedResult?.post || result,
            summary: activeNews[0]?.summary || "",
            scheduledAt: new Date(scheduleDateTime).toISOString(),
            status: "scheduled",
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAlert({ type: "success", text: "Publicacion programada exitosamente" })
    } catch (e: any) {
      setAlert({ type: "error", text: `Error: ${e.message}` })
    } finally {
      setScheduling(false)
    }
  }

  const selectedTemplate = promptTemplates.find((t) => t.id === selectedTemplateId) || promptTemplates[0]

  const sections = useMemo(() => [
    { id: "summary", label: "Resumen Ejecutivo", content: parsedResult?.analysis || "" },
    { id: "topics", label: "Temas Clave", content: parsedResult?.analysis || "" },
    { id: "full-post", label: "Post Completo", content: parsedResult?.post || "" },
    { id: "details", label: "Respuesta Completa de la IA", content: result || "" },
  ], [parsedResult, result])

  const handleProcess = async () => {
    setProcessing(true)
    setResult(null)
    setParsedResult(null)
    setCustomImage(null)

    const newsContent = activeNews.map((n: any, i: number) =>
      `--- NOTICIA ${i + 1} ---\nTitulo: ${n.title}\nFuente: ${n.sourceName}\nFecha: ${n.publishedAt || ""}\nResumen: ${n.summary || ""}\nContenido: ${n.content || n.summary || "No disponible"}\nURL (incluye esta URL en el post): ${n.sourceUrl || ""}`
    ).join("\n\n")

    const fullPrompt = `${selectedTemplate.systemPrompt}\n\n### NOTICIAS A PROCESAR:\n${newsContent || customText || "(No hay contenido adicional)"}`

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "linkedin-post",
          newsItems: activeNews.map((n: any) => ({
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
      const rawResponse = data.data || "Sin respuesta"
      setResult(rawResponse)
      const parsed = parseAIResponse(rawResponse)
      setParsedResult(parsed)

      for (const newsId of activeNewsIds) {
        await fetch("/api/ai/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newsId,
            templateId: selectedTemplateId,
            templateName: selectedTemplate.name,
            language: "es",
            linkedinPost: parsed?.post || rawResponse,
            fullResponse: rawResponse,
          }),
        })
      }
    } catch (e: any) {
      const errorMsg = `Error: ${e.message}`
      setResult(errorMsg)
      setParsedResult(null)
    } finally {
      setProcessing(false)
    }
  }

  const handleCopyPost = () => {
    const text = parsedResult?.post || result || ""
    if (text) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const domainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "")
    } catch {
      return url
    }
  }

  const getInitials = () => {
    const profile = profiles.find((p: any) => p.id === selectedProfileId)
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    }
    return "U"
  }

  const selectedProfile = profiles.find((p: any) => p.id === selectedProfileId)

  return (
    <div className="space-y-6">
      {alert && (
        <div className={cn(
          "p-4 rounded-lg text-sm border",
          alert.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
        )}>
          <div className="flex items-center gap-2">
            {alert.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            <span>{alert.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Noticias seleccionadas ({selectedNewsIds.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNewsIds.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No hay noticias seleccionadas</p>
                  <p className="text-xs mt-1">Ve a Noticias y selecciona las que quieras procesar</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {news.filter((n: any) => selectedNewsIds.includes(n.id)).map((n: any) => {
                    const checked = activeNewsIds.includes(n.id)
                    const saved = savedResults.find((r: any) => r.newsId === n.id)
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors",
                          checked ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted"
                        )}
                        onClick={() => toggleActiveNews(n.id)}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors",
                          checked ? "bg-primary border-primary" : "border-muted-foreground/30"
                        )}>
                          {checked && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{n.sourceName}</p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {n.sourceUrl && (
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(n.sourceUrl, "_blank") }}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Abrir noticia original"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          )}
                          {saved && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRecuperar(saved) }}
                              className="text-xs text-primary hover:text-primary/80 font-medium px-1.5 py-0.5 rounded hover:bg-primary/5"
                              title="Recuperar analisis guardado"
                            >
                              Cargar
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-3">
                <label className="block text-xs text-muted-foreground mb-1">Instrucciones adicionales</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Instrucciones extra para la IA (opcional)..."
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={2}
                />
              </div>

              <Button
                onClick={handleProcess}
                disabled={processing || (activeNewsIds.length === 0 && !customText.trim())}
                className="mt-3 w-full"
              >
                {processing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {processing ? "Procesando..." : "Procesar con IA"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Plantillas de estilo</CardTitle>
                <button
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {showPrompt ? "Ocultar prompt" : "Ver prompt"}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {promptTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all",
                    selectedTemplateId === t.id
                      ? "border-primary/30 bg-primary/5"
                      : "hover:bg-muted border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.name}</span>
                    {selectedTemplateId === t.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  <Badge variant="secondary" className="mt-1.5 text-[10px]">{t.category}</Badge>
                </button>
              ))}

              {showPrompt && (
                <div className="mt-2 p-3 bg-muted rounded-lg border max-h-48 overflow-y-auto">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Prompt completo:</p>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{selectedTemplate.systemPrompt}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {processing ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <RefreshCw className="h-10 w-10 animate-spin mb-4 text-primary" />
                <p className="text-sm font-medium">Procesando con DeepSeek...</p>
                <p className="text-xs mt-1">Esto puede tomar unos segundos</p>
              </CardContent>
            </Card>
          ) : result ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Vista previa LinkedIn</CardTitle>
                        <button
                          onClick={handleCopyPost}
                          className="p-1.5 rounded-md hover:bg-muted transition-colors"
                          title="Copiar post"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-w-md mx-auto">
                        <div className="p-4 pb-3">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {getInitials()}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">
                                {selectedProfile
                                  ? `${selectedProfile.firstName} ${selectedProfile.lastName}`
                                  : "Nombre de Usuario"}
                                <span className="text-[#0A66C2] text-xs ml-1">&#9679; 1º</span>
                              </p>
                              <p className="text-xs text-gray-500">Creador de Contenido</p>
                              <p className="text-[11px] text-gray-400">1 h &#183; <Globe className="h-2.5 w-2.5 inline" /></p>
                            </div>
                          </div>

                          <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed mb-3">
                            {parsedResult?.post || result}
                          </div>

                          {activeNews.length > 0 && activeNews[0]?.sourceUrl && (
                            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-3">
                              <div className="bg-gray-100 h-2" />
                              <div className="p-3">
                                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{activeNews[0].title}</p>
                                <p className="text-xs text-gray-500 mt-1">{domainFromUrl(activeNews[0].sourceUrl)}</p>
                              </div>
                            </div>
                          )}

                          {customImage && (
                            <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-200">
                              <img src={customImage} alt="Uploaded" className="w-full max-h-64 object-cover" />
                              <button
                                onClick={() => setCustomImage(null)}
                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 px-4 py-2.5 border-t text-xs text-gray-400">
                          <span className="flex items-center gap-1">👍 0</span>
                          <span className="flex items-center gap-1">💬 0</span>
                          <span className="flex items-center gap-1">🔄 0</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ImageUp className="h-3.5 w-3.5" />
                          {customImage ? "Cambiar imagen" : "Agregar imagen"}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <Button onClick={handleSaveResult} disabled={saving} variant="outline" size="sm" className="h-8 text-xs">
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                          Guardar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">Publicar en LinkedIn</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <select
                        value={selectedProfileId || ""}
                        onChange={(e) => setSelectedProfileId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Seleccionar perfil...</option>
                        {profiles.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.firstName} {p.lastName}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button
                          onClick={handlePublishNow}
                          disabled={!selectedProfileId || posting}
                          className="flex-1 h-9 text-xs"
                        >
                          {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                          Publicar ahora
                        </Button>
                        <Button
                          onClick={handleSchedule}
                          disabled={!selectedProfileId || !scheduleDateTime || scheduling}
                          variant="outline"
                          className="flex-1 h-9 text-xs"
                        >
                          {scheduling ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Calendar className="h-3.5 w-3.5 mr-1.5" />}
                          Programar
                        </Button>
                      </div>
                      <Input
                        type="datetime-local"
                        value={scheduleDateTime}
                        onChange={(e) => setScheduleDateTime(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  {sections.map((section) => (
                    <div key={section.id} className="border rounded-lg overflow-hidden bg-card">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                      >
                        <span>{section.label}</span>
                        {expandedSections[section.id] ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      {expandedSections[section.id] && (
                        <div className="p-3 border-t">
                          {section.id === "full-post" ? (
                            <textarea
                              value={parsedResult?.post || result || ""}
                              onChange={(e) => {
                                if (parsedResult) {
                                  setParsedResult({ ...parsedResult, post: e.target.value })
                                } else {
                                  setResult(e.target.value)
                                }
                              }}
                              className="w-full min-h-[200px] p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                              placeholder="El post aparecera aqui..."
                            />
                          ) : (
                            <div className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed max-h-96 overflow-y-auto">
                              {section.content || "No disponible"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Brain className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="text-base font-medium">Selecciona noticias y presiona "Procesar con IA"</p>
              <p className="text-sm mt-1">El resultado aparecera con vista previa estilo LinkedIn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
