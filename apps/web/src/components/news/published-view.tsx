"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ExternalLink, Linkedin, Calendar, Globe, Loader2, Clock, CheckCircle } from "lucide-react"

export function PublishedView() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return
    setLoading(true)
    fetch(`/api/scheduling?userId=${session.user.id}&type=posts&status=published`)
      .then(r => r.json())
      .then(d => {
        setPosts(Array.isArray(d.data) ? d.data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Linkedin className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="text-base font-medium">No hay publicaciones en LinkedIn aun</p>
        <p className="text-sm mt-1">Las noticias que publiques apareceran aqui</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Publicaciones en LinkedIn</h3>
          <p className="text-xs text-muted-foreground">{posts.length} publicacion{posts.length !== 1 ? "es" : ""} realizada{posts.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div className="space-y-3">
        {posts.map((post: any) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-[#0A66C2]/10">
                      <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] font-normal">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Publicado
                    </Badge>
                    {post.scheduledAt && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.scheduledAt).toLocaleDateString("es-ES", {
                          day: "numeric", month: "long", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    )}
                  </div>
                  {post.title && (
                    <p className="text-sm font-semibold text-foreground mb-1">{post.title}</p>
                  )}
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {post.content || post.postContent || "Sin contenido"}
                  </p>
                </div>
              </div>
              {post.news?.sourceUrl && (
                <div className="mt-3 pt-3 border-t flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => window.open(post.news.sourceUrl, "_blank")} className="h-7 text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver fuente original
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
