import React, { useState } from 'react'
import { X, User, Mail, Lock, Phone, LogIn, UserPlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoreTheme } from '../../types/theme'

interface Props {
  store: StoreTheme
  onClose(): void
  onLogin(email: string, password: string): Promise<any>
  onRegister(data: { name: string; email: string; password: string; phone?: string }): Promise<any>
}

export default function CustomerAuthModal({ store, onClose, onLogin, onRegister }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const p = store.primaryColor

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await onLogin(form.email, form.password)
        toast.success('Login realizado! 🎉')
      } else {
        await onRegister({ name: form.name, email: form.email, password: form.password, phone: form.phone || undefined })
        toast.success('Conta criada com sucesso! 🎉')
      }
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-mocha-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm mx-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-warm-lg flex flex-col animate-slide-up overflow-hidden">

        <div className="px-5 pt-5 pb-4 flex items-center justify-between" style={{ backgroundColor: p }}>
          <h2 className="font-display font-bold text-white flex items-center gap-2">
            {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/15 transition"><X size={18} className="text-white" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cream-100">
          <button onClick={() => setMode('login')}
            className="flex-1 py-3 text-sm font-semibold transition"
            style={mode === 'login' ? { color: p, borderBottom: `2px solid ${p}` } : { color: '#9a8d80' }}>
            Já tenho conta
          </button>
          <button onClick={() => setMode('register')}
            className="flex-1 py-3 text-sm font-semibold transition"
            style={mode === 'register' ? { color: p, borderBottom: `2px solid ${p}` } : { color: '#9a8d80' }}>
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {mode === 'register' && (
            <div>
              <label className="label flex items-center gap-1"><User size={14} /> Nome completo</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Seu nome" className="input" />
            </div>
          )}

          <div>
            <label className="label flex items-center gap-1"><Mail size={14} /> E-mail</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="seu@email.com" className="input" />
          </div>

          {mode === 'register' && (
            <div>
              <label className="label flex items-center gap-1"><Phone size={14} /> WhatsApp (opcional)</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                placeholder="5511999999999" className="input" />
            </div>
          )}

          <div>
            <label className="label flex items-center gap-1"><Lock size={14} /> Senha</label>
            <input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••" className="input" />
            {mode === 'register' && <p className="text-xs text-mocha-400 mt-1">Mínimo 6 caracteres</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 active:scale-95 mt-2"
            style={{ backgroundColor: p }}>
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : (mode === 'login' ? <>Entrar <LogIn className="w-4 h-4" /></> : <>Criar conta <UserPlus className="w-4 h-4" /></>)}
          </button>

          <p className="text-xs text-center text-mocha-400">
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold hover:underline" style={{ color: p }}>
              {mode === 'login' ? 'Criar agora' : 'Fazer login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
