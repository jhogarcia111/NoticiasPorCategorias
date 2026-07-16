"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Credenciales inválidas")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider)
    await signIn(provider, { redirect: true, callbackUrl: "/dashboard" })
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:p-8">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border bg-white shadow-xl">
        <div className="hidden w-1/2 bg-gradient-to-br from-[#0A66C2] to-blue-800 p-10 text-white md:flex md:flex-col md:justify-center md:gap-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <span className="text-xl font-bold">Noticias</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Bienvenido de vuelta
            </h2>
            <p className="mt-3 text-blue-200 leading-relaxed">
              Inicia sesión con tu red social favorita. Es más rápido y seguro.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={socialLoading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 shadow-lg transition-all hover:bg-gray-50 hover:-translate-y-0.5 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {socialLoading === "google" ? "Conectando..." : "Iniciar sesión con Google"}
            </button>

            <button
              onClick={() => handleSocialLogin("linkedin")}
              disabled={socialLoading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20 hover:-translate-y-0.5 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {socialLoading === "linkedin" ? "Conectando..." : "Iniciar sesión con LinkedIn"}
            </button>

            <p className="text-center text-xs text-blue-200">
              Al iniciar sesión aceptas nuestros{" "}
              <span className="underline cursor-pointer">términos y condiciones</span>
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-center p-8 md:w-1/2 md:p-12">
          <Logo size={100} className="mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">Con tu correo y contraseña</p>

          <form onSubmit={handleSubmit} className="mt-8 w-full max-w-sm space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="********"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </button>

            <div className="flex items-center justify-between">
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>

          {/* Social buttons for mobile (hidden on md+) */}
          <div className="mt-8 w-full max-w-sm space-y-3 md:hidden">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">O accede con</span>
              </div>
            </div>
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={socialLoading !== null}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-background px-8 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              onClick={() => handleSocialLogin("linkedin")}
              disabled={socialLoading !== null}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-background px-8 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
