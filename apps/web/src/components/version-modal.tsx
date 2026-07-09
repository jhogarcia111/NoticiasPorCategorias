"use client"

import { useState } from "react"
import { changelogData, currentVersion } from "@/data/changelog"
import { cn } from "@/lib/utils"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

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

export function VersionModal({ isOpen, onClose }: VersionModalProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!isOpen) return null

  const entry = changelogData[activeIndex]
  const isCurrentVersion = entry.version === currentVersion

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

        <div className="flex items-center justify-center gap-2 px-6 py-3 border-b bg-muted/30">
          <button
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="p-1 disabled:opacity-30 hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {changelogData.map((v, i) => (
            <button
              key={v.version}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                i === activeIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
                v.version === currentVersion && i !== activeIndex && "ring-1 ring-primary/30"
              )}
            >
              {v.version}
              {v.version === currentVersion && " ★"}
            </button>
          ))}
          <button
            onClick={() => setActiveIndex(Math.min(changelogData.length - 1, activeIndex + 1))}
            disabled={activeIndex === changelogData.length - 1}
            className="p-1 disabled:opacity-30 hover:text-primary transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xl font-bold">{entry.version}</span>
            <span className="text-sm text-muted-foreground">— {entry.date}</span>
            {isCurrentVersion && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                Actual
              </span>
            )}
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground w-24">Tipo</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground w-32">Ubicación</th>
                <th className="text-left py-2 pl-4 font-medium text-muted-foreground">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {entry.changes.map((change, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded text-xs font-medium border",
                        typeColors[change.type] || "bg-gray-100 text-gray-800"
                      )}
                    >
                      {typeLabels[change.type] || change.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs font-mono">
                    {change.location || "—"}
                  </td>
                  <td className="py-3 pl-4">{change.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
