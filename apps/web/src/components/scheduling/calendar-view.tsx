"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Edit3, ExternalLink, Loader2 } from "lucide-react"

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  published: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
}

const statusIcons: Record<string, any> = {
  scheduled: Clock,
  published: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
  pending: Clock,
}

export function CalendarView() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [editContent, setEditContent] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return
    setLoading(true)
    fetch(`/api/scheduling?userId=${session.user.id}&type=posts`)
      .then(r => r.json())
      .then(d => {
        const data = Array.isArray(d.data) ? d.data : []
        setPosts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session])

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const getPostsForDay = (day: number) => {
    return posts.filter((p: any) => {
      const d = new Date(p.scheduledAt || p.scheduledTime || p.createdAt)
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
    else setCurrentMonth(currentMonth - 1)
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
    else setCurrentMonth(currentMonth + 1)
    setSelectedDay(null)
  }

  const handleEditPost = (post: any) => {
    setEditingPost(post)
    setEditContent(post.content || post.postContent || "")
  }

  const handleSaveEdit = async () => {
    if (!editingPost) return
    setSaving(true)
    try {
      const res = await fetch("/api/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          type: "update",
          postId: editingPost.id,
          updates: { content: editContent },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPosts((prev) => prev.map((p) => p.id === editingPost.id ? { ...p, content: editContent } : p))
      setEditingPost(null)
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const dayPosts = selectedDay ? getPostsForDay(selectedDay) : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📅 Calendario de Publicaciones</h2>
          <p className="text-muted-foreground">Visualiza y edita tus publicaciones programadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-md"><ChevronLeft className="h-5 w-5" /></button>
                <CardTitle className="text-base">{MONTHS[currentMonth]} {currentYear}</CardTitle>
                <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-md"><ChevronRight className="h-5 w-5" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayPosts = getPostsForDay(day)
                  const hasPosts = dayPosts.length > 0
                  const hasPublished = dayPosts.some((p: any) => p.status === "published")
                  return (
                    <button key={day} onClick={() => setSelectedDay(day)}
                      className={cn(
                        "h-10 rounded-md text-sm font-medium transition-colors relative",
                        selectedDay === day ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                        hasPosts && !hasPublished && "ring-1 ring-blue-300",
                        hasPublished && "ring-1 ring-green-300",
                      )}>
                      {day}
                      {hasPosts && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {dayPosts.filter((p: any) => p.status === "published").length > 0 && (
                            <span className="w-1 h-1 rounded-full bg-green-500" />
                          )}
                          {dayPosts.filter((p: any) => p.status === "scheduled" || p.status === "pending").length > 0 && (
                            <span className="w-1 h-1 rounded-full bg-blue-500" />
                          )}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {selectedDay ? `Publicaciones del ${selectedDay}` : "Selecciona un día"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : editingPost ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Editando publicación</p>
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px]" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                      {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Guardar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingPost(null)}>Cancelar</Button>
                  </div>
                </div>
              ) : dayPosts.length > 0 ? (
                <div className="space-y-3">
                  {dayPosts.map((post: any) => {
                    const StatusIcon = statusIcons[post.status] || Clock
                    return (
                      <div key={post.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={cn("text-xs", statusColors[post.status])}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {post.status === "scheduled" ? "Programado" : post.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {post.scheduledAt ? new Date(post.scheduledAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-3">{post.content || post.postContent || "Sin contenido"}</p>
                        <div className="flex gap-1">
                          <button onClick={() => handleEditPost(post)} className="p-1 rounded hover:bg-muted" title="Editar">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {post.news?.sourceUrl && (
                            <button onClick={() => window.open(post.news.sourceUrl, "_blank")} className="p-1 rounded hover:bg-muted" title="Ver fuente">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : selectedDay ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sin publicaciones este día</p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Haz clic en un día del calendario</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
