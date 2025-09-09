import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card'
import { Alert } from '../common/Alert'
import { Button } from '../common/Button'
import { CheckCircle, AlertCircle, Linkedin, Loader2 } from 'lucide-react'
import { useLinkedInAuth } from '../../hooks/useLinkedIn'
import { useAuth } from '../../contexts/AuthContext'

export const LinkedInCallback = () => {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('')
  const { handleAuthCallback, isConnecting } = useLinkedInAuth()
  const { clearError } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let isProcessing = false

    const processCallback = async () => {
      // Evitar múltiples ejecuciones
      if (isProcessing) {
        console.log('LinkedInCallback - Already processing, skipping...')
        return
      }
      
      isProcessing = true
      
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        console.log('LinkedInCallback - Processing callback:', { code: !!code, error, errorDescription })

        if (error) {
          setStatus('error')
          setMessage(`Error de autorización: ${errorDescription || error}`)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No se recibió código de autorización de LinkedIn')
          return
        }

        setStatus('processing')
        setMessage('Procesando autorización...')

        // Limpiar cualquier error previo del AuthContext
        clearError()
        
             console.log('LinkedInCallback - Calling handleAuthCallback with code:', code.substring(0, 10) + '...')
             const result = await handleAuthCallback(code)
             
             console.log('LinkedInCallback - Result:', result)
             console.log('LinkedInCallback - Result success:', result.success)
             console.log('LinkedInCallback - Result error:', result.error)
        
             if (result.success) {
               setStatus('success')
               setMessage('¡Perfil de LinkedIn conectado exitosamente!')
               
               // Limpiar la URL para evitar problemas de estado
               window.history.replaceState({}, document.title, '/')
               
               // Redirigir al dashboard después de 2 segundos
               setTimeout(() => {
                 navigate('/')
               }, 2000)
             } else {
               setStatus('error')
               setMessage(`Error al conectar perfil: ${result.error}`)
               
               // Agregar botón para reintentar
               setTimeout(() => {
                 setMessage(`Error al conectar perfil: ${result.error}. ¿Quieres reintentar?`)
               }, 1000)
             }
      } catch (error) {
        console.error('LinkedInCallback - Error:', error)
        setStatus('error')
        setMessage(`Error inesperado: ${error.message}`)
      } finally {
        isProcessing = false
      }
    }

    processCallback()
  }, []) // Remover dependencias para evitar re-ejecuciones

  const handleRetry = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'processing' && (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="flex items-center justify-center space-x-2">
            <Linkedin className="h-5 w-5 text-blue-600" />
            <span>Conectando con LinkedIn</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'processing' && (
            <div className="text-center">
              <p className="text-gray-600">{message}</p>
              <div className="mt-4">
                <div className="animate-pulse bg-blue-100 h-2 rounded-full">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <Alert type="success">
              <CheckCircle className="h-4 w-4" />
              {message}
            </Alert>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert type="error">
                <AlertCircle className="h-4 w-4" />
                {message}
              </Alert>
              <Button onClick={handleRetry} className="w-full">
                Volver al Dashboard
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center text-sm text-gray-500">
              <p>Redirigiendo al dashboard...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
