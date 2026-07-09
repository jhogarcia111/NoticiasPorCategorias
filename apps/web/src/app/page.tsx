import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Publicador de Noticias LinkedIn
        </h1>
        <p className="text-lg text-muted-foreground">
          Organiza, categoriza y publica noticias profesionales en LinkedIn de forma automática.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  )
}
