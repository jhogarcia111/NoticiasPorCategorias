import { createHash } from "crypto"

const WOMPI_API_URL = process.env.WOMPI_API_URL || "https://sandbox.wompi.co/v1"
const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || process.env.WOMPI_PUBLIC_KEY || ""
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || ""
const WOMPI_EVENT_SECRET = process.env.WOMPI_EVENT_SECRET || ""
const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY || ""

interface WompiError {
  status: number
  message: string
  data?: any
}

function sha256(message: string): string {
  return createHash("sha256").update(message).digest("hex")
}

function wompiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${WOMPI_API_URL}${path}`
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
      ...options.headers,
    },
  }).then(async (res) => {
    const json = await res.json()
    if (!res.ok) {
      throw { status: res.status, message: json.message || json.error || "Wompi API error", data: json } as WompiError
    }
    return json as T
  })
}

export interface WompiMerchant {
  data: {
    id: string
    name: string
    accepted_currencies: string[]
    presigned_acceptance: {
      acceptance_token: string
      permalink: string
      type: string
    }
  }
}

export interface WompiPaymentSource {
  data: {
    id: string
    public_data: { type: string; number: string; last_four: string }
    status: string
    customer_email: string
    token: string
    acceptance_token: string
    created_at: string
  }
}

export interface WompiTransaction {
  data: {
    id: string
    amount_in_cents: number
    reference: string
    customer_email: string
    currency: string
    status: string
    status_message: string
    payment_method_type: string
    payment_source_id: string
    created_at: string
    finalized_at: string | null
  }
}

export interface WompiWebhookEvent {
  event: string
  data: {
    transaction: {
      id: string
      amount_in_cents: number
      reference: string
      status: "APPROVED" | "DECLINED" | "PENDING" | "VOIDED" | "ERROR"
      status_message: string
      payment_method_type: string
      payment_source_id: string
      customer_email: string
      currency: string
      finalized_at: string | null
      created_at: string
    }
  }
  environment: string
  timestamp: string
  signature: { checksum: string; properties: string[] }
}

export async function getMerchantInfo(): Promise<WompiMerchant> {
  return wompiFetch(`/merchants/${WOMPI_PUBLIC_KEY}`)
}

export async function getAcceptanceToken(): Promise<string> {
  const merchant = await getMerchantInfo()
  return merchant.data.presigned_acceptance.acceptance_token
}

export async function createPaymentSource(params: {
  token: string
  customerEmail: string
  acceptanceToken: string
  type?: string
}): Promise<WompiPaymentSource> {
  return wompiFetch("/payment_sources", {
    method: "POST",
    body: JSON.stringify({
      type: params.type || "CARD",
      token: params.token,
      customer_email: params.customerEmail,
      acceptance_token: params.acceptanceToken,
    }),
  })
}

export async function createTransaction(params: {
  amountInCents: number
  currency: string
  reference: string
  paymentSourceId: string
  customerEmail: string
}): Promise<WompiTransaction> {
  const integrity = generateIntegritySignature(params.reference, params.amountInCents, params.currency)

  return wompiFetch("/transactions", {
    method: "POST",
    body: JSON.stringify({
      amount_in_cents: params.amountInCents,
      currency: params.currency,
      reference: params.reference,
      payment_source_id: params.paymentSourceId,
      customer_email: params.customerEmail,
      signature: integrity,
    }),
  })
}

export async function getTransaction(transactionId: string): Promise<WompiTransaction> {
  return wompiFetch(`/transactions/${transactionId}`)
}

export function generateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
  return sha256(`${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_KEY}`)
}

export function verifyWebhookSignature(body: string, checksumHeader: string): boolean {
  const expected = sha256(body)
  return expected === checksumHeader
}

export function verifyDeployTrackerSignature(
  signature: string | null,
  timestamp: string | null,
  secretToken: string
): boolean {
  if (!signature || !timestamp) return false
  const expected = createHash("sha256")
    .update(`${secretToken}:${timestamp}`)
    .digest("hex")
  return expected === signature
}

export type { WompiError }
