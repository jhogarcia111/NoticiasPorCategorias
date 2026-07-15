"use client"

import { useSession, signOut, signIn } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Settings, LogOut, ChevronDown, Menu, X, User, Newspaper } from "lucide-react"
import { Logo } from "./logo"
import { EditProfileDialog } from "./edit-profile-dialog"

const landingLinks = [
  { href: "#beneficios", label: "Beneficios" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#precios", label: "Precios" },
  { href: "#faq", label: "FAQ" },
]

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isLanding = pathname === "/"
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
        <Link href={session ? "/dashboard" : "/"} className="flex shrink-0 items-center gap-2">
          <Logo size={36} />
          <span className="text-lg font-bold text-[#0A66C2] hidden sm:inline">NewsLinked</span>
        </Link>

        {session ? (
          <>
            <div ref={ref} className="relative ml-auto">
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
            {/* Desktop nav */}
            <div className="hidden items-center gap-6 md:flex">
              {isLanding && landingLinks.map((l) => (
                <a key={l.href} href={l.href}
                  className="text-sm font-medium text-muted-foreground hover:text-[#0A66C2] transition-colors"
                  onClick={(e) => { e.preventDefault(); document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" }) }}
                >{l.label}</a>
              ))}
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-[#0A66C2] transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0055A4] transition-colors"
              >
                Comenzar gratis
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-center rounded-md p-2 md:hidden hover:bg-muted"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {!session && mobileOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {isLanding && landingLinks.map((l) => (
              <a key={l.href} href={l.href}
                className="block text-sm font-medium text-muted-foreground hover:text-[#0A66C2] py-1"
                onClick={(e) => { e.preventDefault(); document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" }); setMobileOpen(false) }}
              >{l.label}</a>
            ))}
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
              Comenzar gratis
            </Link>
          </div>
        </div>
      )}
      <EditProfileDialog isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
    </nav>
  )
}
