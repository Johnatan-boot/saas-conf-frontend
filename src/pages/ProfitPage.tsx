import React, { useState, useEffect, useCallback } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Target, RefreshCw, Loader2, Package } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line, ReferenceLine
} from 'recharts'
import api from '../services/api'
import { formatCurrency } from '../utils'
import { EmptyState, LoadingPage } from '../components/ui'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-mocha-900 text-cream-50 px-4 py-3 rounded-xl text-xs shadow-warm-lg space-y-1">
      <p className="font-semibold text-sm">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 10 ? formatCurrency(p.value) : `${Number(p.value).toFixed(1)}%`}
        </p>
      ))}
    </div>
  )
}

export default function ProfitPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  const fetch = useCallback(() => {
    setLoading(true)
    api.get(`/dashboard/profit?days=${days}`)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [days])

  useEffect(() => { fetch() }, [fetch])

  if (loading) return <LoadingPage />

  const daily: any[] = (data?.dailyData || []).map((d: any) => ({
    date: new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    revenue: Number(d.revenue || 0),
    cost: Number(d.cost || 0),
    profit: Number(d.revenue || 0) - Number(d.cost || 0),
    margin: Number(d.revenue) > 0 ? ((Number(d.revenue) - Number(d.cost)) / Number(d.revenue)) * 100 : 0,
  }))

  const products: any[] = (data?.productMargin || []).map((p: any) => ({
    name: p.name?.length > 16 ? p.name.substring(0, 14) + '…' : p.name,
    fullName: p.name,
    revenue: Number(p.revenue || 0),
    cost: Number(p.cost || 0),
    profit: Number(p.revenue || 0) - Number(p.cost || 0),
    units: Number(p.units_sold || 0),
    margin: Number(p.revenue) > 0 ? ((Number(p.revenue) - Number(p.cost)) / Number(p.revenue)) * 100 : 0,
  }))

  const totalRevenue = daily.reduce((a, d) => a + d.revenue, 0)
  const totalCost = daily.reduce((a, d) => a + d.cost, 0)
  const totalProfit = totalRevenue - totalCost
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  const isEmpty = daily.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center">
            <DollarSign size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-mocha-900">Painel de Lucro Real</h2>
            <p className="text-mocha-500 text-sm">Dados reais dos seus pedidos entregues</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${days === d ? 'bg-chocolate-800 text-white' : 'bg-cream-100 text-mocha-600 hover:bg-cream-200'}`}>
              {d}d
            </button>
          ))}
          <button onClick={fetch} className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 transition">
            <RefreshCw size={14} className="text-mocha-500" />
          </button>
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          title="Nenhum dado de faturamento"
          description="Finalize pedidos como 'Entregue' para ver os dados de lucro aqui."
        />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: `Faturamento (${days}d)`, value: formatCurrency(totalRevenue), color: 'text-mocha-900', border: '' },
              { label: `Custo Total (${days}d)`, value: formatCurrency(totalCost), color: 'text-red-600', border: '' },
              { label: `Lucro Líquido (${days}d)`, value: formatCurrency(totalProfit), color: totalProfit >= 0 ? 'text-green-700' : 'text-red-600', border: 'border-l-4 border-green-400' },
              { label: 'Margem Média', value: `${avgMargin.toFixed(1)}%`, color: avgMargin >= 50 ? 'text-green-700' : avgMargin >= 35 ? 'text-amber-600' : 'text-red-600', border: '' },
            ].map(k => (
              <div key={k.label} className={`card ${k.border}`}>
                <p className="text-xs font-medium text-mocha-400 uppercase tracking-wider">{k.label}</p>
                <p className={`font-display text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Gráfico diário */}
          <div className="card">
            <h3 className="font-display font-semibold text-mocha-900 mb-4">Receita vs Custo vs Lucro</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6F4F37" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6F4F37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9a7e5a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9a7e5a' }} tickFormatter={v => `R$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6F4F37" strokeWidth={2} fill="url(#gRevenue)" name="Faturamento" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fill="url(#gProfit)" name="Lucro" />
                <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Custo" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Margem por produto */}
            <div className="card">
              <h3 className="font-display font-semibold text-mocha-900 mb-4">Margem por Produto</h3>
              {products.length === 0
                ? <p className="text-sm text-mocha-400 text-center py-6">Nenhum produto com custo cadastrado</p>
                : <div className="space-y-3">
                    {[...products].sort((a, b) => b.margin - a.margin).map(p => (
                      <div key={p.fullName}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-mocha-800 truncate max-w-[150px]" title={p.fullName}>{p.fullName}</span>
                          <div className="text-right flex-shrink-0">
                            <span className={`font-bold ${p.margin >= 50 ? 'text-green-600' : p.margin >= 35 ? 'text-amber-600' : 'text-red-500'}`}>
                              {p.margin.toFixed(0)}%
                            </span>
                            <span className="text-xs text-mocha-400 ml-1">({formatCurrency(p.profit)})</span>
                          </div>
                        </div>
                        <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.margin >= 50 ? 'bg-green-500' : p.margin >= 35 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${Math.min(p.margin, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            {/* Margem diária */}
            <div className="card">
              <h3 className="font-display font-semibold text-mocha-900 mb-4">Margem Diária (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9a7e5a' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9a7e5a' }} tickFormatter={v => `${v.toFixed(0)}%`} />
                  <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} contentStyle={{ background: '#2c1c12', color: '#fdf6f0', border: 'none', borderRadius: 12 }} />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'Meta 50%', fill: '#f59e0b', fontSize: 10 }} />
                  <Line type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} name="Margem %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insight dinâmico */}
          <div className="card bg-mocha-900 text-cream-50">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <Target size={18} className="text-amber-400" /> Análise dos últimos {days} dias
            </h3>
            <div className="space-y-2 text-sm text-chocolate-200">
              <p>💰 Seu lucro líquido foi de <strong className="text-green-400">{formatCurrency(totalProfit)}</strong> com margem média de <strong className="text-amber-400">{avgMargin.toFixed(1)}%</strong>.</p>
              {products.length > 0 && (
                <>
                  <p>🏆 Produto mais lucrativo: <strong className="text-cream-100">{products[0]?.fullName}</strong> ({formatCurrency(products[0]?.profit)} de lucro, {products[0]?.margin.toFixed(0)}% margem)</p>
                  {products.find(p => p.margin < 35) && (
                    <p>⚠️ Produto com margem baixa: <strong className="text-red-300">{products.find(p => p.margin < 35)?.fullName}</strong> — considere revisar o preço ou reduzir custo.</p>
                  )}
                </>
              )}
              <p>{avgMargin >= 45 ? '✅ Margem acima de 45% — excelente resultado para confeitarias!' : avgMargin >= 30 ? '📈 Margem razoável. Meta recomendada: 45%+' : '🔴 Margem abaixo de 30% — revise custos urgente!'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
