import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Store, Eye, EyeOff, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'tenant' | 'superadmin'>('tenant')
  const [form, setForm] = useState({ slug: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'tenant' && !form.slug) { toast.error('Informe o slug da confeitaria'); return }
    if (!form.email || !form.password) { toast.error('Preencha email e senha'); return }
    setLoading(true)
    try {
      if (mode === 'superadmin') {
        // Login super admin — sem slug
        const { data } = await api.post('/auth/superadmin/login', { email: form.email, password: form.password })
        const { accessToken, refreshToken, user: u } = data.data
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(u))
        localStorage.setItem('tenantSlug', 'system')
        window.location.href = '/super-admin'
      } else {
        await login(form.slug, form.email, form.password)
        navigate('/dashboard')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Credenciais inválidas')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-mocha-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-chocolate-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-sage-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cream-100 rounded-3xl mb-4 shadow-warm-lg text-4xl">🎂</div>
            <h1 className="font-display text-3xl font-bold text-cream-50 mb-1">SweetFlow</h1>
            <p className="text-chocolate-300 text-sm">Gestão completa para sua confeitaria</p>
          </div>

          {/* Toggle tenant / super admin */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-6">
            <button type="button" onClick={() => setMode('tenant')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'tenant' ? 'bg-white/15 text-cream-50' : 'text-chocolate-400 hover:text-cream-200'}`}>
              🎂 Confeitaria
            </button>
            <button type="button" onClick={() => setMode('superadmin')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${mode === 'superadmin' ? 'bg-amber-400/20 text-amber-300' : 'text-chocolate-400 hover:text-cream-200'}`}>
              <Crown size={14} /> Super Admin
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-warm-lg">
            <h2 className="font-display text-xl font-semibold text-cream-50 mb-6">
              {mode === 'superadmin' ? '👑 Acesso Super Admin' : 'Entrar na conta'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'tenant' && (
                <div>
                  <label className="block text-sm font-medium text-chocolate-200 mb-1.5">Sua confeitaria (slug)</label>
                  <div className="relative">
                    <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-400" />
                    <input type="text" placeholder="ex: confeitaria-da-ana" value={form.slug}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-cream-50 placeholder-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400 transition-all" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-chocolate-200 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-400" />
                  <input type="email" placeholder="seu@email.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-cream-50 placeholder-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-200 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-400" />
                  <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-10 py-2.5 text-cream-50 placeholder-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400 transition-all" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-chocolate-400 hover:text-cream-100">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2 ${
                  mode === 'superadmin'
                    ? 'bg-amber-500 hover:bg-amber-400 text-amber-900'
                    : 'bg-chocolate-600 hover:bg-chocolate-500 text-cream-50'
                }`}>
                {loading
                  ? <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />Entrando...</>
                  : mode === 'superadmin' ? <><Crown size={16} /> Entrar como Super Admin</> : 'Entrar'}
              </button>
            </form>

            {mode === 'tenant' && (
              <p className="text-center text-chocolate-400 text-xs mt-6">
                Primeira vez?{' '}
                <a href="/onboard" className="text-chocolate-200 hover:text-cream-100 underline">Cadastre sua confeitaria</a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Painel direito — imagem */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <img src="https://images.pexels.com/photos/10624569/pexels-photo-10624569.jpeg" alt="Confeitaria"
          className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-mocha-900/10 to-mocha-900/60" />
        <div className="absolute bottom-12 left-10 right-10">
          <blockquote className="text-white font-display text-2xl font-semibold leading-snug drop-shadow-lg">
            "Transforme sua paixão por doces<br />em um negócio de sucesso."
          </blockquote>
          <p className="text-cream-200/80 text-sm mt-3 drop-shadow">Controle pedidos, clientes e estoque em um só lugar.</p>
        </div>
      </div>
    </div>
  )
}
