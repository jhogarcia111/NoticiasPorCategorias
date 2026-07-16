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

  // Label presets
  const LABEL_PRESETS = [
    { text: "BREAKING NEWS", words: ["BREAKING", "NEWS"], style: "split" as const },
    { text: "Última noticia", words: ["Última", "noticia"], style: "split" as const },
    { text: "¿Sabías que?", words: ["¿Sabías", "que?"], style: "red" as const },
    { text: "Atención", words: ["Atención"], style: "red" as const },
    { text: "Infórmate", words: ["Infórmate"], style: "accent" as const },
  ]
  const [labelPresetIdx, setLabelPresetIdx] = useState(0)
  const [labelStyle, setLabelStyle] = useState<"red" | "split" | "accent">("split")
  const labelPreset = LABEL_PRESETS[labelPresetIdx]

  // Overlay positions (percentages of container)
  const [labelX, setLabelX] = useState(2)
  const [labelY, setLabelY] = useState(84)
  const [labelW, setLabelW] = useState(24)
  const [labelH, setLabelH] = useState(11)
  const [labelFontSz, setLabelFontSz] = useState(55)
  const [textX, setTextX] = useState(27)
  const [textY, setTextY] = useState(84)
  const [textW, setTextW] = useState(71)
  const [textH, setTextH] = useState(11)
  const [textFontSz, setTextFontSz] = useState(45)

  // Drag/resize
  const dragRef = useRef<{ type: "label" | "text"; startX: number; startY: number; origX: number; origY: number; origW: number; origH: number; corner?: string } | null>(null)

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

    // auto-select template
    if (saved.templateName) {
      const match = promptTemplates.find((t) => t.name === saved.templateName)
      if (match) setSelectedTemplateId(match.id)
    }

    // restore headlines
    if (saved.headlines) {
      try {
        const parsed = typeof saved.headlines === "string" ? JSON.parse(saved.headlines) : saved.headlines
        if (Array.isArray(parsed)) setHeadlines(parsed)
      } catch {}
    }

    if (saved.newsId && !activeNewsIds.includes(saved.newsId)) {
      setActiveNewsIds((prev: number[]) => [...prev, saved.newsId])
    }
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
            headlines: headlines.length > 0 ? JSON.stringify(headlines) : null,
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
      let headlinesArr: string[] = []
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
          if (d.data) {
            headlinesArr = d.data
            setHeadlines(d.data)
            // update first saved gallery image with headlines
            if (imageOptions.length > 0) {
              fetch("/api/images/update-headlines", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: imageOptions[0], headlines: d.data }),
              }).catch(() => {})
            }
          }
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

  const renderOverlay = (
    ctx: CanvasRenderingContext2D,
    label: string,
    fontSz: number,
    x: number, y: number, w: number, h: number,
    style: "red" | "split" | "accent",
    cw: number, ch: number,
  ) => {
    const px = (pct: number, dim: number) => Math.round((pct / 100) * dim)
    const lx = px(x, cw), ly = px(y, ch), lw = px(w, cw), lh = px(h, ch)
    const fs = Math.max(10, Math.round(fontSz / 100 * lh))
    const words = label.split(" ")
    const isSplit = style === "split" && words.length >= 2

    if (isSplit) {
      const halfW = lw / words.length
      words.forEach((word, i) => {
        const wx = lx + i * halfW
        if (i === 0) {
          ctx.fillStyle = "#CC0000"
          ctx.beginPath()
          ctx.roundRect(wx, ly, halfW, lh, i === 0 ? 4 : 0)
          ctx.fill()
          ctx.fillStyle = "white"
        } else {
          ctx.fillStyle = "white"
          ctx.beginPath()
          ctx.roundRect(wx, ly, halfW, lh, i === words.length - 1 ? 4 : 0)
          ctx.fill()
          ctx.fillStyle = "#111"
        }
        ctx.font = `bold ${fs}px Arial, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(word, wx + halfW / 2, ly + lh / 2)
      })
    } else {
      ctx.fillStyle = style === "accent" ? "#0066CC" : "#CC0000"
      ctx.beginPath()
      ctx.roundRect(lx, ly, lw, lh, 4)
      ctx.fill()
      ctx.fillStyle = "white"
      ctx.font = `bold ${fs}px Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(label, lx + lw / 2, ly + lh / 2)
    }
  }

  const renderText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    fontSz: number,
    x: number, y: number, w: number, h: number,
    cw: number, ch: number,
  ) => {
    const px = (pct: number, dim: number) => Math.round((pct / 100) * dim)
    const tx = px(x, cw), ty = px(y, ch), tw = px(w, cw), th = px(h, ch)
    const fs = Math.max(10, Math.round(fontSz / 100 * th))

    ctx.fillStyle = "rgba(0,0,0,0.65)"
    ctx.beginPath()
    ctx.roundRect(tx - 4, ty - 2, tw + 8, th + 4, 4)
    ctx.fill()

    ctx.fillStyle = "white"
    ctx.font = `bold ${fs}px Arial, sans-serif`
    ctx.textAlign = "left"
    ctx.textBaseline = "top"

    const words = text.split(" ")
    let line = "", lineY = ty + 4
    const lineH = fs * 1.3
    for (const word of words) {
      const test = line ? line + " " + word : word
      if (ctx.measureText(test).width > tw - 8 && line) {
        ctx.fillText(line, tx + 4, lineY)
        line = word
        lineY += lineH
      } else {
        line = test
      }
    }
    if (line) ctx.fillText(line, tx + 4, lineY)
  }

  const overlayTextOnImage = (
    imgSrc: string,
    headline: string,
    config: {
      labelPreset: { text: string; style: "red" | "split" | "accent" }
      labelX: number; labelY: number; labelW: number; labelH: number; labelFontSz: number
      textX: number; textY: number; textW: number; textH: number; textFontSz: number
    }
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const cw = img.width, ch = img.height
        const canvas = document.createElement("canvas")
        canvas.width = cw
        canvas.height = ch
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0)

        // Dark overlay at bottom for readability
        const gradY = Math.round(ch * 0.8)
        const gradient = ctx.createLinearGradient(0, gradY, 0, ch)
        gradient.addColorStop(0, "rgba(0,0,0,0)")
        gradient.addColorStop(1, "rgba(0,0,0,0.4)")
        ctx.fillStyle = gradient
        ctx.fillRect(0, gradY, cw, ch - gradY)

        renderOverlay(ctx, config.labelPreset.text, config.labelFontSz,
          config.labelX, config.labelY, config.labelW, config.labelH,
          config.labelPreset.style, cw, ch)

        renderText(ctx, headline, config.textFontSz,
          config.textX, config.textY, config.textW, config.textH, cw, ch)

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

  const ensureHeadlines = async () => {
    if (headlines.length > 0 || activeNews.length === 0) return
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "headlines",
          title: activeNews[0]?.title || "",
          summary: activeNews[0]?.summary || activeNews[0]?.content || "",
        }),
      })
      const data = await res.json()
      if (data.data) setHeadlines(data.data)
    } catch {}
  }

  const handleRegenerateHeadlines = async () => {
    if (activeNews.length === 0) return
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "headlines",
          title: activeNews[0]?.title || "",
          summary: activeNews[0]?.summary || activeNews[0]?.content || "",
        }),
      })
      const data = await res.json()
      if (data.data) setHeadlines(data.data)
    } catch (e: any) {
      setAlert({ type: "error", text: `Error: ${e.message}` })
    }
  }

  const getAssembleConfig = () => ({
    labelPreset,
    labelX, labelY, labelW, labelH, labelFontSz,
    textX, textY, textW, textH, textFontSz,
  })

  const handleAssembleImage = async () => {
    if (!assemblerImage || (selectedHeadlineIdx === null && !customHeadline.trim())) return
    setAssembling(true)
    try {
      const headline = selectedHeadlineIdx !== null ? headlines[selectedHeadlineIdx] : customHeadline.trim()
      if (!headline) throw new Error("Selecciona o escribe un titular")
      const config = getAssembleConfig()
      const finalBlobUrl = await overlayTextOnImage(assemblerImage, headline, config)
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
      ensureHeadlines()
    } catch (err: any) {
      setAlert({ type: "error", text: `Error al comprimir imagen: ${err.message}` })
    }
  }

  const editorMouseDown = (type: "label" | "text", e: React.MouseEvent, corner?: string) => {
    e.preventDefault()
    const rect = e.currentTarget.closest("[data-editor]")?.getBoundingClientRect()
    if (!rect) return
    const startX = e.clientX, startY = e.clientY
    const [ox, oy, ow, oh] = type === "label"
      ? [labelX, labelY, labelW, labelH] : [textX, textY, textW, textH]
    dragRef.current = { type, startX, startY, origX: ox, origY: oy, origW: ow, origH: oh, corner }

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const dx = ((ev.clientX - startX) / rect.width) * 100
      const dy = ((ev.clientY - startY) / rect.height) * 100
      const { type: t, origX: ox2, origY: oy2, origW: ow2, origH: oh2, corner: c } = dragRef.current

      if (c) {
        const [nx, ny, nw, nh] = resizeFromCorner(c, ox2, oy2, ow2, oh2, dx, dy)
        if (t === "label") { setLabelX(nx); setLabelY(ny); setLabelW(nw); setLabelH(nh) }
        else { setTextX(nx); setTextY(ny); setTextW(nw); setTextH(nh) }
      } else {
        if (t === "label") { setLabelX(Math.max(0, Math.min(100 - labelW, ox2 + dx))); setLabelY(Math.max(0, Math.min(100 - labelH, oy2 + dy))) }
        else { setTextX(Math.max(0, Math.min(100 - textW, ox2 + dx))); setTextY(Math.max(0, Math.min(100 - textH, oy2 + dy))) }
      }
    }
    const onUp = () => { dragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  const resizeFromCorner = (corner: string, ox: number, oy: number, ow: number, oh: number, dx: number, dy: number): [number, number, number, number] => {
    let nx = ox, ny = oy, nw = ow, nh = oh
    if (corner.includes("e")) nw = Math.max(5, ow + dx)
    if (corner.includes("w")) { nw = Math.max(5, ow - dx); nx = ox + dx }
    if (corner.includes("s")) nh = Math.max(3, oh + dy)
    if (corner.includes("n")) { nh = Math.max(3, oh - dy); ny = oy + dy }
    return [nx, ny, nw, nh]
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
                          handleRecuperar(item)
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

          {/* Assembler card - always visible */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ImageUp className="h-4 w-4 text-primary" />
                Armar foto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handleGenerateImages}
                  disabled={generatingImages || activeNews.length === 0}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                >
                  {generatingImages ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                  {generatingImages ? "Generando..." : "Generar imagen IA"}
                </Button>
                <Button onClick={() => setShowGallery(true)} variant="outline" size="sm" className="h-8 text-xs">
                  <Images className="h-3.5 w-3.5 mr-1" />
                  Galería
                </Button>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors h-8 px-3 rounded-md border border-input hover:bg-accent">
                  <ImageUp className="h-3.5 w-3.5" />
                  Subir
                  <input type="file" accept="image/*" onChange={handleUploadWithCompression} className="hidden" />
                </label>
              </div>

              {/* Image source selection */}
              {(imageOptions.length > 0 || assemblerImage) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Selecciona la imagen base:</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {imageOptions.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => { setAssemblerImage(url); ensureHeadlines() }}
                        className={cn(
                          "w-20 h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0",
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
                      className="w-20 h-12 rounded border-2 border-dashed flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-all flex-shrink-0"
                      title="De la galería"
                    >
                      <Images className="h-4 w-4" />
                    </button>
                    <label className="w-20 h-12 rounded border-2 border-dashed flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-all flex-shrink-0 cursor-pointer">
                      <ImageUp className="h-4 w-4" />
                      <input type="file" accept="image/*" onChange={handleUploadWithCompression} className="hidden" />
                    </label>
                  </div>
                </div>
              )}

              {/* Interactive editor preview */}
              {assemblerImage && (
                <div data-editor className="relative rounded-lg overflow-hidden border select-none bg-muted">
                  <img
                    src={assemblerImage}
                    alt="Base"
                    className="w-full max-h-[420px] object-contain pointer-events-none"
                    onLoad={(e) => {
                      const el = e.currentTarget
                      const p = el.closest("[data-editor]") as HTMLElement
                      if (p) p.style.aspectRatio = `${el.naturalWidth} / ${el.naturalHeight}`
                    }}
                  />

                  {/* Label overlay */}
                  <div
                    className="absolute cursor-move group flex items-center justify-center"
                    style={{
                      left: `${labelX}%`, top: `${labelY}%`,
                      width: `${labelW}%`, height: `${labelH}%`,
                      fontSize: `clamp(8px, ${labelFontSz * 0.12}px, 60px)`,
                    }}
                    onMouseDown={(e) => editorMouseDown("label", e)}
                  >
                    {labelPreset.style === "split" && labelPreset.words.length >= 2 ? (
                      <div className="flex w-full h-full font-bold" style={{ fontSize: "inherit" }}>
                        <div className="flex items-center justify-center bg-red-600 text-white rounded-l" style={{ width: `${100 / labelPreset.words.length}%` }}>
                          {labelPreset.words[0]}
                        </div>
                        <div className="flex items-center justify-center bg-white text-gray-900 rounded-r" style={{ width: `${100 / labelPreset.words.length}%` }}>
                          {labelPreset.words[1]}
                        </div>
                      </div>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center font-bold rounded text-white ${labelPreset.style === "accent" ? "bg-blue-600" : "bg-red-600"}`} style={{ fontSize: "inherit" }}>
                        {labelPreset.text}
                      </div>
                    )}
                    {["nw", "ne", "sw", "se"].map((c) => (
                      <div key={c} className="absolute w-3 h-3 bg-white border border-gray-400 rounded-sm opacity-0 group-hover:opacity-100"
                        style={{
                          cursor: `${c}-resize`,
                          ...(c.includes("n") ? { top: "-5px" } : { bottom: "-5px" }),
                          ...(c.includes("w") ? { left: "-5px" } : { right: "-5px" }),
                        }}
                        onMouseDown={(e) => { e.stopPropagation(); editorMouseDown("label", e, c) }}
                      />
                    ))}
                  </div>

                  {/* Text overlay */}
                  <div
                    className="absolute cursor-move group"
                    style={{
                      left: `${textX}%`, top: `${textY}%`,
                      width: `${textW}%`, height: `${textH}%`,
                      fontSize: `clamp(8px, ${textFontSz * 0.1}px, 50px)`,
                    }}
                    onMouseDown={(e) => editorMouseDown("text", e)}
                  >
                    <div className="w-full h-full flex items-center font-bold text-white leading-tight overflow-hidden px-1"
                      style={{ fontSize: "inherit", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                      {selectedHeadlineIdx !== null ? headlines[selectedHeadlineIdx] : customHeadline || "Titular"}
                    </div>
                    {["nw", "ne", "sw", "se"].map((c) => (
                      <div key={c} className="absolute w-3 h-3 bg-white border border-gray-400 rounded-sm opacity-0 group-hover:opacity-100"
                        style={{
                          cursor: `${c}-resize`,
                          ...(c.includes("n") ? { top: "-5px" } : { bottom: "-5px" }),
                          ...(c.includes("w") ? { left: "-5px" } : { right: "-5px" }),
                        }}
                        onMouseDown={(e) => { e.stopPropagation(); editorMouseDown("text", e, c) }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Headline + Label + Position controls */}
              <div className="grid grid-cols-2 gap-2">
                {/* Left col: headline + label */}
                <div className="space-y-2">
                  {headlines.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[10px] text-muted-foreground">Titular:</p>
                        <button onClick={handleRegenerateHeadlines} className="text-[9px] text-primary hover:underline flex items-center gap-0.5">
                          <RefreshCw className="h-2.5 w-2.5" /> Regenerar
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {headlines.map((h, i) => (
                          <button key={i} onClick={() => { setSelectedHeadlineIdx(i); setCustomHeadline("") }}
                            className={cn("w-full text-left px-1.5 py-0.5 rounded border text-[9px] transition-all leading-tight",
                              selectedHeadlineIdx === i && !customHeadline ? "border-primary bg-primary/5" : "border-border hover:bg-muted")}
                          >{h}</button>
                        ))}
                      </div>
                      <input value={customHeadline} onChange={(e) => { setCustomHeadline(e.target.value); setSelectedHeadlineIdx(null) }}
                        placeholder="O escribe uno propio..." className="w-full mt-0.5 px-1.5 py-0.5 border rounded text-[9px]" />
                    </div>
                  )}

                  {/* Label preset selector */}
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Etiqueta:</p>
                    <div className="flex gap-1 flex-wrap">
                      {LABEL_PRESETS.map((p, i) => (
                        <button key={i} onClick={() => { setLabelPresetIdx(i); setLabelStyle(p.style) }}
                          className={cn("px-1.5 py-0.5 rounded text-[9px] border font-medium transition-all",
                            labelPresetIdx === i ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted"
                          )}>
                          {p.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position presets */}
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Posición:</p>
                    <div className="flex gap-1">
                      {[
                        { l: "TL", x: 2, y: 2 }, { l: "TC", x: 35, y: 2 }, { l: "TR", x: 68, y: 2 },
                        { l: "BL", x: 2, y: 84 }, { l: "BC", x: 20, y: 84 }, { l: "BR", x: 50, y: 84 },
                      ].map((p) => (
                        <button key={p.l} onClick={() => { setLabelX(p.x); setLabelY(p.y); setTextX(p.x + 22); setTextY(p.y) }}
                          className="px-1.5 py-0.5 rounded text-[8px] border border-border hover:bg-muted font-mono">{p.l}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right col: size sliders */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground">Etiqueta:</p>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-muted-foreground w-4">W</span>
                    <input type="range" min="8" max="50" value={labelW} onChange={(e) => setLabelW(Number(e.target.value))} className="flex-1 h-1" />
                    <span className="text-[8px] text-muted-foreground w-6">{labelW}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-muted-foreground w-4">H</span>
                    <input type="range" min="4" max="20" value={labelH} onChange={(e) => setLabelH(Number(e.target.value))} className="flex-1 h-1" />
                    <span className="text-[8px] text-muted-foreground w-6">{labelH}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-muted-foreground w-4">Aa</span>
                    <input type="range" min="20" max="100" value={labelFontSz} onChange={(e) => setLabelFontSz(Number(e.target.value))} className="flex-1 h-1" />
                    <span className="text-[8px] text-muted-foreground w-6">{labelFontSz}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Texto:</p>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-muted-foreground w-4">W</span>
                    <input type="range" min="20" max="90" value={textW} onChange={(e) => setTextW(Number(e.target.value))} className="flex-1 h-1" />
                    <span className="text-[8px] text-muted-foreground w-6">{textW}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-muted-foreground w-4">H</span>
                    <input type="range" min="4" max="20" value={textH} onChange={(e) => setTextH(Number(e.target.value))} className="flex-1 h-1" />
                    <span className="text-[8px] text-muted-foreground w-6">{textH}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-muted-foreground w-4">Aa</span>
                    <input type="range" min="20" max="100" value={textFontSz} onChange={(e) => setTextFontSz(Number(e.target.value))} className="flex-1 h-1" />
                    <span className="text-[8px] text-muted-foreground w-6">{textFontSz}%</span>
                  </div>
                </div>
              </div>

              {/* Final assembled image preview with zoom */}
              {finalImageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={finalImageUrl}
                    alt="Imagen final"
                    className="w-full max-h-72 object-cover cursor-pointer"
                    onClick={() => setLightboxUrl(finalImageUrl)}
                  />
                  <button
                    onClick={() => { setFinalImageUrl(null); setCustomImage(null) }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground py-1">Click para ampliar</p>
                </div>
              )}

              <Button
                onClick={handleAssembleImage}
                disabled={!assemblerImage || (selectedHeadlineIdx === null && !customHeadline.trim()) || assembling}
                size="sm"
                className="w-full h-8 text-xs"
              >
                {assembling ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                {assembling ? "Armando..." : "Armar foto"}
              </Button>
            </CardContent>
          </Card>

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

                        </div>

                        <div className="flex items-center gap-4 px-4 py-2.5 border-t text-xs text-gray-400">
                          <span className="flex items-center gap-1">👍 0</span>
                          <span className="flex items-center gap-1">💬 0</span>
                          <span className="flex items-center gap-1">🔄 0</span>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
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
                          onClick={() => {
                            setAssemblerImage(img.imageUrl)
                            let hasHeadlines = false
                            if (img.headlinesJson) {
                              try {
                                const hls = JSON.parse(img.headlinesJson)
                                if (Array.isArray(hls) && hls.length > 0) {
                                  setHeadlines(hls)
                                  hasHeadlines = true
                                }
                              } catch {}
                            }
                            if (!hasHeadlines) ensureHeadlines()
                            setCustomImage(img.imageUrl)
                            setFinalImageUrl(null)
                            setShowGallery(false)
                          }}
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
