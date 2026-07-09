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
        <Card
          key={article.id}
          className={cn(
            "transition-all duration-200 hover:shadow-md",
            isSelected(article.id) && "ring-2 ring-blue-500 bg-blue-50"
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                {article.summary && (
                  <CardDescription className="mt-2">
                    <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                  </CardDescription>
                )}
              </div>
              <div className="ml-4 flex flex-col items-end space-y-2">
                <Badge variant={article.isProcessed ? "success" : "warning"} className="text-xs">
                  {article.isProcessed ? "Procesada" : "No procesada"}
                </Badge>
                {article.category && (
                  <Badge variant="outline" className="text-xs">
                    {article.category.name || article.category}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {article.sourceName}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {article.publishedAt && formatDistanceToNow(new Date(article.publishedAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(article.id)}
                  className="text-xs"
                >
                  {isExpanded(article.id) ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" /> Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" /> Ver más
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(article.sourceUrl, "_blank")}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver original
                </Button>
              </div>
            </div>
            {isExpanded(article.id) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  {article.content && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Contenido completo:</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{article.content}</p>
                    </div>
                  )}
                  {article.imageUrl && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Imagen:</h4>
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="max-w-full h-auto rounded-lg shadow-sm"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      ID: {article.id} | Creado:{" "}
                      {article.createdAt && new Date(article.createdAt).toLocaleString("es-ES")}
                    </div>
                    <Button
                      variant={isSelected(article.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => onNewsSelect?.(article.id)}
                      className="text-xs"
                    >
                      {isSelected(article.id) ? "Seleccionada" : "Seleccionar"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
