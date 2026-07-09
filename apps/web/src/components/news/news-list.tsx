"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Calendar, User, Eye, EyeOff, CheckCircle, Circle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface NewsListProps {
  news: any[]
  onNewsSelect?: (newsId: number) => void
  selectedNews?: number[]
}

export function NewsList({ news, onNewsSelect, selectedNews = [] }: NewsListProps) {
  const [expandedNews, setExpandedNews] = useState<Record<number, boolean>>({})

  const toggleExpanded = (newsId: number) => {
    setExpandedNews((prev) => ({ ...prev, [newsId]: !prev[newsId] }))
  }

  const isSelected = (newsId: number) => selectedNews.includes(newsId)
  const isExpanded = (newsId: number) => expandedNews[newsId]

  if (!news || news.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <p>No hay noticias disponibles</p>
            <p className="text-sm mt-1">Haz clic en "Recolectar Noticias" para comenzar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {news.map((article: any) => (
        <div
          key={article.id}
          className={cn(
            "border rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer",
            isSelected(article.id) && "ring-2 ring-blue-500 bg-blue-50"
          )}
          onClick={() => toggleExpanded(article.id)}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Selection circle - always visible, stopPropagation so it doesn't toggle expand */}
              {onNewsSelect && (
                <div
                  onClick={(e) => { e.stopPropagation(); onNewsSelect(article.id) }}
                  className="flex-shrink-0 pt-0.5 cursor-pointer"
                >
                  {isSelected(article.id) ? (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300 hover:text-gray-400" />
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base leading-tight">{article.title}</h3>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Badge variant={article.isProcessed ? "success" : "warning"} className="text-xs whitespace-nowrap">
                      {article.isProcessed ? "Procesada" : "No procesada"}
                    </Badge>
                    {article.category && (
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {article.category.name || article.category}
                      </Badge>
                    )}
                  </div>
                </div>

                {article.summary && !isExpanded(article.id) && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.summary}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{article.sourceName}</span>
                    {article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: es })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isExpanded(article.id) ? (
                      <span className="text-xs text-muted-foreground"><EyeOff className="h-3.5 w-3.5 inline mr-0.5" />Ocultar</span>
                    ) : (
                      <span className="text-xs text-muted-foreground"><Eye className="h-3.5 w-3.5 inline mr-0.5" />Ver mas</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isExpanded(article.id) && (
              <div className="mt-4 pt-4 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
                {article.content && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Contenido completo:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{article.content}</p>
                  </div>
                )}
                {article.imageUrl && (
                  <img src={article.imageUrl} alt={article.title}
                    className="max-w-full h-auto rounded-lg"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                )}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-500">
                    ID: {article.id} | Creado: {article.createdAt && new Date(article.createdAt).toLocaleString("es-ES")}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(article.sourceUrl, "_blank")} className="text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" /> Original
                    </Button>
                    {onNewsSelect && (
                      <Button variant={isSelected(article.id) ? "default" : "outline"} size="sm"
                        onClick={() => onNewsSelect(article.id)} className="text-xs">
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
