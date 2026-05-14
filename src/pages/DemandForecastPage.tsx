import React, { useState } from 'react'
import { Brain, TrendingUp, Calendar, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, ReferenceLine } from 'recharts'
import { formatCurrency } from '../utils'

const FORECAST_DATA = [
  { week: 'Sem 1 Maio', real: 34, forecast: null, type: 'real' },
  { week: 'Sem 2 Maio', real: 41, forecast: null, type: 'real' },
  { week: 'Sem 3 Maio', real: 38, forecast: null, type: 'real' },
  { week: 'Dia das Mães', real: 89, forecast: null, type: 'real', event: true },
  { week: 'Sem 1 Jun', real: null, forecast: 38, type: 'forecast' },
  { week: 'Namorados', real: null, forecast: 72, type: 'forecast', event: true },
  { week: 'Sem 3 Jun', real: null, forecast: 35, type: 'forecast' },
  { week: 'Sem 4 Jun', real: null, forecast: 40, type: 'forecast' },
]

const PRODUCT_FORECAST = [
  {
    product: 'Bolo de Chocolate', category: 'Bolos',
    current_week: 8, next_week: 11, change: +38,
    reason: 'Dia dos Namorados (+38%)',
    qty_to_produce: 11, ingredients: [
      { name: 'Chocolate em pó', qty: '2.2 kg' },
      { name: 'Farinha', qty: '3.3 kg' },
      { name: 'Ovos', qty: '44 un' },
    ],
    alert: 'high',
  },
  {
    product: 'Brigadeiro', category: 'Doces',
    current_week: 120, next_week: 180, change: +50,
    reason: 'Alta demanda em festas de Junho',
    qty_to_produce: 180, ingredients: [
      { name: 'Leite condensado', qty: '18 cx' },
      { name: 'Chocolate', qty: '3.6 kg' },
      { name: 'Manteiga', qty: '1.8 kg' },
    ],
    alert: 'high',
  },
  {
    product: 'Cupcake Decorado', category: 'Cupcakes',
    current_week: 24, next_week: 22, change: -8,
    reason: 'Queda leve pós-feriado',
    qty_to_produce: 22, ingredients: [
      { name: 'Farinha', qty: '2.2 kg' },
      { name: 'Chantilly', qty: '1.1 L' },
    ],
    alert: 'low',
  },
  {
    product: 'Torta Morango', category: 'Tortas',
    current_week: 6, next_week: 10, change: +67,
    reason: 'Namorados — tortas são top presente',
    qty_to_produce: 10, ingredients: [
      { name: 'Morango', qty: '5 kg' },
      { name: 'Chantilly', qty: '2 L' },
      { name: 'Base biscoito', qty: '1.5 kg' },
    ],
    alert: 'high',
  },
]

const EVENTS = [
  { date: '12/06', name: 'Dia dos Namorados', impact: '+60%', color: 'bg-pink-100 text-pink-700' },
  { date: '24/06', name: 'São João', impact: '+25%', color: 'bg-orange-100 text-orange-700' },
  { date: '29/06', name: 'São Pedro', impact: '+15%', color: 'bg-amber-100 text-amber-700' },
  { date: '05/07', name: 'Férias Escolares', impact: '+20%', color: 'bg-blue-100 text-blue-700' },
]

const WEEKDAY_PATTERN = [
  { day: 'Seg', orders: 8, color: '#e2d9d0' },
  { day: 'Ter', orders: 12, color: '#c4a882' },
  { day: 'Qua', orders: 15, color: '#a07850' },
  { day: 'Qui', orders: 18, color: '#6F4F37' },
  { day: 'Sex', orders: 32, color: '#4a3020' },
  { day: 'Sáb', orders: 45, color: '#2c1c12' },
  { day: 'Dom', orders: 28, color: '#8B5E3C' },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-mocha-900 text-cream-50 px-3 py-2 rounded-xl text-xs shadow-warm-lg">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any) => p.value != null && (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value} pedidos
        </p>
      ))}
    </div>
  )
}

