"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface AdminSub {
  id: number
  userId: string
  status: string
  planId: number
  currentPeriodStart: string
  currentPeriodEnd: string | null
  createdAt: string
  updatedAt: string
  planName: string | null
  planSlug: string | null
  username: string | null
}

const STATUS_STYLES: Record<string, { label: string; icon: any; color: string }> = {
  active: { label: "Activa", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  pending: { label: "Pendiente", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
  canceled: { label: "Cancelada", icon: XCircle, color: "text-gray-600 bg-gray-50" },
  expired: { label: "Expirada", icon: AlertCircle, color: "text-gray-600 bg-gray-100" },
  past_due: { label: "Vencida", icon: AlertCircle, color: "text-orange-600 bg-orange-50" },
  incomplete: { label: "Incompleta", icon: XCircle, color: "text-red-600 bg-red-50" },
}

export function AdminSubscriptions() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ data: AdminSub[] }>({
    queryKey: ["admin-subscriptions"],
    queryFn: () => fetch("/api/admin/subscriptions").then((r) => r.json()),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ subscriptionId, status }: { subscriptionId: number; status: string }) => {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, status }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] })
    },
    onError: (err: Error) => {
      alert(err.message)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const subs = data?.data || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Administrar membresías</h2>
        <p className="text-sm text-muted-foreground">Gestiona todas las suscripciones de usuarios</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Usuario</th>
              <th className="pb-3 pr-4 font-medium">Plan</th>
              <th className="pb-3 pr-4 font-medium">Estado</th>
              <th className="pb-3 pr-4 font-medium">Inicio</th>
              <th className="pb-3 pr-4 font-medium">Fin</th>
              <th className="pb-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">Sin suscripciones</td>
              </tr>
            )}
            {subs.map((sub) => {
              const st = STATUS_STYLES[sub.status] || STATUS_STYLES.incomplete
              const Icon = st.icon
              return (
                <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3 pr-4">{sub.username || sub.userId.slice(0, 8)}</td>
                  <td className="py-3 pr-4">{sub.planName || sub.planSlug || "—"}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                      <Icon className="h-3 w-3" />
                      {st.label}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{sub.currentPeriodStart ? formatDate(sub.currentPeriodStart) : "—"}</td>
                  <td className="py-3 pr-4">{sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "—"}</td>
                  <td className="py-3">
                    {sub.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => updateMutation.mutate({ subscriptionId: sub.id, status: "canceled" })}
                        disabled={updateMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                    {sub.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 text-red-600"
                        onClick={() => updateMutation.mutate({ subscriptionId: sub.id, status: "canceled" })}
                        disabled={updateMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}