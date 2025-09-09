import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { Button } from '../common/Button'
import { Users, Calendar, AlertTriangle, TrendingUp, Settings, RefreshCw, Newspaper, Linkedin, Clock, LogOut } from 'lucide-react'
import { NewsManager } from '../news/NewsManager'
import { LinkedInProfilesManager } from '../linkedin/LinkedInProfilesManager'
import { SchedulingConfig } from '../scheduling/SchedulingConfig'
import { ScheduledPostsManager } from '../scheduling/ScheduledPostsManager'
import { AutoScheduleNews } from '../scheduling/AutoScheduleNews'

export const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    postsFailed: 0,
    errorRate: 0
  }) // TODO: Fetch from API

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-gray-600">Gestiona la plataforma de noticias</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2 overflow-x-auto">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('overview')}
                className={activeTab === 'overview' ? 'bg-blue-50 border-blue-500' : ''}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('news')}
                className={activeTab === 'news' ? 'bg-blue-50 border-blue-500' : ''}
              >
                <Newspaper className="h-4 w-4 mr-2" />
                Noticias
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('linkedin')}
                className={activeTab === 'linkedin' ? 'bg-blue-50 border-blue-500' : ''}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('scheduling')}
                className={activeTab === 'scheduling' ? 'bg-blue-50 border-blue-500' : ''}
              >
                <Clock className="h-4 w-4 mr-2" />
                Programación
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('ai')}
                className={activeTab === 'ai' ? 'bg-blue-50 border-blue-500' : ''}
              >
                <Settings className="h-4 w-4 mr-2" />
                IA
              </Button>
              </div>
              
              {/* Botón de cerrar sesión */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'overview' && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Usuarios
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.activeUsers} activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Posts Publicados
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <p className="text-xs text-muted-foreground">
                  Este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Posts Fallidos
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.postsFailed}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tasa de Error
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.errorRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.errorRate > 5 ? 'Alta - Revisar' : 'Normal'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fuentes Activas
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  NewsAPI + RSS
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Posts Over Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Publicaciones por Día</CardTitle>
                <CardDescription>
                  Tendencia de publicaciones en los últimos 7 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Gráfica de publicaciones</p>
                    <p className="text-sm">(Implementar con Recharts)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Types Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Errores</CardTitle>
                <CardDescription>
                  Distribución de errores por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Gráfica de errores</p>
                    <p className="text-sm">(Implementar con Recharts)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra usuarios y permisos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Ver Todos los Usuarios
                  </Button>
                  <Button className="w-full" variant="outline">
                    Crear Usuario Admin
                  </Button>
                  <Button className="w-full" variant="outline">
                    Reportes de Usuarios
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sources Management */}
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Fuentes</CardTitle>
                <CardDescription>
                  Configura fuentes de noticias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Ver Fuentes Activas
                  </Button>
                  <Button className="w-full" variant="outline">
                    Agregar Nueva Fuente
                  </Button>
                  <Button className="w-full" variant="outline">
                    Forzar Recolección
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Management */}
            <Card>
              <CardHeader>
                <CardTitle>Sistema</CardTitle>
                <CardDescription>
                  Herramientas de mantenimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Ver Logs del Sistema
                  </Button>
                  <Button className="w-full" variant="outline">
                    Backup de Datos
                  </Button>
                  <Button className="w-full" variant="outline">
                    Configuración IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
            </>
          )}

          {activeTab === 'news' && (
            <NewsManager />
          )}

          {activeTab === 'linkedin' && (
            <LinkedInProfilesManager />
          )}

          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Configuración de Programación</h2>
                  <SchedulingConfig />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Programar Noticias</h2>
                  <AutoScheduleNews />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Posts Programados</h2>
                <ScheduledPostsManager />
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de IA</h3>
                <p className="text-gray-600">Funcionalidades de IA próximamente</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
