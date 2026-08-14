"use client"

import { useState } from "react"
import { changelogData, currentVersion } from "@/data/changelog"
import { cn } from "@/lib/utils"
import { ChevronDown, X } from "lucide-react"

interface VersionModalProps {
  isOpen: boolean
  onClose: () => void
}

const typeColors: Record<string, string> = {
  added: "bg-green-100 text-green-800 border-green-200",
  fixed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  changed: "bg-blue-100 text-blue-800 border-blue-200",
  removed: "bg-red-100 text-red-800 border-red-200",
}

const typeLabels: Record<string, string> = {
  added: "Añadido",
  fixed: "Corregido",
  changed: "Cambiado",
  removed: "Eliminado",
}

const typeOrder = ["added", "fixed", "changed", "removed"] as const

export function VersionModal({ isOpen, onClose }: VersionModalProps) {
  const [openVersion, setOpenVersion] = useState<string | null>(null)

  if (!isOpen) return null

  const toggle = (version: string) =>
    setOpenVersion((prev) => (prev === version ? null : version))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Historial de Versiones</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {changelogData.map((v) => {
            const isOpen = openVersion === v.version
            const isCurrent = v.version === currentVersion
            const counts = v.changes.reduce<Record<string, number>>((acc, c) => {
              acc[c.type] = (acc[c.type] || 0) + 1
              return acc
            }, {})

            return (
              <div key={v.version} className="border rounded-lg overflow-hidden bg-background">
                <button
                  onClick={() => toggle(v.version)}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-3 text-left transition-colors",
                    isOpen ? "bg-muted/50" : "hover:bg-muted/50"
                  )}
                >
                  <ChevronDown
                    className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                  />
                  <span className="font-semibold text-sm">{v.version}</span>
                  {isCurrent && (
                    <span className="text-xs text-primary font-semibold" title="Versión actual">
                      ★
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">— {v.date}</span>
                  <span className="ml-auto flex flex-wrap justify-end gap-1.5">
                    {typeOrder.map((t) =>
                      counts[t] ? (
                        <span
                          key={t}
                          className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border", typeColors[t])}
                        >
                          {counts[t]} {typeLabels[t]}
                        </span>
                      ) : null
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t px-4 py-1">
                    {v.changes.map((change, i) => (
                      <div key={i} className="flex items-start gap-3 py-2.5 border-b last:border-0">
                        <span
                          className={cn(
                            "shrink-0 w-20 text-center px-2 py-0.5 rounded text-xs font-medium border",
                            typeColors[change.type]
                          )}
                        >
                          {typeLabels[change.type] || change.type}
                        </span>
                        <span className="w-32 shrink-0 text-xs text-muted-foreground">{change.location || "—"}</span>
                        <span className="text-sm">{change.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
