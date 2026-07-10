"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Settings, LogOut, ChevronDown, Menu, X, User } from "lucide-react"
import { Logo } from "./logo"
import { EditProfileDialog } from "./edit-profile-dialog"

export function Navbar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const user = session?.user
  const initials = (user?.name || user?.email || "U").charAt(0).toUpperCase()

  return (
    <nav className="sticky top-0 z-50 h-16 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href={session ? "/dashboard" : "/"} className="flex shrink-0 items-center">
          <Logo size={42} />
        </Link>

        {session ? (
          <>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-semibold">📰 NoticiasPorCategorias</span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">v1.1.0</span>
            </div>
          <div ref={ref} className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A66C2]/10 text-xs font-bold text-[#0A66C2]">
                {initials}
              </div>
              <span className="hidden text-sm font-medium md:inline max-w-[120px] truncate">
                {user?.name || "Mi cuenta"}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border bg-white py-1 shadow-lg z-50">
                <div className="border-b px-3 py-2">
                  <p className="truncate text-sm font-medium">{user?.name || "Usuario"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setIsOpen(false); setShowEditProfile(true) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <User className="h-4 w-4" />
                  Editar Perfil
                </button>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                  Panel de Control
                </Link>
                <hr className="my-1" />
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-center rounded-md p-2 md:hidden hover:bg-muted"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Desktop nav */}
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[#0A66C2] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0055A4]"
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {!session && mobileOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="block rounded-md bg-[#0A66C2] px-3 py-2 text-sm font-medium text-white text-center hover:bg-[#0055A4]"
            >
              Registrarse
            </Link>
          </div>
        </div>
      )}
      <EditProfileDialog isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
    </nav>
  )
}
