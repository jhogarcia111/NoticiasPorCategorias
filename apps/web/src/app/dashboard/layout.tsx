"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { DashboardProvider, useDashboard, type Tab } from "./dashboard-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Newspaper, Brain, Calendar, Settings,
  Menu, X, LogOut, Linkedin, Shield, Gem,
  ChevronLeft, ChevronRight,
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
  items.push({ id: "subscription", label: "Premium", icon: Gem })
  if (role === "admin") {
    items.push({ id: "admin", label: "Admin", icon: Shield })
  }
  return items
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab, aiSidebarOpen, setAiSidebarOpen } = useDashboard()
  const [navCollapsed, setNavCollapsed] = useState(false)
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
        "fixed top-0 left-0 z-50 h-full bg-white border-r flex flex-col transition-all duration-300",
        navCollapsed ? "w-16" : "w-60",
        "-translate-x-full lg:translate-x-0",
        sidebarOpen && "translate-x-0",
      )}>
        <div className={cn("h-16 border-b flex items-center gap-3", navCollapsed ? "px-3 justify-center" : "px-5")}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Newspaper className="h-4 w-4 text-white" />
          </div>
          {!navCollapsed && (
            <>
              <span className="font-bold text-base text-foreground">Noticias</span>
              <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 rounded-md hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </>
          )}
          {navCollapsed && (
            <button onClick={() => setNavCollapsed(false)} className="p-1 rounded-md hover:bg-muted absolute -right-3 top-4 bg-white border shadow-sm">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {!navCollapsed && (
          <button onClick={() => setNavCollapsed(true)}
            className="absolute top-4 -right-3 p-1 rounded-full bg-white border shadow-sm hover:bg-muted z-10">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        <nav className={cn("flex-1 py-4 space-y-1 overflow-y-auto", navCollapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                  navCollapsed ? "justify-center p-2.5" : "px-3 py-2.5",
                  activeTab === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={navCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", activeTab === item.id && "text-primary")} />
                {!navCollapsed && <span>{item.label}</span>}
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

      <div className={cn("min-h-screen transition-all duration-300", navCollapsed ? "lg:pl-16" : "lg:pl-60")}>
          <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b flex items-center justify-between px-4 lg:px-8">
            <h1 className="text-lg font-semibold ml-10 lg:ml-0 flex items-center gap-3">
              {activeTab === "ai" && (
                <button onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title={aiSidebarOpen ? "Ocultar panel" : "Mostrar panel"}>
                  {aiSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
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
