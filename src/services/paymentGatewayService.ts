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

export const paymentGatewayService = {
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
