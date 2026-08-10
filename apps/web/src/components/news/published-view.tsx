"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ExternalLink, Linkedin, Calendar, Globe, Loader2, Clock, CheckCircle, Send } from "lucide-react"

export function PublishedView() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [publishingId, setPublishingId] = useState<number | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    setLoading(true)
    fetch(`/api/scheduling?userId=${session.user.id}&type=posts`)
      .then(r => r.json())
      .then(d => {
        setPosts(Array.isArray(d.data) ? d.data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session])

  const handlePublishPost = async (postId: number) => {
    setPublishingId(postId)
    try {
      const res = await fetch(`/api/linkedin/publish-due?postId=${postId}`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const postsRes = await fetch(`/api/scheduling?userId=${session?.user?.id}&type=posts`)
      const postsData = await postsRes.json()
      setPosts(Array.isArray(postsData.data) ? postsData.data : [])
    } catch (e: any) {
      alert(`Error al publicar: ${e.message}`)
    } finally {
      setPublishingId(null)
    }
  }

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
        <p className="text-sm mt-1">Las noticias que publiques o programes apareceran aqui</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Publicaciones en LinkedIn</h3>
          <p className="text-xs text-muted-foreground">{posts.length} publicacion{posts.length !== 1 ? "es" : ""}</p>
        </div>
      </div>
      <div className="space-y-3">
        {posts.map((post: any) => {
          const isPublished = post.status === "published"
          const isOverdue = !isPublished && post.status !== "cancelled" && post.status !== "failed" && new Date(post.scheduledAt || post.scheduledTime).getTime() <= Date.now()
          return (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-[#0A66C2]/10">
                        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                      </div>
                      {isPublished ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] font-normal">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Publicado
                        </Badge>
                      ) : isOverdue ? (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-[10px] font-normal">
                          <Clock className="h-3 w-3 mr-1" />
                          Por publicar
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] font-normal">
                          <Clock className="h-3 w-3 mr-1" />
                          Programado
                        </Badge>
                      )}
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
                  {!isPublished && post.status !== "cancelled" && post.status !== "failed" && (
                    <Button
                      size="sm"
                      onClick={() => handlePublishPost(post.id)}
                      disabled={publishingId === post.id}
                      className="h-8 text-xs flex-shrink-0"
                      variant="outline"
                    >
                      {publishingId === post.id
                        ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        : <Send className="h-3 w-3 mr-1" />}
                      Publicar
                    </Button>
                  )}
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
          )
        })}
      </div>
    </div>
  )
}
