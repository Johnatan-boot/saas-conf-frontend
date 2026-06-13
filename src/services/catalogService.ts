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
  async createOrder(order: OrderPayload): Promise<{ orderId: string }> {
    const { data } = await axios.post(`${BASE}/public/store/${order.storeSlug}/orders`, order)
    return data.data
  },
}
