// ============================================================
// useCustomerAuth.ts
//
// Sessão do CLIENTE FINAL no catálogo, por loja (slug).
// Token guardado em localStorage com chave por slug — assim,
// o login na loja A não interfere na loja B.
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { customerAuthService } from '../services/customerAuthService'
import { CustomerProfile } from '../types/theme'

function storageKey(slug: string) {
  return `customer_token_${slug}`
}

export function useCustomerAuth(slug: string | undefined) {
  const [token, setTokenState] = useState<string | null>(() => {
    if (!slug) return null
    try { return localStorage.getItem(storageKey(slug)) } catch { return null }
  })
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(false)

  const setToken = useCallback((t: string | null) => {
    setTokenState(t)
    if (!slug) return
    try {
      if (t) localStorage.setItem(storageKey(slug), t)
      else localStorage.removeItem(storageKey(slug))
    } catch { /* localStorage indisponível: segue só em memória */ }
  }, [slug])

  const refetchProfile = useCallback(async () => {
    if (!slug || !token) { setProfile(null); return }
    setLoading(true)
    try {
      const p = await customerAuthService.getProfile(slug, token)
      setProfile(p)
    } catch {
      // Token expirado/inválido
      setToken(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [slug, token, setToken])

  useEffect(() => { refetchProfile() }, [refetchProfile])

  async function login(email: string, password: string) {
    if (!slug) throw new Error('Loja não identificada')
    const res = await customerAuthService.login(slug, { email, password })
    setToken(res.accessToken)
    setProfile(res.client)
    return res.client
  }

  async function register(data: { name: string; email: string; password: string; phone?: string }) {
    if (!slug) throw new Error('Loja não identificada')
    const res = await customerAuthService.register(slug, data)
    setToken(res.accessToken)
    setProfile(res.client)
    return res.client
  }

  function logout() {
    setToken(null)
    setProfile(null)
  }

  async function updateProfile(data: Partial<{ name: string; email: string; phone: string; address: string; newPassword: string }>) {
    if (!slug || !token) throw new Error('Não autenticado')
    const updated = await customerAuthService.updateProfile(slug, token, data)
    setProfile(updated)
    return updated
  }

  return {
    token, profile, loading,
    isAuthenticated: !!profile,
    login, register, logout, updateProfile, refetchProfile,
  }
}
