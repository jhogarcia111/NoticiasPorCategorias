"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Edit3, ExternalLink, Loader2, Calendar } from "lucide-react"

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const DAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  published: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
}

const statusLabels: Record<string, string> = {
  scheduled: "Programado",
  published: "Publicado",
  failed: "Error",
  cancelled: "Cancelado",
  pending: "Pendiente",
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
  const today = new Date()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <CardTitle className="text-base font-semibold">
                  {MONTHS[currentMonth]} {currentYear}
                </CardTitle>
                <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {DAYS.map((d) => (
                  <div key={d} className="bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-card" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayP = getPostsForDay(day)
                  const hasPosts = dayP.length > 0
                  const hasPublished = dayP.some((p: any) => p.status === "published")
                  const hasScheduled = dayP.some((p: any) => p.status === "scheduled" || p.status === "pending")
                  const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "bg-card px-2 py-2.5 text-sm transition-all relative min-h-[48px]",
                        "hover:bg-muted/50",
                        selectedDay === day && "bg-primary/5",
                      )}
                    >
                      <span className={cn(
                        "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm",
                        selectedDay === day && "bg-primary text-primary-foreground font-medium",
                        isToday && !selectedDay && "border border-primary text-primary font-medium",
                        !isToday && selectedDay !== day && "text-foreground",
                      )}>
                        {day}
                      </span>
                      {hasPosts && (
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {hasPublished && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          {hasScheduled && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          {!hasPublished && !hasScheduled && <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                        </div>
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
              <CardTitle className="text-sm font-semibold">
                {selectedDay
                  ? `${selectedDay} de ${MONTHS[currentMonth]}`
                  : "Selecciona un dia"
                }
                {selectedDay && dayPosts.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    ({dayPosts.length} publicacion{dayPosts.length !== 1 ? "es" : ""})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : editingPost ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Editando publicacion</p>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px] resize-y"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit} disabled={saving} className="h-8 text-xs">
                      {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Guardar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingPost(null)} className="h-8 text-xs">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : dayPosts.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {dayPosts.map((post: any) => {
                    const StatusIcon = statusIcons[post.status] || Clock
                    return (
                      <div key={post.id} className="p-3 border rounded-lg space-y-2 hover:border-muted-foreground/20 transition-colors">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={cn("text-[10px] font-normal", statusColors[post.status] || "bg-gray-50")}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusLabels[post.status] || post.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {post.scheduledAt
                              ? new Date(post.scheduledAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
                              : ""}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                          {post.content || post.postContent || "Sin contenido"}
                        </p>
                        <div className="flex gap-1 pt-1">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          {post.news?.sourceUrl && (
                            <button
                              onClick={() => window.open(post.news.sourceUrl, "_blank")}
                              className="p-1.5 rounded hover:bg-muted transition-colors"
                              title="Ver fuente"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : selectedDay ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Sin publicaciones este dia</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Calendar className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Haz clic en un dia del calendario</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
