import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useDeleteAllNews } from '../../hooks/useNews'
import { Button } from './Button'
import { Badge } from './Badge'
import { DraggableModal } from './DraggableModal'
import { Settings, Globe, Zap, ZapOff, Move, Trash2, Check } from 'lucide-react'

export const AppControls = () => {
  const { 
    isProductionMode, 
    language, 
    toggleProductionMode, 
    toggleLanguage,
    isDevelopmentMode 
  } = useApp()

  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const deleteAllNewsMutation = useDeleteAllNews()

  const handleDeleteAllNews = async () => {
    if (window.confirm('¿Estás seguro de que quieres borrar TODAS las noticias? Esta acción no se puede deshacer.')) {
      try {
        await deleteAllNewsMutation.mutateAsync()
        setDeleteSuccess(true)
        setTimeout(() => setDeleteSuccess(false), 3000) // Reset después de 3 segundos
      } catch (error) {
        alert('Error al borrar noticias: ' + error.message)
      }
    }
  }

  return (
    <DraggableModal>
      <div className="bg-white rounded-lg shadow-lg border p-3 space-y-2 min-w-[200px]">
        <div 
          className="flex items-center space-x-2 cursor-grab active:cursor-grabbing" 
          data-drag-handle
        >
          <Move className="h-4 w-4 text-gray-400" />
          <Settings className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Configuración</span>
        </div>
        
        <div className="space-y-2">
          {/* Modo Producción/Pruebas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isProductionMode ? (
                <Zap className="h-4 w-4 text-green-500" />
              ) : (
                <ZapOff className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm text-gray-600">Modo:</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleProductionMode}
              className={`text-xs ${
                isProductionMode 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              }`}
            >
              {isProductionMode ? 'Producción' : 'Pruebas'}
            </Button>
          </div>

          {/* Idioma */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Idioma:</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="text-xs"
            >
              {language === 'es' ? 'ES' : 'EN'}
            </Button>
          </div>
        </div>

        {/* Indicadores */}
        <div className="pt-2 border-t space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">IA:</span>
            <Badge 
              variant={isProductionMode ? 'success' : 'warning'}
              className="text-xs"
            >
              {isProductionMode ? 'Activa' : 'Desactivada'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Resúmenes:</span>
            <Badge 
              variant="info"
              className="text-xs"
            >
              {language === 'es' ? 'Español' : 'Inglés'}
            </Badge>
          </div>
        </div>

        {/* Botón de borrar noticias (solo en modo pruebas) */}
        {isDevelopmentMode && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAllNews}
              disabled={deleteAllNewsMutation.isPending}
              className={`w-full ${
                deleteSuccess 
                  ? 'text-green-600 border-green-200 bg-green-50' 
                  : 'text-red-600 border-red-200 hover:bg-red-50'
              }`}
            >
              {deleteSuccess ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  ¡Borradas!
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1" />
                  {deleteAllNewsMutation.isPending ? 'Borrando...' : 'Borrar Noticias'}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </DraggableModal>
  )
}
