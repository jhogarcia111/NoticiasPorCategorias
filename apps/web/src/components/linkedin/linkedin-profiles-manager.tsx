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
  ShieldCheck,
  ShieldAlert,
  Loader2,
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
    if (window.confirm("¿Estas seguro de que quieres desconectar este perfil de LinkedIn?")) {
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
      return "Fecha invalida"
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
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="p-4 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Perfil desconectado exitosamente
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#0A66C2]/10">
            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Perfiles de LinkedIn</h3>
            <p className="text-xs text-muted-foreground">Conecta tus perfiles para programar publicaciones</p>
          </div>
        </div>
        <Button onClick={connectProfile} disabled={isConnecting} className="h-9 text-xs">
          {isConnecting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
          {isConnecting ? "Conectando..." : "Conectar Perfil"}
        </Button>
      </div>

      {queryError && (
        <div className="p-4 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Error al cargar los perfiles: {queryError.message}
          </div>
        </div>
      )}

      {!profiles || profiles.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <div className="p-3 rounded-full bg-muted w-fit mx-auto mb-4">
                <Linkedin className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium mb-1">No tienes perfiles conectados</p>
              <p className="text-xs mb-4">Conecta tu perfil de LinkedIn para comenzar a programar publicaciones</p>
              <Button onClick={connectProfile} disabled={isConnecting} size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Conectar Primer Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((profile: any) => {
            const expired = isTokenExpired(profile.tokenExpiresAt)
            return (
              <Card key={profile.id} className={cn(!profile.isActive && "opacity-70")}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {profile.profilePictureUrl ? (
                        <img
                          src={profile.profilePictureUrl}
                          alt={`${profile.firstName} ${profile.lastName}`}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-offset-1 ring-muted"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-[#0A66C2]/10 flex items-center justify-center ring-2 ring-offset-1 ring-muted">
                          <User className="h-6 w-6 text-[#0A66C2]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-foreground">
                          {profile.firstName} {profile.lastName}
                        </h4>
                        {profile.isPrimary && <Badge variant="default" className="text-[10px] h-5">Principal</Badge>}
                        {!profile.isActive && <Badge variant="secondary" className="text-[10px] h-5">Inactivo</Badge>}
                      </div>
                      {profile.email && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {profile.email}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(profile.createdAt)}
                        </span>
                        {expired ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <ShieldAlert className="h-3 w-3" />
                            Token expirado
                          </span>
                        ) : profile.tokenExpiresAt ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <ShieldCheck className="h-3 w-3" />
                            Token vigente
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1.5 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://linkedin.com/in/${profile.linkedin_id}`, "_blank")}
                          className="h-7 text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver perfil
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(profile.id)}
                          disabled={disconnectMutation.isPending}
                          className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          {disconnectMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground">Informacion importante:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Puedes conectar multiples perfiles de LinkedIn</li>
              <li>Cada perfil puede tener su propia configuracion de programacion</li>
              <li>Los tokens de acceso expiran periodicamente y necesitan renovacion</li>
              <li>Al desconectar un perfil, se cancelaran todas las publicaciones programadas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
