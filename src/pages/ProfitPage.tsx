import React, { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Target, BarChart2, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line, ReferenceLine
} from 'recharts'
import { formatCurrency } from '../utils'

const DAILY_PROFIT = [
  { date: '01/05', revenue: 380, cost: 165, profit: 215, margin: 56.6 },
  { date: '02/05', revenue: 520, cost: 228, profit: 292, margin: 56.2 },
  { date: '03/05', revenue: 180, cost: 85, profit: 95, margin: 52.8 },
  { date: '04/05', revenue: 890, cost: 375, profit: 515, margin: 57.9 },
  { date: '05/05', revenue: 640, cost: 278, profit: 362, margin: 56.6 },
  { date: '06/05', revenue: 950, cost: 398, profit: 552, margin: 58.1 },
  { date: '07/05', revenue: 720, cost: 315, profit: 405, margin: 56.3 },
]

const PRODUCT_MARGIN = [
  { name: 'Brigadeiro', margin: 66, revenue: 1820, profit: 1201 },
  { name: 'Cupcake', margin: 62, revenue: 960, profit: 595 },
  { name: 'Bolo Choc.', margin: 56, revenue: 2400, profit: 1344 },
  { name: 'Red Velvet', margin: 55, revenue: 1560, profit: 858 },
  { name: 'Cheesecake', margin: 56, revenue: 1100, profit: 616 },
  { name: 'Macaron', margin: 45, revenue: 440, profit: 198 },
]

const COST_BREAKDOWN = [
  { label: 'Ingredientes', value: 1644, pct: 38, color: '#f59e0b' },
  { label: 'Mão de Obra', value: 1080, pct: 25, color: '#3b82f6' },
  { label: 'Gás + Luz', value: 216, pct: 5, color: '#f97316' },
  { label: 'Embalagem', value: 432, pct: 10, color: '#10b981' },
  { label: 'Aluguel/fixo', value: 860, pct: 20, color: '#8b5cf6' },
  { label: 'Marketing', value: 86, pct: 2, color: '#ec4899' },
]

const totalRevenue = DAILY_PROFIT.reduce((a, d) => a + d.revenue, 0)
const totalCost = DAILY_PROFIT.reduce((a, d) => a + d.cost, 0)
const totalProfit = DAILY_PROFIT.reduce((a, d) => a + d.profit, 0)
const avgMargin = (totalProfit / totalRevenue) * 100

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-mocha-900 text-cream-50 px-4 py-3 rounded-xl text-xs shadow-warm-lg space-y-1">
      <p className="font-semibold text-sm">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 10 ? formatCurrency(p.value) : `${p.value}%`}
        </p>
      ))}
    </div>
  )
}

