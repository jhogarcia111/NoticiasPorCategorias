import { useState } from 'react'
import { Button } from '../common/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { Badge } from '../common/Badge'
import { Alert } from '../common/Alert'
import { 
  Linkedin, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  User,
  Mail,
  Calendar
} from 'lucide-react'
import { useLinkedInProfiles, useLinkedInAuth, useDisconnectLinkedIn } from '../../hooks/useLinkedIn'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const LinkedInProfilesManager = () => {
  const { profiles, isLoading, error } = useLinkedInProfiles()
  const { connectProfile, isConnecting } = useLinkedInAuth()
  const disconnectMutation = useDisconnectLinkedIn()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleConnect = () => {
    connectProfile()
  }

  const handleDisconnect = async (profileId) => {
    if (window.confirm('¿Estás seguro de que quieres desconectar este perfil de LinkedIn?')) {
      try {
        await disconnectMutation.mutateAsync(profileId)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } catch (error) {
        console.error('Error disconnecting profile:', error)
      }
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  const isTokenExpired = (expiresAt) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando perfiles...</p>
            <p className="text-sm text-gray-500 mt-1">Si no tienes perfiles conectados, haz clic en "Conectar Perfil"</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert type="error">
          <AlertCircle className="h-4 w-4" />
          Error al cargar los perfiles: {error.message}
        </Alert>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Linkedin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No se pudieron cargar los perfiles</p>
              <p className="text-sm mb-4">
                Esto puede ser porque no tienes perfiles conectados o hay un problema de conexión.
              </p>
              <Button onClick={handleConnect} disabled={isConnecting}>
                <Plus className="h-4 w-4 mr-2" />
                Conectar Primer Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert type="success">
          <CheckCircle className="h-4 w-4" />
          Perfil desconectado exitosamente
        </Alert>
      )}

      {/* Header con botón de conectar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Linkedin className="h-5 w-5 text-blue-600" />
              <span>Perfiles de LinkedIn</span>
            </div>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              loading={isConnecting}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isConnecting ? 'Conectando...' : 'Conectar Perfil'}
            </Button>
          </CardTitle>
          <CardDescription>
            Conecta tus perfiles de LinkedIn para programar publicaciones automáticas
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Lista de perfiles */}
      {!profiles || profiles.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Linkedin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No tienes perfiles conectados</p>
              <p className="text-sm mb-4">
                Conecta tu perfil de LinkedIn para comenzar a programar publicaciones automáticas
              </p>
              <Button onClick={handleConnect} disabled={isConnecting}>
                <Plus className="h-4 w-4 mr-2" />
                Conectar Primer Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {profiles.map(profile => (
            <Card key={profile.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {profile.profile_picture_url ? (
                        <img
                          src={profile.profile_picture_url}
                          alt={`${profile.first_name} ${profile.last_name}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Información del perfil */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {profile.first_name} {profile.last_name}
                        </h3>
                        {profile.is_primary && (
                          <Badge variant="info">Principal</Badge>
                        )}
                        {!profile.is_active && (
                          <Badge variant="gray">Inactivo</Badge>
                        )}
                        {isTokenExpired(profile.token_expires_at) && (
                          <Badge variant="warning">Token Expirado</Badge>
                        )}
                      </div>

                      {profile.email && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{profile.email}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>Conectado: {formatDate(profile.created_at)}</span>
                      </div>

                      {profile.token_expires_at && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Token expira: {formatDate(profile.token_expires_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://linkedin.com/in/${profile.linkedin_id}`, '_blank')}
                      title="Ver perfil en LinkedIn"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(profile.id)}
                      disabled={disconnectMutation.isPending}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 space-y-2">
            <h4 className="font-medium text-gray-900">Información importante:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Puedes conectar múltiples perfiles de LinkedIn</li>
              <li>Cada perfil puede tener su propia configuración de programación</li>
              <li>Los tokens de acceso expiran periódicamente y necesitan renovación</li>
              <li>Al desconectar un perfil, se cancelarán todas las publicaciones programadas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
