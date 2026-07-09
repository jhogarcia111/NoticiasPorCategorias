"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useScheduling } from "@/hooks/use-scheduling"
import { useLinkedInProfiles } from "@/hooks/use-linkedin"
import { Clock, Calendar, Settings, Save, RefreshCw } from "lucide-react"

const DAYS = [
  { key: "monday", label: "Lunes", short: "L" },
  { key: "tuesday", label: "Martes", short: "M" },
  { key: "wednesday", label: "Miércoles", short: "X" },
  { key: "thursday", label: "Jueves", short: "J" },
  { key: "friday", label: "Viernes", short: "V" },
  { key: "saturday", label: "Sábado", short: "S" },
  { key: "sunday", label: "Domingo", short: "D" },
]

export function SchedulingConfig() {
  const { configs, saveConfig, isSaving, error } = useScheduling()
  const { data: profilesData } = useLinkedInProfiles()
  const profiles = profilesData?.data || []
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      enabled: true,
      timezone: "America/Mexico_City",
      auto_generate_content: true,
      include_hashtags: true,
      include_summary: true,
      include_image: true,
      monday_enabled: true,
      monday_start_time: "09:00",
      monday_end_time: "17:00",
      monday_posts_count: 3,
      tuesday_enabled: true,
      tuesday_start_time: "09:00",
      tuesday_end_time: "17:00",
      tuesday_posts_count: 3,
      wednesday_enabled: true,
      wednesday_start_time: "09:00",
      wednesday_end_time: "17:00",
      wednesday_posts_count: 3,
      thursday_enabled: true,
      thursday_start_time: "09:00",
      thursday_end_time: "17:00",
      thursday_posts_count: 3,
      friday_enabled: true,
      friday_start_time: "09:00",
      friday_end_time: "17:00",
      friday_posts_count: 3,
      saturday_enabled: false,
      saturday_start_time: "10:00",
      saturday_end_time: "14:00",
      saturday_posts_count: 1,
      sunday_enabled: false,
      sunday_start_time: "10:00",
      sunday_end_time: "14:00",
      sunday_posts_count: 1,
    },
  })

  useEffect(() => {
    if (selectedProfile && configs) {
      const existingConfig = configs.find(
        (c: any) => c.linkedin_profile_id === selectedProfile.id
      )
      if (existingConfig) {
        Object.keys(existingConfig).forEach((key) => {
          if (
            key !== "id" &&
            key !== "user_id" &&
            key !== "linkedin_profile_id" &&
            key !== "created_at" &&
            key !== "updated_at"
          ) {
            setValue(key as any, existingConfig[key])
          }
        })
      }
    }
  }, [selectedProfile, configs, setValue])

  const onSubmit = async (data: any) => {
    if (!selectedProfile) return
    try {
      await saveConfig(selectedProfile.id, data)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving config:", error)
    }
  }

  const copyToAllDays = (dayKey: string, field: string) => {
    const value = watch(`${dayKey}_${field}` as any)
    DAYS.forEach((day) => {
      if (day.key !== dayKey) {
        setValue(`${day.key}_${field}` as any, value)
      }
    })
  }

  if (!profiles || profiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No tienes perfiles de LinkedIn configurados.</p>
            <p className="text-sm">Configura un perfil primero para programar publicaciones.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="p-4 rounded-md text-sm bg-green-50 text-green-800 border border-green-200">
          <Save className="h-4 w-4 inline mr-2" />
          Configuración guardada exitosamente
        </div>
      )}

      {error && (
        <div className="p-4 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
          Error al cargar la configuración: {(error as Error).message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuración de Programación</span>
          </CardTitle>
          <CardDescription>
            Configura cuándo y cómo se publicarán automáticamente tus noticias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perfil de LinkedIn
              </label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onChange={(e) => {
                  const profile = profiles.find((p: any) => p.id === Number(e.target.value))
                  setSelectedProfile(profile)
                }}
                value={selectedProfile?.id || ""}
              >
                <option value="">Selecciona un perfil</option>
                {profiles.map((profile: any) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.first_name} {profile.last_name}
                  </option>
                ))}
              </select>
            </div>
            {selectedProfile && (
              <div className="flex items-center space-x-2">
                <Badge variant="default">Perfil seleccionado</Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedProfile.first_name} {selectedProfile.last_name}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProfile && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="enabled" {...register("enabled")} className="rounded border-gray-300" />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                  Habilitar programación automática
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                <select
                  {...register("timezone")}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="America/Mexico_City">México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                  <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "auto_generate_content", label: "Generar contenido automáticamente" },
                  { id: "include_hashtags", label: "Incluir hashtags" },
                  { id: "include_summary", label: "Incluir resumen" },
                  { id: "include_image", label: "Incluir imagen" },
                ].map(({ id, label }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <input type="checkbox" id={id} {...register(id as any)} className="rounded border-gray-300" />
                    <label htmlFor={id} className="text-sm text-gray-700">{label}</label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Horarios por Día</span>
              </CardTitle>
              <CardDescription>
                Configura cuántos posts y en qué horarios publicar cada día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS.map((day) => (
                  <div key={day.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`${day.key}_enabled`}
                          {...register(`${day.key}_enabled` as any)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`${day.key}_enabled`} className="font-medium text-gray-700">
                          {day.label}
                        </label>
                      </div>
                      <div className="flex space-x-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => copyToAllDays(day.key, "start_time")} title="Copiar hora de inicio">
                          <Clock className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => copyToAllDays(day.key, "end_time")} title="Copiar hora de fin">
                          <Clock className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => copyToAllDays(day.key, "posts_count")} title="Copiar cantidad de posts">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hora inicio</label>
                        <Input type="time" {...register(`${day.key}_start_time` as any)} className="text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hora fin</label>
                        <Input type="time" {...register(`${day.key}_end_time` as any)} className="text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Posts</label>
                        <Input type="number" min="0" max="10" {...register(`${day.key}_posts_count` as any, { valueAsNumber: true })} className="text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={!isDirty || isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
