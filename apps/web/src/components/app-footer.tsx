"use client"

interface AppFooterProps {
  onVersionClick: () => void
}

export function AppFooter({ onVersionClick }: AppFooterProps) {
  return (
    <footer className="sticky bottom-0 z-50 w-full bg-background" style={{ borderTop: "15px" }}>
      <div className="h-1 bg-gradient-to-r from-primary/80 to-primary/30" />
      <div className="flex items-center justify-between px-4 text-xs" style={{ height: "30px" }}>
        <span className="text-muted-foreground font-medium">NoticiasPorCategorias</span>
        <button
          onClick={onVersionClick}
          className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-2 cursor-pointer"
        >
          v1.1.0
        </button>
      </div>
    </footer>
  )
}
