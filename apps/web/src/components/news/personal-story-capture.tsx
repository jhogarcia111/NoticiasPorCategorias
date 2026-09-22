"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { upload } from "@vercel/blob/client"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Volume2,
  ArrowRight,
  Lightbulb,
} from "lucide-react"

interface Category {
  id: number
  name: string
  isActive?: boolean | null
}

interface PersonalStoryCaptureProps {
  onSuccess?: (newsId: number) => void
  onClose?: () => void
}

export function PersonalStoryCapture({ onSuccess, onClose }: PersonalStoryCaptureProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // Grabación de audio
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Foto opcional
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Configuración
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string>("")
  const [language, setLanguage] = useState<string>("es")

  // Estado del proceso
  const [loading, setLoading] = useState(false)
  const [progressStep, setProgressStep] = useState<string>("")
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Resultado
  const [createdResult, setCreatedResult] = useState<{
    newsId: number
    eventBrief: {
      narrative_core: string
      suggested_angles: Array<{ id: string; title: string; rationale: string }>
    }
  } | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Cargar categorías
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const cats = (data.data || []).filter((c: Category) => c.isActive !== false)
        setCategories(cats)
        if (cats.length > 0) {
          setCategoryId(String(cats[0].id))
        }
      })
      .catch(() => {})
  }, [])

  // Limpieza de URLs creadas en memoria
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [audioUrl, photoPreview])

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    if (type === "success") {
      setTimeout(() => setAlert(null), 5000)
    }
  }

  // Control de grabación
  const startRecording = async () => {
    try {
      setAlert(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []

      // Usar codecs soportados
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm"

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setAudioBlob(finalBlob)
        const localUrl = URL.createObjectURL(finalBlob)
        setAudioUrl(localUrl)

        // Detener todos los tracks de audio del micrófono
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(250) // capturar chunks cada 250ms
      setIsRecording(true)
      setRecordingDuration(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err: any) {
      console.error("Error al acceder al micrófono:", err)
      showAlert("error", "No se pudo acceder al micrófono. Verifica los permisos del navegador.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }

  const resetAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingDuration(0)
  }

  // Manejo de foto
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showAlert("error", "La foto no debe superar los 10MB.")
      return
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  // Formato mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Enviar y procesar
  const handleSubmit = async () => {
    if (!audioBlob && !photoFile) {
      showAlert("error", "Graba una nota de voz o sube una foto antes de continuar.")
      return
    }

    if (!categoryId) {
      showAlert("error", "Por favor selecciona una categoría.")
      return
    }

    const userId = session?.user?.id
    if (!userId) {
      showAlert("error", "Debes iniciar sesión para publicar una historia.")
      return
    }

    setLoading(true)
    setAlert(null)

    try {
      let uploadedAudioUrl: string | undefined
      let uploadedPhotoUrl: string | undefined

      // 1. Subida directa a Vercel Blob
      setProgressStep("Subiendo archivos a almacenamiento seguro...")

      if (audioBlob) {
        const ext = audioBlob.type.includes("mp4") ? "mp4" : "webm"
        const audioPath = `personal-stories/${userId}/${crypto.randomUUID()}-audio.${ext}`
        const blobResult = await upload(audioPath, audioBlob, {
          access: "public",
          handleUploadUrl: "/api/personal-stories/blob-upload",
        })
        uploadedAudioUrl = blobResult.url
      }

      if (photoFile) {
        const ext = photoFile.name.split(".").pop() || "jpg"
        const photoPath = `personal-stories/${userId}/${crypto.randomUUID()}-photo.${ext}`
        const blobResult = await upload(photoPath, photoFile, {
          access: "public",
          handleUploadUrl: "/api/personal-stories/blob-upload",
        })
        uploadedPhotoUrl = blobResult.url
      }

      // 2. Procesar con Groq Whisper y Llama 3.3
      setProgressStep("Transcribiendo con Groq Whisper y generando brief narrativo...")

      const response = await fetch("/api/personal-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl: uploadedAudioUrl,
          photoUrl: uploadedPhotoUrl,
          categoryId: Number(categoryId),
          language,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la historia")
      }

      showAlert("success", "¡Historia personal procesada y agregada a tus noticias!")
      setCreatedResult({
        newsId: data.newsId,
        eventBrief: data.eventBrief,
      })

      // Actualizar lista de noticias en caché
      queryClient.invalidateQueries({ queryKey: ["news"] })
    } catch (err: any) {
      console.error("Error en captura:", err)
      showAlert("error", err.message || "Ocurrió un error inesperado.")
    } finally {
      setLoading(false)
      setProgressStep("")
    }
  }

  return (
    <Card className="border-rose-200/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Capturar Historia Personal
              </CardTitle>
              <CardDescription className="text-xs">
                Graba una nota de voz sobre lo que te acaba de ocurrir y la IA creará un post para LinkedIn
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {alert && (
          <div
            className={cn(
              "p-3 rounded-lg text-xs flex items-center gap-2 border",
              alert.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            )}
          >
            {alert.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
        )}

        {/* Si ya se creó, mostrar resultado */}
        {createdResult ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-rose-600 text-white text-xs hover:bg-rose-700">
                  Historia Lista
                </Badge>
                <span className="text-[11px] text-muted-foreground">ID #{createdResult.newsId}</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-rose-950 mb-1">Núcleo narrativo:</p>
                <p className="text-xs text-rose-900 leading-relaxed">
                  {createdResult.eventBrief.narrative_core}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-rose-200/50">
                <p className="text-xs font-semibold text-rose-950">Ángulos sugeridos por la IA:</p>
                <div className="grid gap-2">
                  {createdResult.eventBrief.suggested_angles.map((angle) => (
                    <div
                      key={angle.id}
                      className="p-2.5 rounded-lg bg-white border border-rose-200/70 text-xs shadow-2xs"
                    >
                      <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        {angle.title}
                      </p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {angle.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setCreatedResult(null)
                  resetAudio()
                  removePhoto()
                }}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Grabar otra historia
              </Button>
              <Button
                size="sm"
                className="text-xs bg-primary hover:bg-primary/90"
                onClick={() => {
                  if (onSuccess) onSuccess(createdResult.newsId)
                }}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Redactar post para LinkedIn
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Formulario de captura */
          <div className="space-y-4">
            {/* Grabador de voz */}
            <div className="p-4 rounded-xl border bg-muted/20 flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex items-center gap-2">
                {isRecording && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
                <span className="text-sm font-mono font-semibold text-foreground">
                  {isRecording
                    ? formatTime(recordingDuration)
                    : audioBlob
                    ? `Grabado (${formatTime(recordingDuration)})`
                    : "00:00"}
                </span>
              </div>

              {/* Botón principal de grabación */}
              <div className="flex items-center gap-3">
                {!isRecording && !audioBlob && (
                  <Button
                    type="button"
                    onClick={startRecording}
                    className="rounded-full h-12 w-12 p-0 bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform active:scale-95"
                    title="Iniciar grabación"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                )}

                {isRecording && (
                  <Button
                    type="button"
                    onClick={stopRecording}
                    variant="destructive"
                    className="rounded-full h-12 w-12 p-0 shadow-md animate-pulse active:scale-95"
                    title="Detener grabación"
                  >
                    <Square className="h-5 w-5" />
                  </Button>
                )}

                {audioBlob && !isRecording && (
                  <div className="flex items-center gap-2">
                    <audio
                      src={audioUrl || ""}
                      controls
                      className="h-9 max-w-[240px] rounded-md"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetAudio}
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-red-600"
                      title="Descartar y regrabar"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground max-w-xs">
                {isRecording
                  ? "Habla con naturalidad. Describe qué ocurrió, cómo lo resolviste o qué aprendiste."
                  : audioBlob
                  ? "Escucha el audio o vuelve a grabar si lo prefieres."
                  : "Presiona el micrófono y cuenta tu anécdota o lección de negocio."}
              </p>
            </div>

            {/* Subida de foto opcional (Fase 3 integrada) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Foto asociada (opcional)
                </span>
                <span className="text-[10px] text-muted-foreground">JPG, PNG o WebP</span>
              </label>

              {photoPreview ? (
                <div className="relative w-full h-32 rounded-lg border overflow-hidden bg-muted group">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                    title="Eliminar foto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-20 border border-dashed rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Upload className="h-4 w-4" />
                    <span>Seleccionar foto o captura de pantalla</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Categoría e Idioma */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Categoría</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-9 px-3 border border-input bg-background rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Idioma de salida</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-9 px-3 border border-input bg-background rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </div>
            </div>

            {/* Botón de envío */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || isRecording || (!audioBlob && !photoFile)}
                className="w-full h-10 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {progressStep || "Procesando historia..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Procesar Historia con IA
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
