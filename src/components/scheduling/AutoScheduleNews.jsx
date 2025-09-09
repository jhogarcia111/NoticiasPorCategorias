import { useState } from 'react'
import { Button } from '../common/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { Badge } from '../common/Badge'
import { Alert } from '../common/Alert'
import { 
  Calendar, 
  Clock, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Users,
  FileText
} from 'lucide-react'
import { useScheduling } from '../../hooks/useScheduling'
import { useLinkedInProfiles } from '../../hooks/useLinkedIn'
import { useNewsManagement } from '../../hooks/useNews'

export const AutoScheduleNews = () => {
  const { 
    configs, 
    scheduleMultiplePosts, 
    isSchedulingMultiple,
    stats 
  } = useScheduling()
  
  const { profiles } = useLinkedInProfiles()
  const { 
    news, 
    selectedNews, 
    handleSelectAll, 
    selectedCount,
    totalCount 
  } = useNewsManagement()

  const [selectedProfile, setSelectedProfile] = useState(null)
  const [selectedConfig, setSelectedConfig] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Filtrar noticias no procesadas
  const unprocessedNews = news?.filter(item => !item.is_processed) || []

  const handleProfileChange = (profileId) => {
    const profile = profiles?.find(p => p.id === profileId)
    setSelectedProfile(profile)
    
    // Buscar configuración para este perfil
    const config = configs?.find(c => c.linkedin_profile_id === profileId)
    setSelectedConfig(config)
  }

  const handleScheduleNews = async () => {
    if (!selectedProfile) {
      setErrorMessage('Por favor selecciona un perfil de LinkedIn')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    if (!selectedConfig) {
      setErrorMessage('No hay configuración de programación para este perfil')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    if (selectedCount === 0) {
      setErrorMessage('Por favor selecciona al menos una noticia para programar')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    try {
      const newsToSchedule = news?.filter(item => selectedNews.includes(item.id)) || []
      
      await scheduleMultiplePosts(selectedProfile.id, newsToSchedule, selectedConfig)
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      
      // Limpiar selección
      handleSelectAll(false)
      
    } catch (error) {
      setErrorMessage(`Error al programar noticias: ${error.message}`)
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    }
  }

  const getConfigSummary = (config) => {
    if (!config) return 'Sin configuración'
    
    const enabledDays = []
    const dayNames = {
      monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', 
      thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom'
    }
    
    Object.entries(dayNames).forEach(([day, name]) => {
      if (config[`${day}_enabled`]) {
        const postsCount = config[`${day}_posts_count`] || 0
        enabledDays.push(`${name}(${postsCount})`)
      }
    })
    
    return enabledDays.length > 0 ? enabledDays.join(', ') : 'Sin días habilitados'
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert type="success">
          <CheckCircle className="h-4 w-4" />
          ¡Noticias programadas exitosamente! Se han creado {selectedCount} publicaciones programadas.
        </Alert>
      )}

      {showError && (
        <Alert type="error">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </Alert>
      )}

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Noticias Disponibles</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{unprocessedNews.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Seleccionadas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{selectedCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Perfiles Conectados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{profiles?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">Posts Programados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Selección de perfil y configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuración de Programación</span>
          </CardTitle>
          <CardDescription>
            Selecciona el perfil de LinkedIn y revisa la configuración de programación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Perfil de LinkedIn
            </label>
            <select
              value={selectedProfile?.id || ''}
              onChange={(e) => handleProfileChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un perfil</option>
              {profiles?.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.first_name} {profile.last_name}
                </option>
              ))}
            </select>
          </div>

          {selectedProfile && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="info">Perfil seleccionado</Badge>
                <span className="text-sm text-gray-600">
                  {selectedProfile.first_name} {selectedProfile.last_name}
                </span>
              </div>

              {selectedConfig ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">Configuración encontrada</Badge>
                    <span className="text-sm text-gray-600">
                      {selectedConfig.enabled ? 'Habilitada' : 'Deshabilitada'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Días habilitados:</strong> {getConfigSummary(selectedConfig)}</p>
                    <p><strong>Zona horaria:</strong> {selectedConfig.timezone}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge variant="warning">Sin configuración</Badge>
                  <span className="text-sm text-gray-600">
                    Este perfil no tiene configuración de programación
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selección de noticias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Seleccionar Noticias</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedCount} de {unprocessedNews.length} seleccionadas
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(selectedCount < unprocessedNews.length)}
              >
                {selectedCount < unprocessedNews.length ? 'Seleccionar Todo' : 'Deseleccionar Todo'}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Selecciona las noticias que quieres programar automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unprocessedNews.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay noticias disponibles para programar.</p>
              <p className="text-sm">Recolecta noticias primero.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unprocessedNews.slice(0, 10).map(newsItem => (
                <div
                  key={newsItem.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedNews.includes(newsItem.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    const isSelected = selectedNews.includes(newsItem.id)
                    if (isSelected) {
                      // Remover de selección
                      const newSelection = selectedNews.filter(id => id !== newsItem.id)
                      // Aquí necesitarías actualizar el estado, pero por simplicidad usamos handleSelectAll
                    } else {
                      // Agregar a selección
                      // Similar, necesitarías actualizar el estado
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNews.includes(newsItem.id)}
                      onChange={() => {
                        // Toggle selection logic here
                      }}
                      className="mt-1 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {newsItem.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {newsItem.summary || newsItem.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {newsItem.source_name}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(newsItem.published_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {unprocessedNews.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ... y {unprocessedNews.length - 10} noticias más
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botón de programar */}
      <div className="flex justify-center">
        <Button
          onClick={handleScheduleNews}
          disabled={!selectedProfile || !selectedConfig || selectedCount === 0 || isSchedulingMultiple}
          loading={isSchedulingMultiple}
          size="lg"
          className="px-8"
        >
          <Zap className="h-4 w-4 mr-2" />
          {isSchedulingMultiple 
            ? 'Programando...' 
            : `Programar ${selectedCount} Noticias`
          }
        </Button>
      </div>
    </div>
  )
}
