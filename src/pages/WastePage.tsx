import React, { useState, useEffect, useCallback } from 'react'
import { Trash2, AlertTriangle, Package, TrendingDown, RefreshCw, CheckCircle, Clock } from 'lucide-react'
import api from '../services/api'
import { formatCurrency } from '../utils'
import { LoadingPage, EmptyState } from '../components/ui'

function urgency(days: number): { label: string; color: string; bg: string; icon: React.ReactNode } {
  if (days > 30)  return { label: 'Crítico',   color: 'text-red-600',    bg: 'bg-red-50 border-red-200',    icon: <AlertTriangle size={14} className="text-red-500" /> }
  if (days > 14)  return { label: 'Atenção',   color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',  icon: <Clock size={14} className="text-amber-500" /> }
  return { label: 'Moderado', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: <TrendingDown size={14} className="text-slate-400" /> }
}

export default function WastePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'days' | 'value'>('value')

  const fetch = useCallback(() => {
    setLoading(true)
    api.get('/dashboard/waste')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) return <LoadingPage />

  const products: any[] = data?.products || []
  const summary = data?.summary || {}

  const sorted = [...products].sort((a, b) =>
    sort === 'days'
      ? Number(b.days_without_sale || 0) - Number(a.days_without_sale || 0)
      : Number(b.stock_value || 0) - Number(a.stock_value || 0)
  )

  const totalStockValue = Number(summary.total_stock_value || 0)
  const wasteValue = products.reduce((acc, p) => acc + Number(p.stock_value || 0), 0)
  const critical = products.filter(p => Number(p.days_without_sale) > 30).length
  const attention = products.filter(p => Number(p.days_without_sale) > 14 && Number(p.days_without_sale) <= 30).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <Trash2 size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-mocha-900">Controle de Desperdício</h2>
            <p className="text-mocha-500 text-sm">Produtos em estoque sem movimentação recente</p>
          </div>
        </div>
        <button onClick={fetch} className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 transition">
          <RefreshCw size={14} className="text-mocha-500" />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Valor Total em Estoque', value: formatCurrency(totalStockValue), color: 'text-mocha-900', sub: `${summary.total_products_in_stock || 0} produtos` },
          { label: 'Capital Parado', value: formatCurrency(wasteValue), color: 'text-amber-600', sub: 'sem venda +7 dias' },
          { label: 'Situação Crítica', value: critical, color: 'text-red-600', sub: '+30 dias sem venda' },
          { label: 'Atenção', value: attention, color: 'text-amber-600', sub: '14–30 dias sem venda' },
        ].map(k => (
          <div key={k.label} className="card">
            <p className="text-xs text-mocha-400 font-medium">{k.label}</p>
            <p className={`font-display text-2xl font-black mt-1 ${k.color}`}>{k.value}</p>
            <p className="text-xs text-mocha-300 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-mocha-900 text-lg">Estoque saudável!</h3>
          <p className="text-mocha-400 text-sm mt-1">Todos os produtos estão com boa movimentação. Continue assim!</p>
        </div>
      ) : (
        <>
          {/* Alerta resumo */}
          {critical > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">{critical} produto{critical > 1 ? 's' : ''} sem venda há mais de 30 dias</p>
                <p className="text-xs text-red-500 mt-0.5">Capital parado de {formatCurrency(products.filter(p => Number(p.days_without_sale) > 30).reduce((a, p) => a + Number(p.stock_value || 0), 0))} — considere promoção ou descarte</p>
              </div>
            </div>
          )}

          {/* Ordenação */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-mocha-400">Ordenar por:</span>
            {[['value', 'Valor parado'], ['days', 'Dias sem venda']].map(([id, label]) => (
              <button key={id} onClick={() => setSort(id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${sort === id ? 'bg-chocolate-800 text-white' : 'bg-cream-100 text-mocha-600 hover:bg-cream-200'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Lista de produtos */}
          <div className="space-y-3">
            {sorted.map((p: any) => {
              const days = Number(p.days_without_sale || 0)
              const urg = urgency(days)
              return (
                <div key={p.id} className={`card border ${urg.bg}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-xl flex-shrink-0">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-mocha-900">{p.name}</h3>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-white border ${urg.bg}`}>
                          {urg.icon} {urg.label}
                        </span>
                        {p.category && <span className="text-xs text-mocha-400 bg-cream-100 px-2 py-0.5 rounded-full">{p.category}</span>}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-1.5 text-xs text-mocha-500">
                        <span>Estoque: <strong className="text-mocha-700">{p.stock} un</strong></span>
                        <span>Custo unit: <strong>{formatCurrency(Number(p.cost_price || 0))}</strong></span>
                        <span>Valor parado: <strong className={urg.color}>{formatCurrency(Number(p.stock_value || 0))}</strong></span>
                        <span className={`font-medium ${urg.color}`}>
                          {days > 900 ? 'Nunca vendido' : `${days} dia${days !== 1 ? 's' : ''} sem venda`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-display font-bold ${urg.color}`}>{formatCurrency(Number(p.stock_value || 0))}</p>
                      <p className="text-xs text-mocha-400">capital parado</p>
                      <p className="text-xs text-mocha-300 mt-0.5">Venda sugerida: {formatCurrency(Number(p.price || 0))}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sugestões */}
          <div className="card bg-mocha-900 text-cream-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package size={16} className="text-amber-400" /> Sugestões para reduzir desperdício
            </h3>
            <ul className="space-y-2 text-sm text-chocolate-200">
              <li>🎁 Ofereça combo com produtos parados: "Leve 2, pague 1" para girar estoque</li>
              <li>📱 Use o WhatsApp para avisar clientes sobre promoções relâmpago</li>
              <li>🏷️ Considere reduzir o preço temporariamente para acelerar as vendas</li>
              <li>📸 Publique fotos atraentes nas redes sociais para aumentar demanda</li>
              {critical > 0 && <li>⚠️ Para itens há +30 dias: considere descontinuar ou usar como ingrediente em novos produtos</li>}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
