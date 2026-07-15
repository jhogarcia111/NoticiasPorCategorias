"use client"

import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, CreditCard, Lock, CheckCircle2, AlertTriangle } from "lucide-react"

interface Plan {
  id: number
  name: string
  slug: string
  description?: string | null
  priceInCents: number
  currency: string
  interval: string
}

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plans: Plan[]
  onSuccess: () => void
}

declare global {
  interface Window {
    Wompi: any
  }
}

export function CheckoutDialog({ open, onOpenChange, plans, onSuccess }: CheckoutDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [step, setStep] = useState<"select" | "pay" | "processing" | "success" | "error">("select")
  const [errorMessage, setErrorMessage] = useState("")
  const [wompiLoaded, setWompiLoaded] = useState(false)

  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  useEffect(() => {
    if (!open) {
      setStep("select")
      setSelectedPlan(null)
      setErrorMessage("")
      return
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    if (window.Wompi) {
      setWompiLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.wompi.co/widget.js"
    script.async = true
    script.onload = () => setWompiLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [open])

  const createSubMutation = useMutation({
    mutationFn: async (params: { planSlug: string; cardToken: string; acceptanceToken: string }) => {
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al procesar el pago")
      return json.data
    },
    onSuccess: () => {
      setStep("success")
      setTimeout(() => onSuccess(), 2000)
    },
    onError: (err: Error) => {
      setErrorMessage(err.message)
      setStep("error")
    },
  })

  function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 4)
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    return digits
  }

  function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 16)
    return digits.replace(/(.{4})/g, "$1 ").trim()
  }

  async function handlePay() {
    if (!selectedPlan || !window.Wompi) return
    setStep("processing")
    setErrorMessage("")

    try {
      const wompi = new window.Wompi({
        publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "",
      })

      const [expMonth, expYear] = cardExpiry.split("/")

      const { data: tokenData, error: tokenError } = await wompi.tokenizeCard({
        number: cardNumber.replace(/\s/g, ""),
        cvc: cardCvc,
        exp_month: expMonth,
        exp_year: expYear.length === 2 ? `20${expYear}` : expYear,
        card_holder: cardName,
      })

      if (tokenError) throw new Error(tokenError.message || "Error al tokenizar tarjeta")
      if (!tokenData?.token) throw new Error("No se pudo tokenizar la tarjeta")

      const { data: acceptanceData } = await wompi.getAcceptanceToken()
      const acceptanceToken = acceptanceData?.acceptance_token

      if (!acceptanceToken) {
        const merchantRes = await fetch(`https://sandbox.wompi.co/v1/merchants/${process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY}`)
        const merchant = await merchantRes.json()
        const acceptance = merchant.data?.presigned_acceptance?.acceptance_token
        if (!acceptance) throw new Error("No se pudo obtener el acceptance token")
        createSubMutation.mutate({ planSlug: selectedPlan.slug, cardToken: tokenData.token, acceptanceToken: acceptance })
        return
      }

      createSubMutation.mutate({ planSlug: selectedPlan.slug, cardToken: tokenData.token, acceptanceToken })
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar el pago")
      setStep("error")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-lg font-semibold">
            {step === "select" && "Selecciona un plan"}
            {step === "pay" && "Pagar con tarjeta"}
            {step === "processing" && "Procesando pago..."}
            {step === "success" && "¡Pago exitoso!"}
            {step === "error" && "Error en el pago"}
          </h2>
          <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
        </div>

        <div className="p-6">
          {step === "select" && (
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => { setSelectedPlan(plan); setStep("pay") }}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedPlan?.id === plan.id
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{plan.name}</span>
                    <span className="font-bold">
                      ${(plan.priceInCents / 100).toLocaleString("es-CO")}/{plan.interval === "month" ? "mes" : plan.interval}
                    </span>
                  </div>
                  {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                </button>
              ))}
            </div>
          )}

          {step === "pay" && selectedPlan && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 flex justify-between items-center text-sm">
                <span className="font-medium">{selectedPlan.name}</span>
                <span>${(selectedPlan.priceInCents / 100).toLocaleString("es-CO")}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Número de tarjeta</label>
                  <Input
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Titular de la tarjeta</label>
                  <Input placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Vencimiento</label>
                    <Input
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVC</label>
                    <Input
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Tus datos se tokenizan directamente con Wompi. Nosotros nunca vemos tu información de tarjeta.</span>
              </div>

              <Button className="w-full" onClick={handlePay} disabled={!wompiLoaded || !cardNumber || !cardName || !cardExpiry || !cardCvc}>
                {!wompiLoaded ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pagar ${(selectedPlan.priceInCents / 100).toLocaleString("es-CO")}
                  </>
                )}
              </Button>

              <button
                onClick={() => setStep("select")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Volver a planes
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="py-12 text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
              <p className="font-medium">Procesando tu pago...</p>
              <p className="text-sm text-muted-foreground mt-1">Por favor espera, esto tomará unos segundos.</p>
            </div>
          )}

          {step === "success" && (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-semibold">¡Pago aprobado!</p>
              <p className="text-sm text-muted-foreground mt-1">Tu suscripción está siendo activada.</p>
            </div>
          )}

          {step === "error" && (
            <div className="py-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <p className="font-semibold text-red-600">Error en el pago</p>
              <p className="text-sm text-muted-foreground mt-1 mb-6">{errorMessage}</p>
              <Button onClick={() => setStep("pay")}>Intentar de nuevo</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
