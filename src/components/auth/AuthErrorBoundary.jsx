import { useState } from 'react'
import { Button } from '../common/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export const AuthErrorBoundary = ({ children, error, onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry?.()
    } finally {
      setIsRetrying(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Error de Autenticación
            </CardTitle>
            <CardDescription>
              Hubo un problema al cargar tu sesión. Por favor, intenta nuevamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {error.message || 'Error desconocido'}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Reintentando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Limpiar localStorage y recargar
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.reload()
                }}
                className="w-full"
              >
                Limpiar Sesión y Recargar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return children
}
