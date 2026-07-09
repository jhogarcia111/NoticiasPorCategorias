"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, User, Tag, CheckCircle, Circle, ImageIcon } from "lucide-react"
import { formatDateShort, truncateText, cn } from "@/lib/utils"

interface NewsCardProps {
  news: any
  isSelected?: boolean
  onSelect?: (news: any) => void
  onViewDetails?: (news: any) => void
  showSelection?: boolean
}

export function NewsCard({
  news,
  isSelected = false,
  onSelect,
  onViewDetails,
  showSelection = true,
}: NewsCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(news)
  }

  const handleViewDetails = () => {
    onViewDetails?.(news)
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-blue-500 bg-blue-50"
      )}
      onClick={handleViewDetails}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-2">
              {truncateText(news.title, 80)}
            </CardTitle>
            <CardDescription className="text-sm">
              {truncateText(news.summary || news.content, 120)}
            </CardDescription>
          </div>
          {showSelection && (
            <div className="flex-shrink-0 ml-3">
              <button
                onClick={handleSelect}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isSelected ? (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {news.imageUrl && !imageError ? (
          <div className="mb-4">
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-48 object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="mb-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span>{news.sourceName}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{news.publishedAt ? formatDateShort(news.publishedAt) : "—"}</span>
          </div>
          {news.category && (
            <div className="flex items-center text-sm text-gray-600">
              <Tag className="h-4 w-4 mr-2" />
              <span>{news.category.name || news.category}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mb-4">
          <span
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
              news.isProcessed
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            )}
          >
            {news.isProcessed ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <Circle className="h-3 w-3 mr-1" />
            )}
            {news.isProcessed ? "Procesada" : "Pendiente"}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              window.open(news.sourceUrl, "_blank")
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Original
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              handleViewDetails()
            }}
          >
            Ver Detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
