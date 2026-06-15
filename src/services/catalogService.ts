import axios from 'axios'
import { StoreTheme, PublicProduct, OrderPayload } from '../types/theme'

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

export const catalogService = {
  async getStoreInfo(slug: string): Promise<StoreTheme> {
    const { data } = await axios.get(`${BASE}/public/store/${slug}`)
    return data.data
  },
  async getProducts(slug: string): Promise<PublicProduct[]> {
    const { data } = await axios.get(`${BASE}/public/store/${slug}/products`)
    return data.data
  },
  async createOrder(order: OrderPayload, customerToken?: string | null): Promise<{ orderId: string }> {
    const headers = customerToken ? { Authorization: `Bearer ${customerToken}` } : undefined
    const { data } = await axios.post(`${BASE}/public/store/${order.storeSlug}/orders`, order, { headers })
    return data.data
  },

  // Cria o pedido E a sessão de pagamento no gateway escolhido,
  // numa única chamada — o pedido fica registrado mesmo que o
  // cliente acabe não concluindo o pagamento no Stripe/MP/Pagar.me.
  async checkoutWithGateway(
    gateway: 'stripe' | 'mercadopago' | 'pagarme',
    order: OrderPayload,
    customerToken?: string | null
  ): Promise<{ url: string; orderId: string; code: string }> {
    const headers = customerToken ? { Authorization: `Bearer ${customerToken}` } : undefined
    const { data } = await axios.post(`${BASE}/public/store/${order.storeSlug}/checkout/${gateway}`, order, { headers })
    return data.data
  },
}
