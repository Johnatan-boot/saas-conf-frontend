import React, { useState } from 'react'
import { X, User, Mail, Phone, MapPin, Lock, Save, LogOut, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoreTheme, CustomerProfile } from '../../types/theme'

interface Props {
  store: StoreTheme
  profile: CustomerProfile
  onClose(): void
  onSave(data: Partial<{ name: string; email: string; phone: string; address: string; newPassword: string }>): Promise<any>
  onLogout(): void
}

export default function ProfileModal({ store, profile, onClose, onSave, onLogout }: Props) {
  const [form, setForm] = useState({
    name: profile.name, email: profile.email,
    phone: profile.phone || '', address: profile.address || '',
    newPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const p = store.primaryColor

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: any = { name: form.name, email: form.email, phone: form.phone, address: form.address }
      if (form.newPassword) payload.newPassword = form.newPassword
      await onSave(payload)
      toast.success('Perfil atualizado! ✅')
      setForm(f => ({ ...f, newPassword: '' }))
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-mocha-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm mx-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-warm-lg flex flex-col animate-slide-up" style={{ maxHeight: '90vh' }}>

        <div className="px-5 pt-5 pb-4 flex items-center justify-between" style={{ backgroundColor: p }}>
          <h2 className="font-display font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5" /> Meu Perfil
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/15 transition"><X size={18} className="text-white" /></button>
        </div>

        {(profile.totalOrders > 0) && (
          <div className="px-5 pt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl p-3" style={{ backgroundColor: p + '10' }}>
              <p className="text-xl font-bold" style={{ color: p }}>{profile.totalOrders}</p>
              <p className="text-xs text-mocha-400">Pedidos</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: p + '10' }}>
              <p className="text-xl font-bold" style={{ color: p }}>{profile.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-xs text-mocha-400">Total gasto</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3">
          <div>
            <label className="label flex items-center gap-1"><User size={14} /> Nome</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Mail size={14} /> E-mail</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Phone size={14} /> WhatsApp</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} placeholder="5511999999999" className="input" />
          </div>
          <div>
            <label className="label flex items-center gap-1"><MapPin size={14} /> Endereço</label>
            <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Rua, número, bairro" className="input" />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Lock size={14} /> Nova senha (opcional)</label>
            <input type="password" minLength={6} value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Deixe em branco para manter" className="input" />
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 active:scale-95 mt-2"
            style={{ backgroundColor: p }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar alterações</>}
          </button>

          <button type="button" onClick={onLogout}
            className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition text-red-500 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>
        </form>
      </div>
    </div>
  )
}