export default function ProfitPage() {
  const [view, setView] = useState<'daily' | 'product'>('daily')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center">
          <DollarSign size={22} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-mocha-900">Painel de Lucro Real</h2>
          <p className="text-mocha-500 text-sm">Não só faturamento — veja seu lucro líquido de verdade</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs font-medium text-mocha-400 uppercase tracking-wider">Faturamento (7d)</p>
          <p className="font-display text-2xl font-bold text-mocha-900 mt-1">{formatCurrency(totalRevenue)}</p>
          <div className="flex items-center gap-1 mt-1 text-green-600">
            <ArrowUp size={12} />
            <span className="text-xs font-medium">+14% vs semana passada</span>
          </div>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-mocha-400 uppercase tracking-wider">Custo Total (7d)</p>
          <p className="font-display text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalCost)}</p>
          <div className="flex items-center gap-1 mt-1 text-mocha-400">
            <Minus size={12} />
            <span className="text-xs">{((totalCost / totalRevenue) * 100).toFixed(1)}% do faturamento</span>
          </div>
        </div>
        <div className="card border-l-4 border-green-400">
          <p className="text-xs font-medium text-mocha-400 uppercase tracking-wider">Lucro Líquido (7d)</p>
          <p className="font-display text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalProfit)}</p>
          <div className="flex items-center gap-1 mt-1 text-green-600">
            <ArrowUp size={12} />
            <span className="text-xs font-medium">+8% vs semana passada</span>
          </div>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-mocha-400 uppercase tracking-wider">Margem Média</p>
          <p className={`font-display text-2xl font-bold mt-1 ${avgMargin >= 50 ? 'text-green-700' : avgMargin >= 35 ? 'text-amber-600' : 'text-red-600'}`}>
            {avgMargin.toFixed(1)}%
          </p>
          <div className="mt-1">
            <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${avgMargin}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-mocha-900">Receita vs Custo vs Lucro (7 dias)</h3>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={DAILY_PROFIT}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6F4F37" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6F4F37" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9a7e5a' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9a7e5a' }} tickFormatter={v => `R$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#6F4F37" strokeWidth={2} fill="url(#colorRevenue)" name="Faturamento" />
            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fill="url(#colorProfit)" name="Lucro Líquido" />
            <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Custo Total" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margin by product */}
        <div className="card">
          <h3 className="font-display font-semibold text-mocha-900 mb-4">Margem por Produto</h3>
          <div className="space-y-3">
            {[...PRODUCT_MARGIN].sort((a, b) => b.margin - a.margin).map(p => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-mocha-800">{p.name}</span>
                  <div className="text-right">
                    <span className={`font-bold ${p.margin >= 60 ? 'text-green-600' : p.margin >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {p.margin}%
                    </span>
                    <span className="text-xs text-mocha-400 ml-2">({formatCurrency(p.profit)} lucro)</span>
                  </div>
                </div>
                <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.margin >= 60 ? 'bg-green-500' : p.margin >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${p.margin}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="card">
          <h3 className="font-display font-semibold text-mocha-900 mb-4">Composição dos Custos (mês)</h3>
          <div className="space-y-3">
            {COST_BREAKDOWN.map(c => (
              <div key={c.label} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-mocha-700">{c.label}</span>
                    <span className="font-semibold text-mocha-900">{formatCurrency(c.value)} <span className="text-mocha-400 font-normal text-xs">({c.pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.pct * 2}%`, background: c.color }} />
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-cream-200 pt-3 flex justify-between font-bold text-sm">
              <span>Total de Custos</span>
              <span className="text-red-600">{formatCurrency(COST_BREAKDOWN.reduce((a, c) => a + c.value, 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily margin */}
      <div className="card">
        <h3 className="font-display font-semibold text-mocha-900 mb-4">Margem Diária (%)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={DAILY_PROFIT}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9a7e5a' }} />
            <YAxis domain={[45, 65]} tick={{ fontSize: 11, fill: '#9a7e5a' }} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: '#2c1c12', color: '#fdf6f0', border: 'none', borderRadius: 12 }} formatter={(v: any) => `${v}%`} />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'Meta 50%', fill: '#f59e0b', fontSize: 10 }} />
            <Line type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Margem" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="card bg-mocha-900 text-cream-50">
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          <Target size={18} className="text-amber-400" /> Insights da IA
        </h3>
        <div className="space-y-2 text-sm text-chocolate-200">
          <p>📈 <strong className="text-cream-100">Sábado</strong> é seu dia mais lucrativo — concentre produção especial para esse dia.</p>
          <p>🔴 <strong className="text-cream-100">Macaron</strong> tem a menor margem (45%) — ou ajuste o preço ou reduza o custo dos ingredientes.</p>
          <p>💰 Reduzir o desperdício semanal de <strong className="text-amber-400">R$ 148</strong> aumentaria sua margem para <strong className="text-amber-400">~60%</strong>.</p>
          <p>✅ Seu lucro líquido de <strong className="text-green-400">{avgMargin.toFixed(0)}%</strong> está acima da média do setor (35-40%). Excelente!</p>
        </div>
      </div>
    </div>
  )
}
