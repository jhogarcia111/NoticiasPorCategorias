import { Button } from '../common/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card'
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react'

export const AuthFallback = ({ error, onRetry, onLogin, onContinue, user }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Problema de Autenticación
          </CardTitle>
          <CardDescription>
            Hubo un problema al cargar tu sesión. Puedes intentar nuevamente o iniciar sesión.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="text-sm text-yellow-700">
                <strong>Error:</strong> {error.message || 'Error desconocido'}
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            {user && onContinue && (
              <Button
                onClick={onContinue}
                className="w-full"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Continuar sin perfil
              </Button>
            )}
            <Button
              onClick={onRetry}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
            <Button
              variant="outline"
              onClick={onLogin}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Ir a Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
