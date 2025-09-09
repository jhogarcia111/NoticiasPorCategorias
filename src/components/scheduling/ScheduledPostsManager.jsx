import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '../common/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { Badge } from '../common/Badge'
import { Alert } from '../common/Alert'
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Filter,
  Search
} from 'lucide-react'
import { useScheduling } from '../../hooks/useScheduling'
import { useLinkedInProfiles } from '../../hooks/useLinkedIn'

const STATUS_COLORS = {
  scheduled: 'blue',
  published: 'green',
  failed: 'red',
  cancelled: 'gray'
}

const STATUS_LABELS = {
  scheduled: 'Programado',
  published: 'Publicado',
  failed: 'Falló',
  cancelled: 'Cancelado'
}

export const ScheduledPostsManager = () => {
  const { 
    scheduledPosts, 
    cancelPost, 
    deletePost, 
    isCancelling, 
    isDeleting,
    stats 
  } = useScheduling()
  
  const { profiles } = useLinkedInProfiles()
  const [filters, setFilters] = useState({
    status: '',
    profile: '',
    search: ''
  })

  // Filtrar posts
  const filteredPosts = scheduledPosts?.filter(post => {
    if (filters.status && post.status !== filters.status) return false
    if (filters.profile && post.linkedin_profile_id !== filters.profile) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower) ||
        post.summary?.toLowerCase().includes(searchLower)
      )
    }
    return true
  }) || []

  const handleCancelPost = async (postId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar este post?')) {
      try {
        await cancelPost(postId)
      } catch (error) {
        console.error('Error cancelling post:', error)
      }
    }
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.')) {
      try {
        await deletePost(postId)
      } catch (error) {
        console.error('Error deleting post:', error)
      }
    }
  }

  const getProfileName = (profileId) => {
    const profile = profiles?.find(p => p.id === profileId)
    return profile ? `${profile.first_name} ${profile.last_name}` : 'Perfil desconocido'
  }

  const formatScheduledDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  const formatPublishedDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Programados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Publicados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-gray-600">Fallidos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perfil
              </label>
              <select
                value={filters.profile}
                onChange={(e) => setFilters(prev => ({ ...prev, profile: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los perfiles</option>
                {profiles?.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.first_name} {profile.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en títulos y contenido..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de posts programados */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay posts programados que coincidan con los filtros.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <Badge variant={STATUS_COLORS[post.status]}>
                        {STATUS_LABELS[post.status]}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {post.content || post.summary}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Programado: {formatScheduledDate(post.scheduled_at)}</span>
                      </div>
                      
                      {post.published_at && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Publicado: {formatPublishedDate(post.published_at)}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-1">
                        <span>Perfil: {getProfileName(post.linkedin_profile_id)}</span>
                      </div>
                    </div>

                    {post.error_message && (
                      <Alert type="error" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        {post.error_message}
                      </Alert>
                    )}

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.hashtags.map((hashtag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {post.news_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(post.news?.source_url, '_blank')}
                        title="Ver noticia original"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}

                    {post.status === 'scheduled' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelPost(post.id)}
                          disabled={isCancelling}
                          className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={isDeleting}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
