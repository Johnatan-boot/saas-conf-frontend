import axios from 'axios'

// FIX 4: usar VITE_API_URL do env para o Render apontar pro backend correto
// Em dev: proxy do vite redireciona /api → localhost:3000
// Em produção: VITE_API_URL=https://seu-backend.onrender.com
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  const tenantSlug = localStorage.getItem('tenantSlug')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (tenantSlug) config.headers['X-Tenant-Slug'] = tenantSlug
  return config
})

api.interceptors.response.use(
  r => r,
  async err => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refreshToken')
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh })
          localStorage.setItem('accessToken', data.data.accessToken)
          localStorage.setItem('refreshToken', data.data.refreshToken)
          err.config.headers.Authorization = `Bearer ${data.data.accessToken}`
          return api.request(err.config)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
