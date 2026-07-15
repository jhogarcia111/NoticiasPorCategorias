"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { promptTemplates } from "@/data/prompt-templates"
import {
  Brain, RefreshCw, Sparkles, Copy, Check, ChevronDown, ChevronRight,
  Send, Calendar, Save, Loader2, ImageUp, X, Globe, ExternalLink, Images, FolderOpen, Search,
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
  const alertRef = useRef<HTMLDivElement>(null)
  const [generatingImages, setGeneratingImages] = useState(false)
  const [imageOptions, setImageOptions] = useState<string[]>([])
  const [imagePromptsUsed, setImagePromptsUsed] = useState<string[]>([])
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [showGallery, setShowGallery] = useState(false)
  const [galleryImages, setGalleryImages] = useState<any[]>([])
  const [loadingGallery, setLoadingGallery] = useState(false)
  const [showSavedAnalyses, setShowSavedAnalyses] = useState(false)
  const [savedAnalysesList, setSavedAnalysesList] = useState<any[]>([])
  const [loadingSavedAnalyses, setLoadingSavedAnalyses] = useState(false)
  const [headlines, setHeadlines] = useState<string[]>([])
  const [selectedHeadlineIdx, setSelectedHeadlineIdx] = useState<number | null>(null)
  const [selectedImageIdx, setSelectedImageIdx] = useState<number | null>(null)
  const [imageLoadStates, setImageLoadStates] = useState<Record<number, "loading" | "loaded" | "error">>({})
  const [generatingFinalImage, setGeneratingFinalImage] = useState(false)
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null)
  const [finalImagePromptUsed, setFinalImagePromptUsed] = useState<string>("")
  const [finalHeadlineUsed, setFinalHeadlineUsed] = useState<string>("")

  // Assembler state
  const [showAssembler, setShowAssembler] = useState(false)
  const [assemblerImage, setAssemblerImage] = useState<string | null>(null)
  const [assemblerSource, setAssemblerSource] = useState<"generated" | "gallery" | "upload">("generated")
  const [assembling, setAssembling] = useState(false)
  const [customHeadline, setCustomHeadline] = useState("")

  useEffect(() => {
    if (alert) {
      alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      const timer = setTimeout(() => setAlert(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [alert])

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
    if (showGallery) {
      setLoadingGallery(true)
      fetch("/api/images/gallery")
        .then((r) => r.json())
        .then((d) => { setGalleryImages(d.data || []); setLoadingGallery(false) })
        .catch(() => setLoadingGallery(false))
    }
  }, [showGallery])

  useEffect(() => {
    if (showSavedAnalyses) {
      setLoadingSavedAnalyses(true)
      fetch("/api/ai/saved-results")
        .then((r) => r.json())
        .then((d) => { setSavedAnalysesList(d.data || []); setLoadingSavedAnalyses(false) })
        .catch(() => setLoadingSavedAnalyses(false))
    }
  }, [showSavedAnalyses])

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

  const handleGenerateImages = async () => {
    if (activeNews.length === 0) return
    setGeneratingImages(true)
    setImageOptions([])
    setImagePromptsUsed([])
    setCustomHeadline("")
    setImageLoadStates({})
    setFinalImageUrl(null)
    setFinalImagePromptUsed("")
    setFinalHeadlineUsed("")
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "news-image-data",
          title: activeNews[0]?.title || "",
          summary: activeNews[0]?.summary || activeNews[0]?.content || "",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error generando prompts")
      const prompts: string[] = data.data
      if (!prompts || prompts.length === 0) {
        throw new Error("No se generaron prompts")
      }

      setImagePromptsUsed(prompts)
      const POLLINATIONS_URL = "https://image.pollinations.ai/prompt"
      const urls = prompts.map((p, idx) =>
        `${POLLINATIONS_URL}/${encodeURIComponent(p)}?nocache=${Date.now()}&seed=${idx + 1}`
      )
      setImageOptions(urls)
      setImageLoadStates({})

      // generate headlines in parallel
      fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "headlines",
          title: activeNews[0]?.title || "",
          summary: activeNews[0]?.summary || activeNews[0]?.content || "",
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.data) setHeadlines(d.data)
        })
        .catch(() => {})

      // load images sequentially
      const loadNext = (idx: number) => {
        if (idx >= urls.length) return
        setImageLoadStates((prev) => ({ ...prev, [idx]: "loading" }))
        const img = new Image()
        img.onload = () => {
          setImageLoadStates((prev) => ({ ...prev, [idx]: "loaded" }))
          setTimeout(() => loadNext(idx + 1), 1200)
        }
        img.onerror = () => {
          setImageLoadStates((prev) => ({ ...prev, [idx]: "error" }))
          setTimeout(() => loadNext(idx + 1), 800)
        }
        img.src = urls[idx]
      }
      loadNext(0)

      // save generated images to gallery
      for (let i = 0; i < urls.length; i++) {
        fetch("/api/images/save-generated", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: urls[i],
            promptUsed: prompts[i],
            newsTitle: activeNews[0]?.title || "",
            newsId: activeNews[0]?.id || null,
          }),
        }).catch(() => {})
      }
    } catch (e: any) {
      setAlert({ type: "error", text: `Error al generar imagen: ${e.message}` })
    } finally {
      setGeneratingImages(false)
    }
  }

  const handleRetryImage = (idx: number) => {
    if (!imageOptions[idx]) return
    const url = imageOptions[idx].replace(/&seed=\d+/, `&seed=${Date.now()}`)
    const newUrls = [...imageOptions]
    newUrls[idx] = url
    setImageOptions(newUrls)
    setImageLoadStates((prev) => ({ ...prev, [idx]: "loading" }))
    const img = new Image()
    img.onload = () => setImageLoadStates((prev) => ({ ...prev, [idx]: "loaded" }))
    img.onerror = () => setImageLoadStates((prev) => ({ ...prev, [idx]: "error" }))
    img.src = url
  }

  const overlayTextOnImage = (imgSrc: string, headline: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = 1200
        canvas.height = 627
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, 1200, 627)

        const bH = 82
        const bY = 545
        const gradient = ctx.createLinearGradient(0, bY, 0, 627)
        gradient.addColorStop(0, "rgba(0,0,0,0.85)")
        ctx.fillStyle = gradient
        ctx.fillRect(0, bY, 1200, bH)

        const badgeW = 148
        ctx.fillStyle = "#CC0000"
        ctx.beginPath()
        ctx.roundRect(12, bY + 6, badgeW, bH - 12, 4)
        ctx.fill()

        ctx.fillStyle = "white"
        ctx.font = "bold 28px Arial, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("BREAKING NEWS", 12 + badgeW / 2, bY + bH / 2)

        const textX = 175
        const maxW = 1000
        ctx.fillStyle = "white"
        ctx.font = "bold 24px Arial, sans-serif"
        ctx.textAlign = "left"
        ctx.textBaseline = "top"

        const words = headline.split(" ")
        let line = ""
        let lineY = bY + 12
        const lineH = 32
        for (const word of words) {
          const test = line ? line + " " + word : word
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, textX, lineY)
            line = word
            lineY += lineH
          } else {
            line = test
          }
        }
        if (line) ctx.fillText(line, textX, lineY)

        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(new Error("Failed to encode image"))
            reader.readAsDataURL(blob)
          } else {
            reject(new Error("Failed to create image"))
          }
        }, "image/jpeg", 0.92)
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imgSrc
    })
  }

  const compressImageFile = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const MAX_DIM = 1920
        let { width, height } = img
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height / width) * MAX_DIM)
            width = MAX_DIM
          } else {
            width = Math.round((width / height) * MAX_DIM)
            height = MAX_DIM
          }
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Compression failed"))
        }, "image/jpeg", 0.8)
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleAssembleImage = async () => {
    if (!assemblerImage || (selectedHeadlineIdx === null && !customHeadline.trim())) return
    setAssembling(true)
    try {
      const headline = selectedHeadlineIdx !== null ? headlines[selectedHeadlineIdx] : customHeadline.trim()
      if (!headline) throw new Error("Selecciona o escribe un titular")
      const finalBlobUrl = await overlayTextOnImage(assemblerImage, headline)
      setFinalHeadlineUsed(headline)
      setFinalImageUrl(finalBlobUrl)
      setCustomImage(finalBlobUrl)
      setShowAssembler(false)
      setAlert({ type: "success", text: "Imagen armada exitosamente" })
    } catch (e: any) {
      setAlert({ type: "error", text: `Error al armar imagen: ${e.message}` })
    } finally {
      setAssembling(false)
    }
  }

  const handleUploadWithCompression = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImageFile(file)
      const url = URL.createObjectURL(compressed)
      setCustomImage(url)
      setAssemblerImage(url)
      setShowAssembler(true)
    } catch (err: any) {
      setAlert({ type: "error", text: `Error al comprimir imagen: ${err.message}` })
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
            imageUrl: customImage || undefined,
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
    setImageOptions([])
    setImagePromptsUsed([])

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
        <div ref={alertRef} className={cn(
          "p-4 rounded-lg text-sm border sticky top-0 z-10",
          alert.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
        )}>
          <div className="flex items-center gap-2">
            {alert.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            <span className="flex-1">{alert.text}</span>
            <button onClick={() => setAlert(null)} className="text-current opacity-60 hover:opacity-100">&times;</button>
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
          <div className="flex gap-2">
            <Button
              variant={showSavedAnalyses ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSavedAnalyses(!showSavedAnalyses)}
              className="text-xs h-8"
            >
              <FolderOpen className="h-3.5 w-3.5 mr-1" />
              Análisis guardados
            </Button>
          </div>

          {showSavedAnalyses && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  Análisis guardados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSavedAnalyses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : savedAnalysesList.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay análisis guardados</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {savedAnalysesList.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setResult(item.fullResponse || item.linkedinPost || "")
                          setParsedResult(parseAIResponse(item.fullResponse || item.linkedinPost || ""))
                          setShowSavedAnalyses(false)
                          setAlert({ type: "success", text: "Análisis cargado exitosamente" })
                        }}
                      >
                        <p className="text-sm font-medium truncate">{item.newsTitle || "Sin título"}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{item.newsSummary?.slice(0, 120)}...</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="secondary" className="text-[10px]">{item.templateName || "General"}</Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

                          {/* Final image ready */}
                          {finalImageUrl && (
                            <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-200">
                              <img src={finalImageUrl} alt="Imagen final del post" className="w-full max-h-72 object-cover" />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
                                <span className="text-[10px] text-white font-semibold bg-red-600 px-1.5 py-0.5 rounded mr-1.5">BREAKING NEWS</span>
                                <span className="text-xs text-white">{finalHeadlineUsed}</span>
                              </div>
                              <button
                                onClick={() => { setFinalImageUrl(null); setCustomImage(null) }}
                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          {/* Armar foto: assembler panel */}
                          {showAssembler && !finalImageUrl && (
                            <div className="mb-3 space-y-3 p-3 border rounded-lg bg-gray-50">
                              <p className="text-xs font-semibold flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                Armar foto
                              </p>

                              {/* Image source */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Selecciona la imagen base:</p>
                                <div className="flex gap-1.5 flex-wrap">
                                  {imageOptions.map((url, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setAssemblerImage(url)}
                                      className={cn(
                                        "w-16 h-10 rounded overflow-hidden border-2 transition-all flex-shrink-0",
                                        assemblerImage === url ? "border-primary ring-1 ring-primary/30" : "border-transparent hover:border-primary/50"
                                      )}
                                    >
                                      {imageLoadStates[i] === "loaded" ? (
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                          {imageLoadStates[i] === "loading" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => setShowGallery(true)}
                                    className={cn(
                                      "w-16 h-10 rounded border-2 flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-all flex-shrink-0",
                                      assemblerSource === "gallery" ? "border-primary" : "border-dashed"
                                    )}
                                    title="De la galería"
                                  >
                                    <Images className="h-4 w-4" />
                                  </button>
                                  <label className={cn(
                                    "w-16 h-10 rounded border-2 border-dashed flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-all flex-shrink-0 cursor-pointer",
                                    assemblerSource === "upload" ? "border-primary" : ""
                                  )}>
                                    <ImageUp className="h-4 w-4" />
                                    <input type="file" accept="image/*" onChange={handleUploadWithCompression} className="hidden" />
                                  </label>
                                </div>
                              </div>

                              {/* Preview with CSS overlay */}
                              {assemblerImage && (
                                <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-muted">
                                  <img src={assemblerImage} alt="Vista previa" className="w-full h-full object-cover" />
                                  <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-t from-black/75 to-transparent flex items-end p-2">
                                    <span className="text-[10px] text-white font-bold bg-red-600 px-1.5 py-0.5 rounded mr-1.5">BREAKING NEWS</span>
                                    <span className="text-[11px] text-white font-bold truncate">
                                      {selectedHeadlineIdx !== null ? headlines[selectedHeadlineIdx] : customHeadline || "Selecciona un titular"}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Headline selection */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Titular para BREAKING NEWS:</p>
                                <div className="space-y-1 mb-1.5">
                                  {headlines.map((h, i) => (
                                    <button
                                      key={i}
                                      onClick={() => { setSelectedHeadlineIdx(i); setCustomHeadline("") }}
                                      className={cn(
                                        "w-full text-left p-1.5 rounded border text-[11px] transition-all",
                                        selectedHeadlineIdx === i && !customHeadline
                                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                          : "border-border hover:bg-muted"
                                      )}
                                    >
                                      <span className="font-semibold text-red-600 mr-1">BREAKING:</span>
                                      {h}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  value={customHeadline}
                                  onChange={(e) => { setCustomHeadline(e.target.value); setSelectedHeadlineIdx(null) }}
                                  placeholder="O escribe tu propio titular..."
                                  className="w-full px-2 py-1.5 border border-input bg-white rounded text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </div>

                              <Button
                                onClick={handleAssembleImage}
                                disabled={!assemblerImage || (selectedHeadlineIdx === null && !customHeadline.trim()) || assembling}
                                size="sm"
                                className="w-full h-8 text-xs"
                              >
                                {assembling ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                                {assembling ? "Armando..." : "Armar foto"}
                              </Button>
                            </div>
                          )}

                          {customImage && !finalImageUrl && (
                            <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-200">
                              <img src={customImage} alt="Imagen del post" className="w-full max-h-64 object-cover" />
                              <button
                                onClick={() => { setCustomImage(null); setFinalImageUrl(null) }}
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            onClick={handleGenerateImages}
                            disabled={generatingImages || activeNews.length === 0}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                          >
                            {generatingImages ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5 mr-1" />
                            )}
                            {generatingImages ? "Generando..." : "Generar imagen IA"}
                          </Button>
                          {(headlines.length > 0 || imageOptions.length > 0 || customImage) && (
                            <Button
                              onClick={() => {
                                if (customImage && !assemblerImage) setAssemblerImage(customImage)
                                setShowAssembler(!showAssembler)
                              }}
                              variant={showAssembler ? "default" : "outline"}
                              size="sm"
                              className="h-8 text-xs"
                            >
                              <ImageUp className="h-3.5 w-3.5 mr-1" />
                              Armar foto
                            </Button>
                          )}
                          <Button
                            onClick={() => setShowGallery(true)}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                          >
                            <Images className="h-3.5 w-3.5 mr-1" />
                            Galería
                          </Button>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <ImageUp className="h-3.5 w-3.5" />
                            Subir
                            <input type="file" accept="image/*" onChange={handleUploadWithCompression} className="hidden" />
                          </label>
                        </div>
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

      {/* Gallery panel */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGallery(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Images className="h-4 w-4 text-primary" />
                Galería de imágenes generadas
              </h3>
              <button onClick={() => setShowGallery(false)} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingGallery ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : galleryImages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No hay imágenes guardadas. Genera imágenes con IA y se guardarán automáticamente.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {galleryImages.map((img: any) => (
                    <div key={img.id} className="group relative aspect-video rounded-lg overflow-hidden border">
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2">
                        <button
                          onClick={() => { setCustomImage(img.imageUrl); setShowGallery(false) }}
                          className="bg-white text-black text-xs px-3 py-1.5 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                        >
                          Usar
                        </button>
                        <button
                          onClick={() => setLightboxUrl(img.imageUrl)}
                          className="bg-white/80 text-black p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                          <Search className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {img.newsTitle && (
                        <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <span className="text-[10px] text-white truncate block">{img.newsTitle}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Vista previa"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
