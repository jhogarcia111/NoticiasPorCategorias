"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDashboard, type ContentTypeId, type SourceMode } from "@/app/dashboard/dashboard-context"
import { contentTypes } from "@/data/content-types"
import { Linkedin, Share2, FileText, Video, Newspaper, FlaskConical, Link2, ArrowRight, PenSquare } from "lucide-react"

const SOURCE_OPTIONS: { value: SourceMode; label: string; icon: any; color: string }[] = [
  { value: "news", label: "Noticias automáticas", icon: Newspaper, color: "text-blue-600" },
  { value: "scientific", label: "Científicos y Patentes", icon: FlaskConical, color: "text-violet-600" },
  { value: "url", label: "Importar desde URL", icon: Link2, color: "text-teal-600" },
]

const TYPE_ICONS: Record<string, any> = {
  Linkedin,
  Share2,
  FileText,
  Video,
}

export function PublishPicker() {
  const { setIntendedContentType, setIntendedSourceMode, setActiveTab } = useDashboard()
  const [contentType, setContentType] = useState<ContentTypeId>("linkedin-post")
  const [sourceMode, setSourceMode] = useState<SourceMode>("news")

  const handleGo = () => {
    setIntendedContentType(contentType)
    setIntendedSourceMode(sourceMode)
    setActiveTab("news")
  }

  return (
    <Card id="publish-picker" className="border-primary/20">
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">¿Qué quieres publicar hoy?</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Elige el formato y de dónde sale el contenido</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <PenSquare className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {contentTypes.map((t) => {
            const Icon = TYPE_ICONS[t.icon] || FileText
            const active = contentType === t.id
            return (
              <button
                key={t.id}
                onClick={() => setContentType(t.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  active ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted border-border",
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-[10px] font-medium text-muted-foreground">{t.destination}</span>
                </div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{t.description}</p>
              </button>
            )
          })}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">¿De dónde sale el contenido?</p>
          <div className="flex flex-wrap gap-2">
            {SOURCE_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const active = sourceMode === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setSourceMode(opt.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    active ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-muted",
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", active ? "" : opt.color)} />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            El contenido se genera con IA y pasa por el armado visual antes de programarse en el calendario.
          </p>
          <Button size="sm" onClick={handleGo} className="h-9">
            Ir a curación
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}