export default function DemandForecastPage() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
          <Brain size={22} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-mocha-900">Previsão de Demanda</h2>
          <p className="text-mocha-500 text-sm">IA analisa histórico e eventos para prever seus pedidos</p>
        </div>
      </div>

      {/* AI Banner */}
      <div className="card bg-gradient-to-r from-purple-600 to-purple-800 text-white border-0">
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-purple-200 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">📈 Alerta da IA — Dia dos Namorados em 38 dias</p>
            <p className="text-purple-100 text-sm mt-1">
              Com base no seu histórico do ano passado e em padrões do setor, a semana do Dia dos Namorados
              deve aumentar <strong>60% nos pedidos de bolos e tortas</strong>.
              Produza estoque de chocolate e morango com antecedência.
            </p>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="card">
        <h3 className="font-display font-semibold text-mocha-900 mb-1">Pedidos: Real vs Previsão</h3>
        <p className="text-xs text-mocha-400 mb-4">Semanas anteriores (real) + próximas semanas (previsão IA)</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={FORECAST_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9a7e5a' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9a7e5a' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x="Dia das Mães" stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '🎀 Mães', fill: '#f59e0b', fontSize: 11 }} />
            <ReferenceLine x="Namorados" stroke="#ec4899" strokeDasharray="4 2" label={{ value: '💕 Namo.', fill: '#ec4899', fontSize: 11 }} />
            <Line type="monotone" dataKey="real" stroke="#6F4F37" strokeWidth={2.5} dot={{ fill: '#6F4F37', r: 4 }} name="Real" connectNulls={false} />
            <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: '#8b5cf6', r: 3 }} name="Previsão IA" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-mocha-500">
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-chocolate-600 inline-block" /> Real</span>
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-purple-500 inline-block" style={{ borderTop: '2px dashed #8b5cf6' }} /> Previsão IA</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekday pattern */}
        <div className="card">
          <h3 className="font-display font-semibold text-mocha-900 mb-1">Padrão por Dia da Semana</h3>
          <p className="text-xs text-mocha-400 mb-4">Média histórica de pedidos por dia</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={WEEKDAY_PATTERN}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9a7e5a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9a7e5a' }} />
              <Tooltip contentStyle={{ background: '#2c1c12', color: '#fdf6f0', border: 'none', borderRadius: 12 }} />
              <Bar dataKey="orders" radius={[4, 4, 0, 0]} name="Pedidos">
                {WEEKDAY_PATTERN.map((e, i) => (
                  <React.Fragment key={i}>
                    {/* @ts-ignore */}
                    <rect fill={e.color} />
                  </React.Fragment>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-mocha-400 mt-2">💡 Sexta e sábado somam 55% dos seus pedidos — foque a produção</p>
        </div>

        {/* Upcoming events */}
        <div className="card">
          <h3 className="font-display font-semibold text-mocha-900 mb-4">Próximos Eventos de Alta</h3>
          <div className="space-y-3">
            {EVENTS.map(e => (
              <div key={e.name} className={`flex items-center justify-between rounded-xl px-4 py-3 ${e.color}`}>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs font-bold">{e.date.split('/')[0]}</p>
                    <p className="text-xs opacity-70">/{e.date.split('/')[1]}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{e.name}</p>
                  </div>
                </div>
                <span className="font-bold text-sm">{e.impact}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-mocha-400 mt-3">
            💡 Configure lembretes no calendário para preparar insumos com 2 semanas de antecedência.
          </p>
        </div>
      </div>

      {/* Product forecast */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-100">
          <h3 className="font-display font-semibold text-mocha-900">Sugestão de Produção — Próxima Semana</h3>
          <p className="text-xs text-mocha-400 mt-0.5">Clique em um produto para ver lista de ingredientes necessários</p>
        </div>
        <div className="divide-y divide-cream-100">
          {PRODUCT_FORECAST.map(p => (
            <div key={p.product}>
              <button
                className="w-full text-left px-6 py-4 hover:bg-cream-50 transition-colors"
                onClick={() => setSelectedProduct(selectedProduct?.product === p.product ? null : p)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${p.alert === 'high' ? 'bg-red-500' : 'bg-green-400'}`} />
                    <div>
                      <p className="font-medium text-mocha-900">{p.product}</p>
                      <p className="text-xs text-mocha-400">{p.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-mocha-400">Esta sem → Próx. sem</p>
                      <p className="font-semibold text-mocha-900">{p.current_week} → <span className={p.change > 0 ? 'text-red-600' : 'text-green-600'}>{p.next_week} un</span></p>
                    </div>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${p.change > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {p.change > 0 ? '+' : ''}{p.change}%
                    </span>
                    <ChevronRight size={16} className={`text-mocha-300 transition-transform ${selectedProduct?.product === p.product ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </button>

              {selectedProduct?.product === p.product && (
                <div className="px-6 pb-4 bg-cream-50">
                  <p className="text-xs font-semibold text-mocha-500 uppercase tracking-wider mb-2">Ingredientes para {p.qty_to_produce} unidades:</p>
                  <div className="flex flex-wrap gap-2">
                    {p.ingredients.map((ing, i) => (
                      <div key={i} className="bg-white border border-cream-200 rounded-xl px-3 py-2 text-sm">
                        <span className="font-medium text-mocha-800">{ing.qty}</span>
                        <span className="text-mocha-400 ml-1">{ing.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
