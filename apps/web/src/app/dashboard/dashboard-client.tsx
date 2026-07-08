"use client"

import { signOut } from "next-auth/react"
import { Session } from "next-auth"
import { useState } from "react"

interface DashboardClientProps {
  user: Session["user"]
}

type Tab = "news" | "linkedin" | "scheduling" | "ai"

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("news")

  const tabs: { id: Tab; label: string }[] = [
    { id: "news", label: "Noticias" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "scheduling", label: "Programaci\u00f3n" },
    { id: "ai", label: "IA" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-8">
          <h1 className="text-xl font-semibold">Panel de Control</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive hover:bg-destructive/20"
            >
              Cerrar Sesi\u00f3n
            </button>
          </div>
        </div>
      </header>

      <div className="border-b">
        <div className="flex gap-0 px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="p-8">
        {activeTab === "news" && <NewsTab />}
        {activeTab === "linkedin" && <LinkedInTab />}
        {activeTab === "scheduling" && <SchedulingTab />}
        {activeTab === "ai" && <AITab />}
      </main>
    </div>
  )
}

function NewsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gesti\u00f3n de Noticias</h2>
      <p className="text-muted-foreground">
        Administra las noticias recolectadas, organiza por categor\u00edas y procesa con IA.
      </p>
    </div>
  )
}

function LinkedInTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Perfiles de LinkedIn</h2>
      <p className="text-muted-foreground">
        Conecta y administra tus perfiles de LinkedIn para publicar contenido.
      </p>
      <a
        href="/api/linkedin/auth-url"
        className="inline-flex items-center rounded-md bg-primary px-6 py-2 text-sm text-primary-foreground hover:bg-primary/90"
      >
        Conectar LinkedIn
      </a>
    </div>
  )
}

function SchedulingTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Programaci\u00f3n de Publicaciones</h2>
      <p className="text-muted-foreground">
        Configura horarios y frecuencia de publicaciones autom\u00e1ticas en LinkedIn.
      </p>
    </div>
  )
}

function AITab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Contenido con IA</h2>
      <p className="text-muted-foreground">
        Genera res\u00famenes, hashtags y contenido optimizado para LinkedIn usando inteligencia artificial.
      </p>
    </div>
  )
}
