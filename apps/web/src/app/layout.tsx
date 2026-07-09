import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Navbar } from "@/components/navbar"
import { FooterWrapper } from "@/components/footer-wrapper"

export const metadata: Metadata = {
  title: "NoticiasPorCategorías — Publicador de Noticias LinkedIn",
  description:
    "Organiza, categoriza y publica noticias profesionales en LinkedIn de forma automática con inteligencia artificial.",
  icons: [{ rel: "icon", url: "/favicon.png" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <FooterWrapper />
          </div>
        </Providers>
      </body>
    </html>
  )
}
