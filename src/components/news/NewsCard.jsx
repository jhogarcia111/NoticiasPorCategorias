import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { Button } from '../common/Button'
import { 
  ExternalLink, 
  Calendar, 
  User, 
  Tag,
  CheckCircle,
  Circle,
  Image as ImageIcon
} from 'lucide-react'
import { formatDateShort, truncateText } from '../../lib/utils'

export const NewsCard = ({ 
  news, 
  isSelected = false, 
  onSelect, 
  onViewDetails,
  showSelection = true 
}) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleSelect = (e) => {
    e.stopPropagation()
    if (onSelect) {
      onSelect(news)
    }
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(news)
    }
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
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
        {/* Imagen */}
        {news.image_url && !imageError ? (
          <div className="mb-4">
            <img
              src={news.image_url}
              alt={news.title}
              className="w-full h-48 object-cover rounded-lg"
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className="mb-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Metadatos */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span>{news.source_name}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDateShort(news.published_at)}</span>
          </div>
          
          {news.categories && (
            <div className="flex items-center text-sm text-gray-600">
              <Tag className="h-4 w-4 mr-2" />
              <span>{news.categories.name}</span>
            </div>
          )}
        </div>

        {/* Estado de procesamiento */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {news.is_processed ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Procesada
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Circle className="h-3 w-3 mr-1" />
                Pendiente
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              window.open(news.source_url, '_blank')
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

// Componente para vista de lista compacta
export const NewsListItem = ({ 
  news, 
  isSelected = false, 
  onSelect, 
  onViewDetails 
}) => {
  const handleSelect = (e) => {
    e.stopPropagation()
    if (onSelect) {
      onSelect(news)
    }
  }

  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onViewDetails && onViewDetails(news)}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
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
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {truncateText(news.title, 100)}
          </h3>
          <p className="text-gray-600 mb-2">
            {truncateText(news.summary || news.content, 150)}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDateShort(news.published_at)}
            </span>
            <span>{news.source_name}</span>
            {news.categories && (
              <span className="flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                {news.categories.name}
              </span>
            )}
            {news.is_processed ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Procesada
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pendiente
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              window.open(news.source_url, '_blank')
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
