"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Calendar, User, CheckCircle, Circle, ChevronDown, ChevronUp, Globe } from "lucide-react"
import { format, differenceInDays, isToday, isYesterday } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface NewsListProps {
  news: any[]
  onNewsSelect?: (newsId: number) => void
  selectedNews?: number[]
  publishedIds?: number[]
}

function daysSince(date: Date): number {
  return differenceInDays(new Date(), date)
}

function dateColorClass(pubDate: string | Date | null | undefined): string {
  if (!pubDate) return "text-muted-foreground bg-muted/50"
  const days = daysSince(new Date(pubDate))
  if (days === 0) return "text-green-700 bg-green-50 border-green-200"
  if (days <= 2) return "text-blue-700 bg-blue-50 border-blue-200"
  if (days <= 5) return "text-orange-700 bg-orange-50 border-orange-200"
  return "text-red-700 bg-red-50 border-red-200"
}

function dateLabel(pubDate: string | Date | null | undefined): string {
  if (!pubDate) return "—"
  const d = new Date(pubDate)
  if (isToday(d)) return "Hoy"
  if (isYesterday(d)) return "Ayer"
  return `${differenceInDays(new Date(), d)}d`
}

export function NewsList({ news, onNewsSelect, selectedNews = [], publishedIds = [] }: NewsListProps) {
  const [expandedNews, setExpandedNews] = useState<Record<number, boolean>>({})

  const toggleExpanded = (newsId: number) => {
    setExpandedNews((prev) => ({ ...prev, [newsId]: !prev[newsId] }))
  }

  const isSelected = (newsId: number) => selectedNews.includes(newsId)
  const isExpanded = (newsId: number) => expandedNews[newsId]

  if (!news || news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-4">
          <Globe className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No hay noticias disponibles</p>
        <p className="text-xs text-muted-foreground mt-1">Haz clic en "Recolectar" para comenzar</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {news.map((article: any) => (
        <div
          key={article.id}
          className={cn(
            "border rounded-lg transition-all duration-200",
            isSelected(article.id) && "ring-2 ring-primary/30 bg-primary/[0.03]",
            !isExpanded(article.id) && "hover:border-muted-foreground/20 hover:shadow-sm",
          )}
        >
          <div
            className="p-4 cursor-pointer"
            onClick={() => toggleExpanded(article.id)}
          >
            <div className="flex items-start gap-3">
              {onNewsSelect && (
                <div
                  onClick={(e) => { e.stopPropagation(); onNewsSelect(article.id) }}
                  className="flex-shrink-0 pt-0.5 cursor-pointer"
                >
                  {isSelected(article.id) ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors" />
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={cn(
                    "text-sm leading-snug transition-colors",
                    isSelected(article.id) ? "text-primary font-semibold" : "text-foreground font-medium",
                  )}>
                    {article.title}
                  </h3>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {article.category && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                        {article.category.name || article.category}
                      </Badge>
                    )}
                    {publishedIds.includes(article.id) && (
                      <Badge className="text-[10px] px-1.5 py-0 h-5 font-normal whitespace-nowrap bg-green-100 text-green-800 border-green-200">
                        Publicada
                      </Badge>
                    )}
                    <Badge variant={article.isProcessed ? "success" : "warning"} className="text-[10px] px-1.5 py-0 h-5 font-normal whitespace-nowrap">
                      {article.isProcessed ? "Procesada" : "Pendiente"}
                    </Badge>
                  </div>
                </div>

                {article.summary && !isExpanded(article.id) && (
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{article.summary}</p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {article.sourceName}
                    </span>
                    {article.publishedAt && (
                      <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border", dateColorClass(article.publishedAt))}>
                        <Calendar className="h-2.5 w-2.5" />
                        {dateLabel(article.publishedAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {isExpanded(article.id) ? (
                      <span className="flex items-center gap-0.5"><ChevronUp className="h-3 w-3" />Ocultar</span>
                    ) : (
                      <span className="flex items-center gap-0.5"><ChevronDown className="h-3 w-3" />Ver mas</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isExpanded(article.id) && (
              <div className="mt-4 pt-4 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
                {article.content && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Contenido completo</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{article.content}</p>
                  </div>
                )}
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="max-w-full h-auto rounded-lg border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                )}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-muted-foreground">
                    #{article.id} | {article.publishedAt ? format(new Date(article.publishedAt), "dd/MM/yyyy", { locale: es }) : "—"}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(article.sourceUrl, "_blank")} className="h-8 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Original
                    </Button>
                    {onNewsSelect && (
                      <Button
                        variant={isSelected(article.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => onNewsSelect(article.id)}
                        className="h-8 text-xs"
                      >
                        {isSelected(article.id) ? "Seleccionada" : "Seleccionar"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
