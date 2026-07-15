"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { DashboardProvider, useDashboard, type Tab } from "./dashboard-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Newspaper, Brain, Calendar, Settings,
  Menu, X, LogOut, Linkedin, Shield, CreditCard,
} from "lucide-react"

function getNavItems(role?: string): { id: Tab; label: string; icon: any }[] {
  const items: { id: Tab; label: string; icon: any }[] = [
    { id: "home", label: "Inicio", icon: LayoutDashboard },
    { id: "news", label: "Noticias", icon: Newspaper },
    { id: "ai", label: "IA", icon: Brain },
    { id: "calendar", label: "Calendario", icon: Calendar },
    { id: "published", label: "Publicadas", icon: Linkedin },
    { id: "config", label: "Configuración", icon: Settings },
  ]
  items.push({ id: "subscription", label: "Suscripción", icon: CreditCard })
  if (role === "admin") {
    items.push({ id: "admin", label: "Admin", icon: Shield })
  }
  return items
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useDashboard()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navItems = getNavItems(session?.user?.role)

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-white border shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-60 bg-white border-r flex flex-col transition-transform duration-300",
        "-translate-x-full lg:translate-x-0",
        sidebarOpen && "translate-x-0",
      )}>
        <div className="h-16 px-5 border-b flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Newspaper className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base text-foreground">NotiPress</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", activeTab === item.id && "text-primary")} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {(session?.user?.name || "U")[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name || "Usuario"}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email || ""}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60 min-h-screen">
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b flex items-center justify-between px-4 lg:px-8">
          <h1 className="text-lg font-semibold ml-10 lg:ml-0">
            {navItems.find(n => n.id === activeTab)?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  )
}
