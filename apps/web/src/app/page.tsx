import Link from "next/link"
import { Logo } from "@/components/logo"

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <Logo size={96} className="mx-auto" />

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-[#0A66C2] md:text-5xl">
            NoticiasPorCategorías
          </h1>
          <p className="text-xl text-muted-foreground">
            De la noticia a la oportunidad
          </p>
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            Organiza, categoriza y publica noticias profesionales en LinkedIn de forma automática con inteligencia artificial.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-[#0A66C2] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0055A4]"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            Registrarse
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10">
              <svg className="h-5 w-5 text-[#0A66C2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="font-semibold">Noticias curadas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Recolecta noticias de múltiples fuentes organizadas por categorías y nichos.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10">
              <svg className="h-5 w-5 text-[#0A66C2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h3 className="font-semibold">Contenido con IA</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              La IA genera resúmenes, hashtags y publicaciones optimizadas para LinkedIn.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1DB954]/10">
              <svg className="h-5 w-5 text-[#1DB954]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 19l6-6-6-6m-6 12l6-6-6-6" />
              </svg>
            </div>
            <h3 className="font-semibold">Crecimiento profesional</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Publica consistentemente y convierte interacciones en oportunidades reales.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
