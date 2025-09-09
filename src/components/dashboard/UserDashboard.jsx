import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { Button } from '../common/Button'
import { Linkedin, Plus, Calendar, BarChart3 } from 'lucide-react'

export const UserDashboard = () => {
  const { user, profile } = useAuth()
  const [linkedinProfiles] = useState([]) // TODO: Fetch from API
  const [pendingPosts] = useState([]) // TODO: Fetch from API
  const [recentNews] = useState([]) // TODO: Fetch from API

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Hola, {profile?.username || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600">Gestiona tus publicaciones de LinkedIn</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Publicación
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Perfiles Conectados
                </CardTitle>
                <Linkedin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{linkedinProfiles.length}</div>
                <p className="text-xs text-muted-foreground">
                  {linkedinProfiles.length === 0 
                    ? 'Conecta tu primer perfil' 
                    : 'Perfiles activos'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Publicaciones Pendientes
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPosts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Programadas para publicar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Noticias Disponibles
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentNews.length}</div>
                <p className="text-xs text-muted-foreground">
                  Noticias recientes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connect LinkedIn Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Conectar Perfil de LinkedIn</CardTitle>
                <CardDescription>
                  Conecta tu perfil personal o de empresa para comenzar a publicar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {linkedinProfiles.length === 0 ? (
                  <div className="text-center py-6">
                    <Linkedin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      No tienes perfiles de LinkedIn conectados
                    </p>
                    <Button>
                      <Linkedin className="h-4 w-4 mr-2" />
                      Conectar Perfil
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {linkedinProfiles.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{profile.profile_name}</p>
                          <p className="text-sm text-gray-600">{profile.profile_type}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            Desconectar
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Otro Perfil
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent News */}
            <Card>
              <CardHeader>
                <CardTitle>Noticias Recientes</CardTitle>
                <CardDescription>
                  Últimas noticias disponibles para publicar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentNews.length === 0 ? (
                  <div className="text-center py-6">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No hay noticias disponibles en este momento
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentNews.slice(0, 3).map((news) => (
                      <div key={news.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-sm mb-1">{news.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {news.source_name} • {new Date(news.published_at).toLocaleDateString()}
                        </p>
                        <Button size="sm" variant="outline">
                          Ver Detalles
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      Ver Todas las Noticias
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
