// ============================================================
// paymentGatewayService.ts
// Adaptação do OmniPay module para o SaaS Confeitaria
// Mantém a lógica 100% idêntica ao OmniPay, apenas adapta
// o BASE_URL para usar a instância api do projeto
// ============================================================
import toast from 'react-hot-toast'

export interface GatewayCheckoutOptions {
  name: string
  amount: number
  quantity: number
  customerName?: string
  customerEmail?: string
  customerDocument?: string
  customerPhone?: string
}

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

async function post(path: string, body: object) {
  const token = localStorage.getItem('accessToken')
  const tenantSlug = localStorage.getItem('tenantSlug')
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {}),
    },
    body: JSON.stringify(body),
  })
}

export interface SubscriptionCheckoutOptions {
  gateway: 'stripe' | 'mercadopago' | 'pagarme'
  billingCycle?: 'mensal' | '12x' | '24x' | '36x'
  customerName?: string
  customerEmail?: string
  customerDocument?: string
  customerPhone?: string
  // Mercado Pago: 'pix' (QR Code na própria tela) ou 'card' (Checkout Pro só cartão)
  paymentMethod?: 'pix' | 'card'
}

export interface SubscriptionPix {
  paymentId: number
  qrCode: string          // código "copia e cola"
  qrCodeBase64: string    // imagem PNG do QR Code em base64
  ticketUrl?: string
  amount: number
  status?: string
  expiresAt?: string
}

async function authedGet(path: string) {
  const token = localStorage.getItem('accessToken')
  const tenantSlug = localStorage.getItem('tenantSlug')
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Erro ao consultar pagamento')
  return data
}

export const paymentGatewayService = {
  // Consulta o pagamento no Mercado Pago (o backend ativa o plano se aprovado).
  async verifyMercadoPagoPayment(paymentId: string | number): Promise<{ status: string; paid: boolean }> {
    const data = await authedGet(`/subscriptions/mercadopago/payment/${paymentId}`)
    return data.data
  },

  // Situação atual da assinatura (usada para acompanhar Stripe / Pagar.me, que ativam via webhook).
  async getSubscriptionStatus(): Promise<{ planStatus?: string; paid: boolean; paymentStatus?: string }> {
    const data = await authedGet('/subscriptions/status')
    const sub = data.data?.subscription
    return {
      planStatus: data.data?.planStatus,
      paymentStatus: sub?.payment_status,
      paid: sub?.payment_status === 'paid',
    }
  },

  // --- Assinatura do próprio SaaS (plano escolhido no cadastro) ---
  // Precisa que accessToken/tenantSlug já estejam no localStorage
  // (feito logo após o /tenants/onboard responder).
  async checkoutSubscription(options: SubscriptionCheckoutOptions): Promise<{ pix?: SubscriptionPix } | void> {
    try {
      const res = await post('/subscriptions/checkout', options)
      const data = await res.json()
      if (!res.ok || data.error) {
        const det = data.details
          ? ' (' + Object.entries(data.details).map(([f, e]) => `${f}: ${Array.isArray(e) ? e.join(', ') : JSON.stringify(e)}`).join(' | ') + ')'
          : ''
        throw new Error((data.error || 'Erro ao iniciar pagamento da assinatura') + det)
      }
      // PIX transparente: não há redirecionamento, a tela exibe o QR Code.
      if (data.data?.pix) return { pix: data.data.pix as SubscriptionPix }
      const url = data.data?.url
      if (url) window.location.href = url
      else throw new Error('URL de checkout não recebida.')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar pagamento da assinatura')
      throw err
    }
  },

  // --- Stripe (igual ao OmniPay) ---
  async checkoutWithStripe(options: GatewayCheckoutOptions) {
    try {
      const res = await post('/checkout/stripe', options)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar Stripe')
    }
  },

  // --- Mercado Pago (igual ao OmniPay) ---
  async checkoutWithMercadoPago(options: GatewayCheckoutOptions) {
    try {
      const res = await post('/checkout/mercadopago', options)
      const data = await res.json()
      if (data.error) {
        if (data.details) {
          const det = Object.entries(data.details)
            .map(([f, e]) => `${f}: ${Array.isArray(e) ? e.join(', ') : JSON.stringify(e)}`)
            .join(' | ')
          throw new Error(`${data.error} (${det})`)
        }
        throw new Error(data.error)
      }
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar Mercado Pago')
    }
  },

  // --- Pagar.me (igual ao OmniPay) ---
  async checkoutWithPagarme(options: GatewayCheckoutOptions) {
    try {
      toast.loading('Redirecionando para o Pagar.me...')
      const res = await post('/checkout/pagarme', options)
      const data = await res.json()
      toast.dismiss()
      if (data.error) {
        if (data.details) {
          const det = Object.entries(data.details)
            .map(([f, e]) => `${f}: ${Array.isArray(e) ? e.join(', ') : JSON.stringify(e)}`)
            .join(' | ')
          throw new Error(`${data.error} (${det})`)
        }
        throw new Error(data.error)
      }
      if (data.url) window.location.href = data.url
      else throw new Error('URL de checkout não recebida.')
    } catch (err: any) {
      toast.dismiss()
      toast.error(err.message || 'Erro ao processar Pagar.me')
    }
  },
}
