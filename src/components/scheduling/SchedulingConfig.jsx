import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { Badge } from '../common/Badge'
import { Alert } from '../common/Alert'
import { Clock, Calendar, Settings, Save, RefreshCw } from 'lucide-react'
import { useScheduling } from '../../hooks/useScheduling'
import { useLinkedInProfiles } from '../../hooks/useLinkedIn'

const DAYS = [
  { key: 'monday', label: 'Lunes', short: 'L' },
  { key: 'tuesday', label: 'Martes', short: 'M' },
  { key: 'wednesday', label: 'Miércoles', short: 'X' },
  { key: 'thursday', label: 'Jueves', short: 'J' },
  { key: 'friday', label: 'Viernes', short: 'V' },
  { key: 'saturday', label: 'Sábado', short: 'S' },
  { key: 'sunday', label: 'Domingo', short: 'D' }
]

export const SchedulingConfig = () => {
  const { configs, saveConfig, isSaving, error } = useScheduling()
  const { profiles } = useLinkedInProfiles()
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      enabled: true,
      timezone: 'America/Mexico_City',
      auto_generate_content: true,
      include_hashtags: true,
      include_summary: true,
      include_image: true,
      // Días de la semana
      monday_enabled: true,
      monday_start_time: '09:00',
      monday_end_time: '17:00',
      monday_posts_count: 3,
      tuesday_enabled: true,
      tuesday_start_time: '09:00',
      tuesday_end_time: '17:00',
      tuesday_posts_count: 3,
      wednesday_enabled: true,
      wednesday_start_time: '09:00',
      wednesday_end_time: '17:00',
      wednesday_posts_count: 3,
      thursday_enabled: true,
      thursday_start_time: '09:00',
      thursday_end_time: '17:00',
      thursday_posts_count: 3,
      friday_enabled: true,
      friday_start_time: '09:00',
      friday_end_time: '17:00',
      friday_posts_count: 3,
      saturday_enabled: false,
      saturday_start_time: '10:00',
      saturday_end_time: '14:00',
      saturday_posts_count: 1,
      sunday_enabled: false,
      sunday_start_time: '10:00',
      sunday_end_time: '14:00',
      sunday_posts_count: 1
    }
  })

  // Cargar configuración existente cuando se selecciona un perfil
  useEffect(() => {
    if (selectedProfile && configs) {
      const existingConfig = configs.find(config => 
        config.linkedin_profile_id === selectedProfile.id
      )
      
      if (existingConfig) {
        // Cargar valores existentes
        Object.keys(existingConfig).forEach(key => {
          if (key !== 'id' && key !== 'user_id' && key !== 'linkedin_profile_id' && 
              key !== 'created_at' && key !== 'updated_at') {
            setValue(key, existingConfig[key])
          }
        })
      }
    }
  }, [selectedProfile, configs, setValue])

  const onSubmit = async (data) => {
    if (!selectedProfile) {
      alert('Por favor selecciona un perfil de LinkedIn')
      return
    }

    try {
      await saveConfig(selectedProfile.id, data)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
    }
  }

  const handleProfileChange = (profileId) => {
    const profile = profiles?.find(p => p.id === profileId)
    setSelectedProfile(profile)
  }

  const copyToAllDays = (dayKey, field) => {
    const value = watch(`${dayKey}_${field}`)
    DAYS.forEach(day => {
      if (day.key !== dayKey) {
        setValue(`${day.key}_${field}`, value)
      }
    })
  }

  if (!profiles || profiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
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
        <Alert type="success">
          <Save className="h-4 w-4" />
          Configuración guardada exitosamente
        </Alert>
      )}

      {error && (
        <Alert type="error">
          Error al cargar la configuración: {error.message}
        </Alert>
      )}

      {/* Selección de perfil */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleProfileChange(e.target.value)}
                value={selectedProfile?.id || ''}
              >
                <option value="">Selecciona un perfil</option>
                {profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} ({profile.profile_url})
                  </option>
                ))}
              </select>
            </div>

            {selectedProfile && (
              <div className="flex items-center space-x-2">
                <Badge variant="info">Perfil seleccionado</Badge>
                <span className="text-sm text-gray-600">{selectedProfile.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProfile && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Configuración general */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  {...register('enabled')}
                  className="rounded border-gray-300"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                  Habilitar programación automática
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona Horaria
                </label>
                <select
                  {...register('timezone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="America/Mexico_City">México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                  <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_generate_content"
                    {...register('auto_generate_content')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="auto_generate_content" className="text-sm text-gray-700">
                    Generar contenido automáticamente
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include_hashtags"
                    {...register('include_hashtags')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="include_hashtags" className="text-sm text-gray-700">
                    Incluir hashtags
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include_summary"
                    {...register('include_summary')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="include_summary" className="text-sm text-gray-700">
                    Incluir resumen
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include_image"
                    {...register('include_image')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="include_image" className="text-sm text-gray-700">
                    Incluir imagen
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración por días */}
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
                {DAYS.map(day => (
                  <div key={day.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`${day.key}_enabled`}
                          {...register(`${day.key}_enabled`)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`${day.key}_enabled`} className="font-medium text-gray-700">
                          {day.label}
                        </label>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToAllDays(day.key, 'start_time')}
                          title="Copiar hora de inicio a todos los días"
                        >
                          <Clock className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToAllDays(day.key, 'end_time')}
                          title="Copiar hora de fin a todos los días"
                        >
                          <Clock className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToAllDays(day.key, 'posts_count')}
                          title="Copiar cantidad de posts a todos los días"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hora inicio</label>
                        <Input
                          type="time"
                          {...register(`${day.key}_start_time`)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hora fin</label>
                        <Input
                          type="time"
                          {...register(`${day.key}_end_time`)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Posts</label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          {...register(`${day.key}_posts_count`, { valueAsNumber: true })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botón de guardar */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty || isSaving}
              loading={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
