import React, { useState, useEffect, useCallback } from 'react'
import { Users, Gift, Heart, Star, RefreshCw, Phone, ShoppingBag, Trophy, Clock } from 'lucide-react'
import api from '../services/api'
import { formatCurrency, formatDate } from '../utils'
import { LoadingPage, EmptyState } from '../components/ui'

function getLoyaltyTier(totalSpent: number) {
  if (totalSpent >= 3000) return { label: 'Diamante', icon: '💎', color: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' }
  if (totalSpent >= 1000) return { label: 'Ouro', icon: '🏆', color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500' }
  if (totalSpent >= 500)  return { label: 'Prata', icon: '⭐', color: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' }
  return { label: 'Bronze', icon: '🥉', color: 'bg-amber-50 text-amber-700', bar: 'bg-amber-400' }
}

function getWhatsAppUrl(phone: string, name: string, birthday: boolean) {
  const clean = phone?.replace(/\D/g, '') || ''
  const num = clean.startsWith('55') ? clean : `55${clean}`
  const msg = birthday
    ? encodeURIComponent(`Olá, ${name.split(' ')[0]}! 🎂🎉 Hoje é um dia especial — feliz aniversário! Temos uma surpresa doce esperando por você. Venha nos visitar!`)
    : encodeURIComponent(`Olá, ${name.split(' ')[0]}! 😊 Sentimos sua falta na confeitaria. Temos novidades deliciosas esperando por você!`)
  return `https://wa.me/${num}?text=${msg}`
}

export default function RecurrencePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'birthday' | 'inactive' | 'vip'>('birthday')

  const fetch = useCallback(() => {
    setLoading(true)
    api.get('/dashboard/recurrence')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) return <LoadingPage />

  const clients: any[] = data?.clients || []

  const birthday = clients.filter(c => c.days_to_birthday !== null && c.days_to_birthday >= 0 && c.days_to_birthday <= 30)
    .sort((a, b) => a.days_to_birthday - b.days_to_birthday)

  const inactive = clients.filter(c => c.days_since_last_order > 45)
    .sort((a, b) => b.days_since_last_order - a.days_since_last_order)

  const vip = clients.filter(c => c.total_orders >= 3 || c.total_spent >= 500)
    .sort((a, b) => b.total_spent - a.total_spent)

  const currentList = tab === 'birthday' ? birthday : tab === 'inactive' ? inactive : vip

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center">
            <Heart size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-mocha-900">Recorrência & Fidelidade</h2>
            <p className="text-mocha-500 text-sm">Clientes reais do seu sistema para reativar e fidelizar</p>
          </div>
        </div>
        <button onClick={fetch} className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 transition">
          <RefreshCw size={14} className="text-mocha-500" />
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Aniversários (30d)', value: birthday.length, icon: Gift, color: 'text-pink-600' },
          { label: 'Clientes Inativos (+45d)', value: inactive.length, icon: Clock, color: 'text-amber-600' },
          { label: 'Clientes VIP', value: vip.length, icon: Trophy, color: 'text-yellow-600' },
        ].map(k => (
          <div key={k.label} className="card text-center">
            <k.icon size={20} className={`${k.color} mx-auto mb-1`} />
            <p className={`font-display text-3xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-xs text-mocha-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-cream-100 rounded-2xl w-fit">
        {[
          { id: 'birthday', label: `🎂 Aniversários (${birthday.length})` },
          { id: 'inactive', label: `⏰ Inativos (${inactive.length})` },
          { id: 'vip',      label: `🏆 VIP (${vip.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-mocha-900 shadow-sm' : 'text-mocha-400 hover:text-mocha-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="Nenhum cliente encontrado"
          description="Cadastre clientes e registre pedidos para ver análises de recorrência aqui. Clientes com aniversário aparecem quando você preenche a data de nascimento no cadastro."
        />
      ) : currentList.length === 0 ? (
        <div className="card text-center py-10 text-mocha-400">
          <p className="text-lg font-semibold">Nenhum cliente nesta categoria</p>
          <p className="text-sm mt-1">
            {tab === 'birthday' ? 'Preencha as datas de aniversário nos cadastros de clientes.' :
             tab === 'inactive' ? 'Todos os seus clientes fizeram pedidos recentemente!' :
             'Nenhum cliente VIP ainda. Continuem pedindo! 🎂'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((c: any) => {
            const tier = getLoyaltyTier(Number(c.total_spent || 0))
            const isBirthday = tab === 'birthday'
            const daysMsg = isBirthday
              ? (c.days_to_birthday === 0 ? '🎉 HOJE!' : `em ${c.days_to_birthday} dia${c.days_to_birthday !== 1 ? 's' : ''}`)
              : c.days_since_last_order
                ? `Último pedido: ${c.days_since_last_order}d atrás`
                : 'Sem pedido registrado'
            return (
              <div key={c.id} className="card hover:shadow-warm-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${isBirthday && c.days_to_birthday === 0 ? 'bg-pink-100 animate-bounce-subtle' : 'bg-cream-100'}`}>
                    {isBirthday ? '🎂' : tab === 'vip' ? tier.icon : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-mocha-900">{c.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tier.color}`}>{tier.icon} {tier.label}</span>
                      {isBirthday && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.days_to_birthday === 0 ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700'}`}>{daysMsg}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-mocha-400">
                      {c.phone && <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                      <span className="flex items-center gap-1"><ShoppingBag size={10} /> {c.total_orders} pedidos</span>
                      <span className="font-medium text-mocha-600">{formatCurrency(Number(c.total_spent || 0))}</span>
                      {!isBirthday && <span>{daysMsg}</span>}
                    </div>
                    {tab === 'vip' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="text-mocha-400">Progresso fidelidade</span>
                          <span className="text-mocha-500 font-medium">{formatCurrency(Number(c.total_spent || 0))}</span>
                        </div>
                        <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${Math.min((Number(c.total_spent || 0) / 3000) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  {c.phone && (
                    <a href={getWhatsAppUrl(c.phone, c.name, isBirthday)} target="_blank" rel="noreferrer"
                      className="flex-shrink-0 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5">
                      <Phone size={12} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
