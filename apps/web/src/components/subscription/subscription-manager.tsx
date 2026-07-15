"use client"

import { useState } from "react"
import type { Session } from "next-auth"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { CheckoutDialog } from "./checkout-dialog"
import { formatDate } from "@/lib/utils"

interface Plan {
  id: number
  name: string
  slug: string
  description: string | null
  priceInCents: number
  currency: string
  interval: string
  features: string[] | null
  isActive: boolean
}

interface SubscriptionData {
  id: number
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string | null
  trialEndsAt: string | null
  canceledAt: string | null
  createdAt: string
  plan: Plan | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Activa", color: "text-green-600 bg-green-50" },
  trialing: { label: "Prueba", color: "text-blue-600 bg-blue-50" },
  past_due: { label: "Vencida", color: "text-orange-600 bg-orange-50" },
  pending: { label: "Pendiente", color: "text-yellow-600 bg-yellow-50" },
  incomplete: { label: "Incompleta", color: "text-red-600 bg-red-50" },
  canceled: { label: "Cancelada", color: "text-gray-600 bg-gray-50" },
  expired: { label: "Expirada", color: "text-gray-600 bg-gray-100" },
}

function formatPrice(cents: number, currency: string): string {
  const value = cents / 100
  if (currency === "COP") {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value)
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value)
}

function formatCOP(centsUSD: number): string {
  const cop = centsUSD * 38
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(cop)
}

export function SubscriptionManager({ user }: { user: Session["user"] }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const { data: plansData, isLoading: plansLoading } = useQuery<{ data: Plan[] }>({
    queryKey: ["subscription-plans"],
    queryFn: () => fetch("/api/subscriptions/plans").then((r) => r.json()),
  })

  const { data: subData, isLoading: subLoading, refetch: refetchSub } = useQuery<{ data: SubscriptionData | null }>({
    queryKey: ["subscription-status"],
    queryFn: () => fetch("/api/subscriptions/status").then((r) => r.json()),
  })

  const subscription = subData?.data
  const plans = plansData?.data || []
  const activePlan = plans.find((p) => p.id === subscription?.plan?.id)
  const statusInfo = subscription ? STATUS_LABELS[subscription.status] || STATUS_LABELS.incomplete : null

  if (plansLoading || subLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (subscription && activePlan) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-lg font-semibold">Mi Suscripción</h2>
          <p className="text-sm text-muted-foreground">Gestiona tu plan y método de pago</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{activePlan.name}</CardTitle>
                <CardDescription>
                  {formatPrice(activePlan.priceInCents, activePlan.currency)}/{activePlan.interval === "month" ? "mes" : activePlan.interval}
                </CardDescription>
              </div>
              {statusInfo && (
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
                  {subscription.status === "active" && <CheckCircle2 className="h-3 w-3" />}
                  {subscription.status === "past_due" && <AlertCircle className="h-3 w-3" />}
                  {subscription.status === "incomplete" && <XCircle className="h-3 w-3" />}
                  {subscription.status === "pending" && <Loader2 className="h-3 w-3 animate-spin" />}
                  {statusInfo.label}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {activePlan.features && activePlan.features.length > 0 && (
              <div>
                <p className="font-medium mb-2">Características incluidas:</p>
                <ul className="space-y-1">
                  {activePlan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-3 border-t">
              <p className="text-muted-foreground">
                Período actual: {formatDate(subscription.currentPeriodStart)} —{" "}
                {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "—"}
              </p>
              {subscription.canceledAt && (
                <p className="text-muted-foreground">Cancelada el: {formatDate(subscription.canceledAt)}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" disabled>
              Cancelar suscripción
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Elige tu plan</h2>
        <p className="text-sm text-muted-foreground">Selecciona el plan que mejor se adapte a tus necesidades</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <p className="text-3xl font-bold mt-2">
                {formatPrice(plan.priceInCents, plan.currency)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.interval === "month" ? "mes" : plan.interval}
                </span>
              </p>
              {plan.currency === "USD" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCOP(plan.priceInCents)} COP/mes
                </p>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setCheckoutOpen(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar con tarjeta
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        plans={plans}
        onSuccess={() => {
          setCheckoutOpen(false)
          refetchSub()
        }}
      />
    </div>
  )
}
