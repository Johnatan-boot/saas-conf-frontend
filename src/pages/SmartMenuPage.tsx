import React, { useState, useEffect, useCallback } from 'react'
import { Brain, TrendingUp, TrendingDown, Star, RefreshCw, Package, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import api from '../services/api'
import { formatCurrency } from '../utils'
import { LoadingPage, EmptyState } from '../components/ui'

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export default function SmartMenuPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  const fetch = useCallback(() => {
    setLoading(true)
    api.get('/dashboard/smart-menu')
      .then(r => { setData(r.data.data); setSelected(null) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) return <LoadingPage />

  const products: any[] = data?.products || []
  const slowMovers: any[] = data?.slowMovers || []
  const weekdayScores: any[] = data?.weekdayScores || []

  if (products.length === 0) return (
    <div className="space-y-6">
      <Header onRefresh={fetch} />
      <EmptyState title="Nenhum produto cadastrado" description="Cadastre produtos e registre pedidos para ver as análises do menu aqui." />
    </div>
  )

  // Monta scores por produto por dia da semana
  const productScoreMap: Record<number, number[]> = {}
  for (const ws of weekdayScores) {
    if (!productScoreMap[ws.product_id]) productScoreMap[ws.product_id] = [0,0,0,0,0,0,0]
    productScoreMap[ws.product_id][ws.weekday] = Number(ws.cnt)
  }

  const topProducts = [...products].slice(0, 10).map(p => ({
    ...p,
    margin: p.cost_price > 0 && p.price > 0 ? ((p.price - p.cost_price) / p.price) * 100 : null,
    weekdayData: WEEKDAYS.map((day, i) => ({
      day,
      pedidos: productScoreMap[p.id]?.[i] || 0,
    })),
  }))

  const todayWeekday = (new Date().getDay() + 6) % 7 // 0=Seg
  const todayHero = topProducts.reduce((best, p) => {
    const todayScore = productScoreMap[p.id]?.[todayWeekday] || 0
    const bestScore = productScoreMap[best?.id]?.[todayWeekday] || 0
    return todayScore > bestScore ? p : best
  }, topProducts[0])

  const chartData = topProducts.slice(0, 8).map(p => ({
    name: p.name?.length > 14 ? p.name.substring(0, 12) + '…' : p.name,
    fullName: p.name,
    vendas: Number(p.total_sold || 0),
    receita: Number(p.total_revenue || 0),
  }))

  const selectedProduct = selected || topProducts[0]
  const radarData = selectedProduct?.weekdayData || []

  return (
    <div className="space-y-6">
      <Header onRefresh={fetch} />

      {/* Hero do dia */}
      {todayHero && (
        <div className="card bg-gradient-to-br from-chocolate-800 to-chocolate-900 text-cream-50">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 flex items-center justify-center text-3xl flex-shrink-0">🎂</div>
            <div className="flex-1">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">⭐ Destaque de hoje — {WEEKDAYS[todayWeekday]}</p>
              <h3 className="font-display text-xl font-bold">{todayHero.name}</h3>
              <p className="text-chocolate-200 text-sm mt-0.5">
                {Number(todayHero.total_sold) > 0
                  ? `${todayHero.total_sold} unidades vendidas nos últimos 90 dias · ${formatCurrency(Number(todayHero.total_revenue))} em receita`
                  : 'Produto cadastrado, ainda sem vendas registradas'}
              </p>
              {todayHero.margin !== null && (
                <span className="inline-block mt-2 text-xs bg-amber-400/20 text-amber-300 px-3 py-0.5 rounded-full font-medium">
                  {todayHero.margin.toFixed(0)}% de margem
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de vendas */}
        <div className="card">
          <h3 className="font-display font-semibold text-mocha-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-chocolate-600" /> Ranking de Vendas (90 dias)
          </h3>
          {chartData.every(p => p.vendas === 0)
            ? <p className="text-sm text-mocha-400 text-center py-8">Ainda sem pedidos registrados. Os dados aparecem aqui quando pedidos forem finalizados.</p>
            : <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9a7e5a' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#6F4F37' }} width={90} />
                  <Tooltip
                    formatter={(v: any, name: string) => [name === 'receita' ? formatCurrency(v) : v, name === 'receita' ? 'Receita' : 'Vendas']}
                    contentStyle={{ background: '#2c1c12', color: '#fdf6f0', border: 'none', borderRadius: 12, fontSize: 11 }}
                  />
                  <Bar dataKey="vendas" fill="#6F4F37" radius={[0,4,4,0]} name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Score por dia da semana */}
        <div className="card">
          <h3 className="font-display font-semibold text-mocha-900 mb-2 flex items-center gap-2">
            <Brain size={16} className="text-chocolate-600" /> Pedidos por Dia da Semana
          </h3>
          <p className="text-xs text-mocha-400 mb-3">Selecione um produto para ver o padrão de demanda:</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {topProducts.slice(0, 6).map(p => (
              <button key={p.id} onClick={() => setSelected(p)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${selectedProduct?.id === p.id ? 'bg-chocolate-800 text-white' : 'bg-cream-100 text-mocha-600 hover:bg-cream-200'}`}>
                {p.name?.length > 12 ? p.name.substring(0, 10) + '…' : p.name}
              </button>
            ))}
          </div>
          {radarData.every((d: any) => d.pedidos === 0)
            ? <p className="text-sm text-mocha-400 text-center py-6">Sem dados de pedidos por dia da semana ainda</p>
            : <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e8d9cc" />
                  <PolarAngleAxis dataKey="day" tick={{ fontSize: 11, fill: '#6F4F37' }} />
                  <Radar name="Pedidos" dataKey="pedidos" stroke="#c4621d" fill="#c4621d" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
          }
        </div>
      </div>

      {/* Produtos parados */}
      {slowMovers.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold text-mocha-900 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Produtos Parados (sem venda há +14 dias)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slowMovers.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-mocha-800 truncate">{p.name}</p>
                  <p className="text-xs text-amber-700">Estoque: {p.stock} · {p.days_since_last_sale > 900 ? 'Nunca vendido' : `${p.days_since_last_sale}d sem venda`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela completa */}
      <div className="card overflow-x-auto">
        <h3 className="font-display font-semibold text-mocha-900 mb-4">Todos os Produtos</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cream-100 text-xs text-mocha-400 text-left">
              <th className="pb-2">Produto</th>
              <th className="pb-2 text-center">Vendas (90d)</th>
              <th className="pb-2 text-right">Receita</th>
              <th className="pb-2 text-center">Margem</th>
              <th className="pb-2 text-center">Estoque</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={p.id} className="border-b border-cream-50 hover:bg-cream-50">
                <td className="py-2 font-medium text-mocha-800">
                  <span className="text-mocha-300 text-xs mr-2">#{i+1}</span>{p.name}
                </td>
                <td className="py-2 text-center font-semibold text-chocolate-700">{p.total_sold || 0}</td>
                <td className="py-2 text-right text-mocha-700">{formatCurrency(Number(p.total_revenue || 0))}</td>
                <td className="py-2 text-center">
                  {p.margin !== null
                    ? <span className={`font-semibold ${p.margin >= 50 ? 'text-green-600' : p.margin >= 35 ? 'text-amber-600' : 'text-red-500'}`}>{p.margin.toFixed(0)}%</span>
                    : <span className="text-mocha-300 text-xs">sem custo</span>}
                </td>
                <td className={`py-2 text-center font-medium ${p.stock <= p.min_stock ? 'text-red-500' : 'text-mocha-700'}`}>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Header({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center">
          <Brain size={22} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-mocha-900">Menu Inteligente</h2>
          <p className="text-mocha-500 text-sm">Análise de desempenho baseada nos seus pedidos reais</p>
        </div>
      </div>
      <button onClick={onRefresh} className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 transition">
        <RefreshCw size={14} className="text-mocha-500" />
      </button>
    </div>
  )
}
