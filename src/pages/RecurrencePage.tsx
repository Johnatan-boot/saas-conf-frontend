import React, { useState } from 'react'
import { RefreshCw, Bell, MessageCircle, Gift, Calendar, User, Send, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils'
import { clsx } from '../utils'

const RECURRING_CLIENTS = [
  {
    id: 1, name: 'Maria Silva', phone: '(11) 99999-1111',
    birthday: '2025-05-15', event_type: 'Aniversário pessoal',
    last_order: '2024-05-14', last_order_value: 250, total_spent: 1840,
    orders_count: 12, loyalty_tier: 'ouro',
    next_event: '2025-05-15', days_to_event: 10,
    alert_sent: false, whatsapp_ready: true,
    suggested_product: 'Bolo Red Velvet',
  },
  {
    id: 2, name: 'João Santos', phone: '(11) 98888-2222',
    birthday: '2025-06-03', event_type: 'Aniversário do filho',
    last_order: '2024-06-01', last_order_value: 180, total_spent: 720,
    orders_count: 5, loyalty_tier: 'prata',
    next_event: '2025-06-03', days_to_event: 29,
    alert_sent: false, whatsapp_ready: true,
    suggested_product: 'Bolo Decorado Infantil',
  },
  {
    id: 3, name: 'Ana Costa', phone: '(11) 97777-3333',
    birthday: '2025-05-28', event_type: 'Reunião mensal empresa',
    last_order: '2025-04-28', last_order_value: 320, total_spent: 3840,
    orders_count: 24, loyalty_tier: 'diamante',
    next_event: '2025-05-28', days_to_event: 23,
    alert_sent: true, whatsapp_ready: true,
    suggested_product: 'Kit Festa Corporativo',
  },
  {
    id: 4, name: 'Carlos Mendes', phone: '(11) 96666-4444',
    birthday: '2025-07-12', event_type: 'Aniversário de casamento',
    last_order: '2024-07-10', last_order_value: 450, total_spent: 1350,
    orders_count: 8, loyalty_tier: 'prata',
    next_event: '2025-07-12', days_to_event: 68,
    alert_sent: false, whatsapp_ready: false,
    suggested_product: 'Torta Nupcial',
  },
]

const WHATSAPP_TEMPLATES = [
  {
    id: 'birthday_7days',
    name: '7 dias antes do aniversário',
    trigger: 'Automático — 7 dias antes',
    message: (name: string, product: string) =>
      `Olá ${name}! 🎂 Que tal garantir um bolo especial para o aniversário que está chegando? Nosso ${product} é a escolha perfeita! Me manda uma mensagem e te faço um orçamento 💕`,
    sent: 18,
    opened: 14,
  },
  {
    id: 'birthday_reminder',
    name: 'Dia do aniversário',
    trigger: 'Automático — no dia',
    message: (name: string, _: string) =>
      `Feliz Aniversário, ${name}! 🥳🎉 Que seu dia seja doce como os nossos bolos! Aproveite 10% de desconto hoje no seu pedido especial 🎁`,
    sent: 23,
    opened: 21,
  },
  {
    id: 'win_back',
    name: 'Reconquistar cliente',
    trigger: 'Automático — 60 dias sem pedido',
    message: (name: string, _: string) =>
      `Oi ${name}! Sentimos sua falta 😊 Faz um tempo que não te vemos por aqui. Que tal nos dar uma visita? Tenho uma surpresa especial esperando por você 🎂`,
    sent: 8,
    opened: 5,
  },
]

const TIER_CONFIG = {
  diamante: { color: 'bg-blue-100 text-blue-700', emoji: '💎', min: 20 },
  ouro: { color: 'bg-amber-100 text-amber-700', emoji: '🥇', min: 10 },
  prata: { color: 'bg-slate-100 text-slate-600', emoji: '🥈', min: 5 },
}

function MessagePreview({ client, template }: any) {
  const msg = template.message(client.name, client.suggested_product)
  return (
    <div className="bg-[#e8f5e9] rounded-2xl p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <MessageCircle size={12} className="text-white" />
        </div>
        <span className="text-xs font-medium text-green-800">WhatsApp — {client.phone}</span>
      </div>
      <div className="bg-white rounded-xl p-3 text-sm text-mocha-800 shadow-sm">
        {msg}
      </div>
      <p className="text-right text-xs text-gray-400 mt-1">10:30 ✓✓</p>
    </div>
  )
}

export default function RecurrencePage() {
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState(WHATSAPP_TEMPLATES[0])
  const [sentList, setSentList] = useState<number[]>([])

  const urgent = RECURRING_CLIENTS.filter(c => c.days_to_event <= 14)
  const upcoming = RECURRING_CLIENTS.filter(c => c.days_to_event > 14 && c.days_to_event <= 30)

  const handleSend = (clientId: number) => setSentList(s => [...s, clientId])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <RefreshCw size={22} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-mocha-900">Recorrência de Clientes</h2>
          <p className="text-mocha-500 text-sm">Automatize lembretes e reconquiste clientes no momento certo</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-mocha-900">4</p>
          <p className="text-xs text-mocha-400 mt-1">Eventos Próximos</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-amber-600">2</p>
          <p className="text-xs text-mocha-400 mt-1">Urgentes (≤14 dias)</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-green-600">49</p>
          <p className="text-xs text-mocha-400 mt-1">Mensagens Enviadas</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-blue-600">82%</p>
          <p className="text-xs text-mocha-400 mt-1">Taxa de Abertura</p>
        </div>
      </div>

      {/* Urgent alerts */}
      {urgent.length > 0 && (
        <div className="card border-l-4 border-red-400">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-red-500" />
            <h3 className="font-display font-semibold text-mocha-900">🚨 Urgente — Envie hoje</h3>
          </div>
          <div className="space-y-3">
            {urgent.map(client => {
              const tier = TIER_CONFIG[client.loyalty_tier as keyof typeof TIER_CONFIG]
              const isSent = sentList.includes(client.id)
              return (
                <div key={client.id} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-chocolate-100 flex items-center justify-center font-bold text-chocolate-700">
                      {client.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-mocha-900">{client.name}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${tier.color}`}>{tier.emoji}</span>
                      </div>
                      <p className="text-xs text-mocha-400">
                        {client.event_type} — daqui {client.days_to_event} dias ({client.next_event})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-mocha-400 hidden sm:block">Sugestão: <strong>{client.suggested_product}</strong></p>
                    {isSent ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle size={14} /> Enviado
                      </span>
                    ) : (
                      <button
                        onClick={() => { setSelectedClient(client); setSelectedTemplate(WHATSAPP_TEMPLATES[0]) }}
                        className="btn-primary text-xs py-1.5 flex items-center gap-1.5 bg-green-600 hover:bg-green-700"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All clients */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-100">
          <h3 className="font-display font-semibold text-mocha-900">Todos os Eventos Programados</h3>
        </div>
        <table className="w-full">
          <thead className="bg-cream-50">
            <tr>
              <th className="table-th">Cliente</th>
              <th className="table-th">Evento</th>
              <th className="table-th hidden md:table-cell">Data</th>
              <th className="table-th hidden lg:table-cell">Último Pedido</th>
              <th className="table-th hidden lg:table-cell">Total Gasto</th>
              <th className="table-th"></th>
            </tr>
          </thead>
          <tbody>
            {RECURRING_CLIENTS.map(client => {
              const tier = TIER_CONFIG[client.loyalty_tier as keyof typeof TIER_CONFIG]
              const isSent = sentList.includes(client.id)
              const urgency = client.days_to_event <= 7 ? 'text-red-600 font-bold' :
                              client.days_to_event <= 14 ? 'text-orange-600 font-medium' :
                              client.days_to_event <= 30 ? 'text-amber-600' : 'text-mocha-500'
              return (
                <tr key={client.id} className="table-tr">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-chocolate-100 flex items-center justify-center font-bold text-chocolate-700 text-sm">
                        {client.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-mocha-900 text-sm">{client.name}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${tier.color}`}>{tier.emoji}</span>
                        </div>
                        <p className="text-xs text-mocha-400">{client.orders_count} pedidos</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-sm text-mocha-600">{client.event_type}</td>
                  <td className={`table-td hidden md:table-cell text-sm ${urgency}`}>
                    {client.next_event} <span className="text-xs">({client.days_to_event}d)</span>
                  </td>
                  <td className="table-td hidden lg:table-cell text-sm text-mocha-600">{formatCurrency(client.last_order_value)}</td>
                  <td className="table-td hidden lg:table-cell font-semibold text-mocha-900">{formatCurrency(client.total_spent)}</td>
                  <td className="table-td">
                    {isSent ? (
                      <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={13} /> Enviado</span>
                    ) : client.alert_sent ? (
                      <span className="text-xs text-mocha-400">Alertado</span>
                    ) : (
                      <button
                        onClick={() => { setSelectedClient(client); setSelectedTemplate(WHATSAPP_TEMPLATES[0]) }}
                        className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                      >
                        <Send size={11} /> Enviar
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* WhatsApp templates */}
      <div className="card">
        <h3 className="font-display font-semibold text-mocha-900 mb-4">🤖 Templates de Automação WhatsApp</h3>
        <div className="space-y-3">
          {WHATSAPP_TEMPLATES.map(t => (
            <div key={t.id} className="border border-cream-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-mocha-900">{t.name}</p>
                  <p className="text-xs text-mocha-400 flex items-center gap-1"><Clock size={11} /> {t.trigger}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600 font-medium">{t.opened}/{t.sent} abertos</p>
                  <p className="text-xs text-mocha-400">{Math.round((t.opened / t.sent) * 100)}% abertura</p>
                </div>
              </div>
              <p className="text-sm text-mocha-600 bg-cream-50 rounded-xl p-3 italic">
                "{t.message('Cliente', 'Bolo Especial')}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp preview modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mocha-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-cream-100">
              <div>
                <h3 className="font-display font-bold text-mocha-900">Prévia da Mensagem</h3>
                <p className="text-xs text-mocha-400">Para: {selectedClient.name} — {selectedClient.phone}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-cream-100 rounded-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Template</label>
                <select className="input text-sm" onChange={e => setSelectedTemplate(WHATSAPP_TEMPLATES.find(t => t.id === e.target.value) || WHATSAPP_TEMPLATES[0])}>
                  {WHATSAPP_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <MessagePreview client={selectedClient} template={selectedTemplate} />
            </div>
            <div className="flex gap-3 p-6 border-t border-cream-100">
              <button
                onClick={() => { handleSend(selectedClient.id); setSelectedClient(null) }}
                className="btn-primary flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Send size={16} /> Enviar pelo WhatsApp
              </button>
              <button onClick={() => setSelectedClient(null)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
