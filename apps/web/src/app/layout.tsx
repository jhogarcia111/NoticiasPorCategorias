import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { FooterWrapper } from "@/components/footer-wrapper"

export const metadata: Metadata = {
  title: "Publicador de Noticias LinkedIn",
  description: "Herramienta para organizar y categorizar noticias en LinkedIn",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <FooterWrapper />
          </div>
        </Providers>
      </body>
    </html>
  )
}
