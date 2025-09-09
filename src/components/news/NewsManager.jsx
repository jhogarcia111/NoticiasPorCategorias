import { useState } from 'react'
import { useNewsManagement } from '../../hooks/useNews'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Alert } from '../common/Alert'
import { NewsList } from './NewsList'
import { 
  Search, 
  RefreshCw, 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import { formatDateShort, truncateText } from '../../lib/utils'

export const NewsManager = () => {
  const {
    news,
    selectedNews,
    searchQuery,
    selectedCategory,
    isLoading,
    isCollecting,
    isMarking,
    handleSelectNews,
    handleSelectAll,
    handleCollectNews,
    handleMarkAsProcessed,
    setSearchQuery,
    setSelectedCategory,
    selectedCount,
    totalCount
  } = useNewsManagement()

  const [showUnprocessed, setShowUnprocessed] = useState(false)
  const [alert, setAlert] = useState(null)
  const [selectedNewsIds, setSelectedNewsIds] = useState([])

  const filteredNews = news?.filter(item => 
    showUnprocessed ? !item.is_processed : true
  ) || []

  // Debug: mostrar información sobre las noticias cargadas
  console.log('NewsManager - news:', news)
  console.log('NewsManager - filteredNews:', filteredNews)
  console.log('NewsManager - isLoading:', isLoading)

  const handleCollectNewsWithFeedback = async () => {
    try {
      const result = await handleCollectNews()
      
      if (result && result.length > 0) {
        const totalCollected = result.reduce((sum, category) => sum + category.collected, 0)
        setAlert({
          variant: 'success',
          title: 'Noticias recolectadas exitosamente',
          message: `Se recolectaron ${totalCollected} noticias nuevas de ${result.length} categorías.`,
          autoClose: true,
          duration: 5000
        })
      } else {
        setAlert({
          variant: 'info',
          title: 'Recolección completada',
          message: 'No se encontraron noticias nuevas. Todas las noticias ya están en la base de datos.',
          autoClose: true,
          duration: 4000
        })
      }
    } catch (error) {
      setAlert({
        variant: 'error',
        title: 'Error al recolectar noticias',
        message: error.message || 'Ocurrió un error inesperado al recolectar noticias.',
        autoClose: true,
        duration: 6000
      })
    }
  }

  const handleNewsSelection = (newsId) => {
    setSelectedNewsIds(prev => 
      prev.includes(newsId) 
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          onClose={() => setAlert(null)}
          autoClose={alert.autoClose}
          duration={alert.duration}
        >
          {alert.message}
        </Alert>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Noticias</h2>
          <p className="text-gray-600">Recolecta y gestiona noticias para publicar en LinkedIn</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleCollectNewsWithFeedback}
            disabled={isCollecting}
            loading={isCollecting}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recolectar Noticias
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              console.log('Forcing news reload...')
              window.location.reload()
            }}
            size="sm"
          >
            🔄 Debug: Recargar
          </Button>
          {selectedCount > 0 && (
            <Button
              onClick={handleMarkAsProcessed}
              disabled={isMarking}
              loading={isMarking}
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Procesadas ({selectedCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar noticias
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título o contenido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                <option value="1">Tecnología</option>
                <option value="2">Negocios</option>
                <option value="3">Finanzas</option>
                <option value="4">Salud</option>
                <option value="5">Ciencia</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showUnprocessed}
                  onChange={(e) => setShowUnprocessed(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Solo no procesadas</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Noticias</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <Download className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Seleccionadas</p>
                <p className="text-2xl font-bold text-gray-900">{selectedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">No Procesadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredNews.filter(item => !item.is_processed).length}
                </p>
              </div>
              <Circle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Procesadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredNews.filter(item => item.is_processed).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de noticias */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Noticias Recolectadas</CardTitle>
              <CardDescription>
                {filteredNews.length} noticias encontradas
              </CardDescription>
            </div>
            {filteredNews.length > 0 && (
              <Button
                variant="outline"
                onClick={handleSelectAll}
                size="sm"
              >
                {selectedCount === filteredNews.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <NewsList 
              news={filteredNews}
              onNewsSelect={handleNewsSelection}
              selectedNews={selectedNewsIds}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
