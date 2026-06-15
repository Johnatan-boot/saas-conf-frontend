// ============================================================
// customerAuthService.ts
//
// Auth do CLIENTE FINAL no catálogo público. Separado do
// services/api.ts (que é para o painel admin/staff e injeta
// o token de funcionário). Aqui usamos axios puro + Bearer
// do token do cliente.
// ============================================================
import axios from 'axios'
import { CustomerAuthResponse, CustomerProfile, MyOrder } from '../types/theme'

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

function authHeaders(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export const customerAuthService = {
  async register(slug: string, data: { name: string; email: string; password: string; phone?: string }): Promise<CustomerAuthResponse> {
    const { data: res } = await axios.post(`${BASE}/public/store/${slug}/auth/register`, data)
    return res.data
  },

  async login(slug: string, data: { email: string; password: string }): Promise<CustomerAuthResponse> {
    const { data: res } = await axios.post(`${BASE}/public/store/${slug}/auth/login`, data)
    return res.data
  },

  async getProfile(slug: string, token: string): Promise<CustomerProfile> {
    const { data: res } = await axios.get(`${BASE}/public/store/${slug}/profile`, authHeaders(token))
    return res.data
  },

  async updateProfile(slug: string, token: string, data: Partial<{ name: string; email: string; phone: string; address: string; newPassword: string }>): Promise<CustomerProfile> {
    const { data: res } = await axios.put(`${BASE}/public/store/${slug}/profile`, data, authHeaders(token))
    return res.data
  },

  async getMyOrders(slug: string, token: string): Promise<MyOrder[]> {
    const { data: res } = await axios.get(`${BASE}/public/store/${slug}/my-orders`, authHeaders(token))
    return res.data
  },
}
