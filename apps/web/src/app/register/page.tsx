"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Mail, Linkedin } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al registrarse")
        setLoading(false)
        return
      }

      router.push("/login?registered=true")
    } catch (err) {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider)
    await signIn(provider, { redirect: true, callbackUrl: "/dashboard" })
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo size={80} className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold tracking-tight">Crear Cuenta</h1>
          <p className="mt-2 text-muted-foreground">
            Regístrate en segundos y empieza a publicar
          </p>
        </div>

        {!showEmailForm && (
          <>
            <div className="space-y-3">
              <button
                onClick={() => handleSocialLogin("linkedin")}
                disabled={socialLoading !== null}
                className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-[#0A66C2] bg-[#0A66C2] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0055A4] hover:shadow-md disabled:opacity-50"
              >
                <Linkedin className="h-5 w-5" />
                {socialLoading === "linkedin" ? "Conectando..." : "Registrarse con LinkedIn"}
              </button>

              <button
                onClick={() => handleSocialLogin("google")}
                disabled={socialLoading !== null}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-input bg-white px-8 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {socialLoading === "google" ? "Conectando..." : "Registrarse con Google"}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Otras opciones</span>
              </div>
            </div>

            <button
              onClick={() => setShowEmailForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-background px-8 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              Registrarse con correo y contraseña
            </button>
          </>
        )}

        {showEmailForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="usuario123"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-backdrop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="********"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Crear Cuenta"}
            </button>

            <button
              type="button"
              onClick={() => { setShowEmailForm(false); setError("") }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Volver a opciones sociales
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
