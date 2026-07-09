"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLinkedInProfiles, useLinkedInAuth, useDisconnectLinkedIn } from "@/hooks/use-linkedin"
import {
  Linkedin,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function LinkedInProfilesManager() {
  const { data: profilesData, isLoading, error } = useLinkedInProfiles()
  const { connectProfile, isConnecting } = useLinkedInAuth()
  const disconnectMutation = useDisconnectLinkedIn()
  const [showSuccess, setShowSuccess] = useState(false)

  const profiles = profilesData?.data || []
  const queryError = error as Error | null

  const handleDisconnect = async (profileId: number) => {
    if (window.confirm("¿Estás seguro de que quieres desconectar este perfil de LinkedIn?")) {
      try {
        await disconnectMutation.mutateAsync(profileId)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } catch (error) {
        console.error("Error disconnecting profile:", error)
      }
    }
  }

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
    } catch {
      return "Fecha inválida"
    }
  }

  const isTokenExpired = (expiresAt: string | Date | null | undefined) => {
    if (!expiresAt) return false
    try {
      return new Date(expiresAt) < new Date()
    } catch {
      return true
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando perfiles...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="p-4 rounded-md text-sm bg-green-50 text-green-800 border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Perfil desconectado exitosamente
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Linkedin className="h-5 w-5 text-blue-600" />
              <span>Perfiles de LinkedIn</span>
            </div>
            <Button onClick={connectProfile} disabled={isConnecting}>
              <Plus className="h-4 w-4 mr-2" />
              {isConnecting ? "Conectando..." : "Conectar Perfil"}
            </Button>
          </CardTitle>
          <CardDescription>
            Conecta tus perfiles de LinkedIn para programar publicaciones automáticas
          </CardDescription>
        </CardHeader>
      </Card>

      {queryError && (
        <div className="p-4 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Error al cargar los perfiles: {queryError.message}
          </div>
        </div>
      )}

      {!profiles || profiles.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Linkedin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No tienes perfiles conectados</p>
              <p className="text-sm mb-4">
                Conecta tu perfil de LinkedIn para comenzar a programar publicaciones automáticas
              </p>
              <Button onClick={connectProfile} disabled={isConnecting}>
                <Plus className="h-4 w-4 mr-2" />
                Conectar Primer Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile: any) => (
            <Card key={profile.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {profile.profilePictureUrl ? (
                        <img
                          src={profile.profilePictureUrl}
                          alt={`${profile.firstName} ${profile.lastName}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {profile.firstName} {profile.lastName}
                        </h3>
                        {profile.isPrimary && <Badge variant="default">Principal</Badge>}
                        {!profile.isActive && <Badge variant="secondary">Inactivo</Badge>}
                        {isTokenExpired(profile.tokenExpiresAt) && (
                          <Badge variant="warning">Token Expirado</Badge>
                        )}
                      </div>
                      {profile.email && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Conectado: {formatDate(profile.createdAt)}</span>
                      </div>
                      {profile.tokenExpiresAt && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Token expira: {formatDate(profile.tokenExpiresAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`https://linkedin.com/in/${profile.linkedin_id}`, "_blank")
                      }
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

      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-2">
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
