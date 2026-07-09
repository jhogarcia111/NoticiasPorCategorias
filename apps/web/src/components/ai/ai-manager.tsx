"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { promptTemplates } from "@/data/prompt-templates"
import {
  Brain, RefreshCw, Sparkles, Copy, Check, ChevronDown, ChevronUp, Eye, EyeOff,
  Send, Calendar, Save, Loader2, ImageUp, X,
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
    summary: true,
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

  // Sync active news and check for saved results
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
      setAlert({ type: "success", text: "✅ Resultado guardado exitosamente" })
    } catch (e: any) {
      setAlert({ type: "error", text: `❌ Error: ${e.message}` })
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
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAlert({ type: "success", text: "✅ Publicado en LinkedIn exitosamente" })
    } catch (e: any) {
      setAlert({ type: "error", text: `❌ Error al publicar: ${e.message}` })
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
      setAlert({ type: "success", text: "✅ Publicación programada exitosamente" })
    } catch (e: any) {
      setAlert({ type: "error", text: `❌ Error: ${e.message}` })
    } finally {
      setScheduling(false)
    }
  }

  const selectedTemplate = promptTemplates.find((t) => t.id === selectedTemplateId) || promptTemplates[0]

  const sections = useMemo(() => [
    { id: "summary", label: "📋 Resumen Ejecutivo", content: parsedResult?.analysis || "" },
    { id: "topics", label: "🎯 Temas Clave", content: parsedResult?.analysis || "" },
    { id: "full-post", label: "📝 Post Completo", content: parsedResult?.post || "" },
    { id: "details", label: "📊 Otros Detalles", content: result || "" },
  ], [parsedResult, result])

  const handleProcess = async () => {
    setProcessing(true)
    setResult(null)
    setParsedResult(null)
    setCustomImage(null)

    const newsContent = activeNews.map((n: any, i: number) =>
      `--- NOTICIA ${i + 1} ---\nTítulo: ${n.title}\nFuente: ${n.sourceName}\nFecha: ${n.publishedAt || ""}\nResumen: ${n.summary || ""}\nContenido: ${n.content || n.summary || "No disponible"}\nURL: ${n.sourceUrl || ""}`
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
      setParsedResult(parseAIResponse(rawResponse))
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
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  const getInitials = () => {
    const profile = profiles.find((p: any) => p.id === selectedProfileId)
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    }
    return "👤"
  }

  const selectedProfile = profiles.find((p: any) => p.id === selectedProfileId)

  return (
    <div className="space-y-6">
      {alert && (
        <div className={cn(
          "p-4 rounded-md text-sm border",
          alert.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
        )}>
          {alert.text}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🤖 Procesar con IA</h2>
          <p className="text-muted-foreground text-sm">Selecciona noticias, elige un estilo y genera contenido optimizado para LinkedIn</p>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-muted-foreground">DeepSeek AI</span>
        </div>
      </div>

      {/* ═══ Top Row: News + Templates ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">
        {/* Left: Selected news + custom text + process button */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📰 Noticias ({selectedNewsIds.length}) — marca las que procesar</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNewsIds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No hay noticias seleccionadas</p>
                <p className="text-xs mt-1">Ve a la pestaña Noticias y selecciona las que quieras procesar</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {news.filter((n: any) => selectedNewsIds.includes(n.id)).map((n: any) => {
                  const checked = activeNewsIds.includes(n.id)
                  const saved = savedResults.find((r: any) => r.newsId === n.id)
                  return (
                    <div key={n.id}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors",
                        checked ? "bg-primary/10 ring-1 ring-primary/20" : "bg-muted/30 hover:bg-muted/50"
                      )}
                      onClick={() => toggleActiveNews(n.id)}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors",
                        checked ? "bg-primary border-primary" : "border-gray-300"
                      )}>
                        {checked && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.sourceName} · {n.language === "en" ? "🇺🇸" : "🇨🇴"}</p>
                      </div>
                      {saved && (
                        <button onClick={(e) => { e.stopPropagation(); handleRecuperar(saved) }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex-shrink-0 px-1.5 py-0.5 rounded hover:bg-blue-50"
                          title="Recuperar análisis guardado">
                          📂 Recuperar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-3">
              <label className="block text-xs text-muted-foreground mb-1">✏️ Instrucciones adicionales</label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Instrucciones extra para la IA (opcional)..."
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
              {processing ? "Procesando..." : "⚡ Procesar con IA"}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Template selector grid */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">🎭 Plantillas de estilo</CardTitle>
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {showPrompt ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showPrompt ? "Ocultar prompt" : "📄 Ver prompt"}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {promptTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedTemplateId === t.id
                      ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                      : "hover:bg-muted border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.name}</span>
                    {selectedTemplateId === t.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px]">{t.category}</Badge>
                </button>
              ))}
            </div>

            {showPrompt && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                <p className="text-xs font-medium text-gray-700 mb-2">📄 Prompt completo que se enviará a DeepSeek:</p>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans">{selectedTemplate.systemPrompt}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══ Bottom Row: Preview + Analysis ═══ */}
      {(result || processing) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: LinkedIn Post Preview + actions */}
          <div className="space-y-4">
            {processing ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 animate-spin mb-3" />
                  <p className="text-sm">Procesando con DeepSeek...</p>
                  <p className="text-xs mt-1">Esto puede tomar unos segundos</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* LinkedIn Preview Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">🔗 Vista previa LinkedIn</CardTitle>
                      <button
                        onClick={handleCopyPost}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        title="Copiar post"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white border rounded-lg p-4 max-w-md mx-auto shadow-sm">
                      {/* Profile header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {selectedProfile
                              ? `${selectedProfile.firstName} ${selectedProfile.lastName}`
                              : "Nombre de Usuario"} · 1º
                          </p>
                          <p className="text-xs text-gray-500">Creador de Contenido · 1 h</p>
                        </div>
                      </div>

                      {/* Post content */}
                      <div className="text-sm text-gray-900 whitespace-pre-wrap mb-3 leading-relaxed">
                        {parsedResult?.post || result}
                      </div>

                      {/* News link card */}
                      {activeNews.length > 0 && activeNews[0]?.sourceUrl && (
                        <div className="bg-gray-100 rounded-lg p-3 mb-3 border border-gray-200">
                          <p className="text-sm font-medium text-gray-900 truncate">{activeNews[0].title}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">🔗 {domainFromUrl(activeNews[0].sourceUrl)}</p>
                        </div>
                      )}

                      {/* Uploaded image */}
                      {customImage && (
                        <div className="relative mb-3 rounded-lg overflow-hidden">
                          <img src={customImage} alt="Uploaded" className="w-full max-h-64 object-cover" />
                          <button
                            onClick={() => setCustomImage(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {/* Reactions mock */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 border-t pt-2 mt-2">
                        <span>👍 0</span>
                        <span>💬 0</span>
                        <span>🔄 0</span>
                      </div>
                    </div>

                    {/* Image upload */}
                    <div className="mt-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                        <ImageUp className="h-4 w-4" />
                        🖼️ {customImage ? "Cambiar imagen" : "Agregar imagen al post"}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>

                    {/* Save button */}
                    <Button onClick={handleSaveResult} disabled={saving} className="w-full mt-3" variant="outline">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      💾 Guardar resultado
                    </Button>
                  </CardContent>
                </Card>

                {/* Publish Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">🚀 Publicar en LinkedIn</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <select
                      value={selectedProfileId || ""}
                      onChange={(e) => setSelectedProfileId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">Seleccionar perfil LinkedIn...</option>
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
                        className="flex-1"
                      >
                        {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Publicar ahora
                      </Button>
                      <Button
                        onClick={handleSchedule}
                        disabled={!selectedProfileId || !scheduleDateTime || scheduling}
                        variant="outline"
                        className="flex-1"
                      >
                        {scheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                        Programar
                      </Button>
                    </div>
                    <Input
                      type="datetime-local"
                      value={scheduleDateTime}
                      onChange={(e) => setScheduleDateTime(e.target.value)}
                      className="text-sm"
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right: Accordion sections */}
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} className="border rounded-lg overflow-hidden bg-card">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  <span>{section.label}</span>
                  {expandedSections[section.id] ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                        className="w-full min-h-[150px] p-2 border rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="El post aparecerá aquí..."
                      />
                    ) : (
                      <div className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {section.content || "No disponible"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !processing && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Brain className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">🤖 Selecciona noticias y presiona "Procesar con IA"</p>
          <p className="text-sm mt-1">El resultado aparecerá con vista previa estilo LinkedIn y análisis detallado</p>
        </div>
      )}
    </div>
  )
}
