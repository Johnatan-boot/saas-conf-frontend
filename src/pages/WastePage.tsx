import React, { useState } from 'react'
import { Trash2, Plus, TrendingDown, AlertTriangle, Package, BarChart2, X, Edit } from 'lucide-react'
import { formatCurrency } from '../utils'
import { clsx } from '../utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'

const MOCK_WASTE = [
  { id: 1, ingredient: 'Farinha de Trigo', unit: 'kg', qty_wasted: 2.5, unit_cost: 4.50, reason: 'Validade vencida', date: '2025-05-04', batch: 'Bolo Red Velvet', loss: 11.25 },
  { id: 2, ingredient: 'Chantilly', unit: 'L', qty_wasted: 0.8, unit_cost: 18.00, reason: 'Erro de produção', date: '2025-05-03', batch: 'Torta de Morango', loss: 14.40 },
  { id: 3, ingredient: 'Chocolate Belga', unit: 'kg', qty_wasted: 0.3, unit_cost: 85.00, reason: 'Queimado', date: '2025-05-02', batch: 'Trufa Premium', loss: 25.50 },
  { id: 4, ingredient: 'Manteiga', unit: 'kg', qty_wasted: 0.5, unit_cost: 32.00, reason: 'Derreteu / temperatura', date: '2025-05-01', batch: 'Croissant', loss: 16.00 },
  { id: 5, ingredient: 'Morango', unit: 'kg', qty_wasted: 1.2, unit_cost: 25.00, reason: 'Compra excessiva', date: '2025-04-30', batch: 'Cheesecake', loss: 30.00 },
  { id: 6, ingredient: 'Leite condensado', unit: 'un', qty_wasted: 3, unit_cost: 8.50, reason: 'Validade vencida', date: '2025-04-29', batch: 'Brigadeiro', loss: 25.50 },
]

const WASTE_REASONS = [
  { reason: 'Validade vencida', total: 36.75, color: '#ef4444' },
  { reason: 'Erro de produção', total: 14.40, color: '#f97316' },
  { reason: 'Queimado', total: 25.50, color: '#eab308' },
  { reason: 'Temperatura', total: 16.00, color: '#8b5cf6' },
  { reason: 'Compra excessiva', total: 30.00, color: '#3b82f6' },
  { reason: 'Outros', total: 25.50, color: '#6b7280' },
]

const TREND_DATA = [
  { week: 'Sem 1', loss: 52 },
  { week: 'Sem 2', loss: 87 },
  { week: 'Sem 3', loss: 43 },
  { week: 'Sem 4', loss: 68 },
  { week: 'Sem 5', loss: 148 },
  { week: 'Sem 6', loss: 122 },
  { week: 'Sem 7', loss: 95 },
  { week: 'Sem 8', loss: 148.15 },
]

const REASON_OPTIONS = [
  'Validade vencida', 'Erro de produção', 'Queimado',
  'Derreteu / temperatura', 'Compra excessiva', 'Pedido cancelado', 'Outros'
]

export default function WastePage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    ingredient: '', unit: 'kg', qty_wasted: '', unit_cost: '', reason: '', batch: ''
  })
  const [records, setRecords] = useState(MOCK_WASTE)

  const totalLoss = records.reduce((a, r) => a + r.loss, 0)
  const avgLoss = totalLoss / (TREND_DATA.length || 1)
  const topWaste = [...records].sort((a, b) => b.loss - a.loss)[0]

  const handleAdd = () => {
    if (!form.ingredient || !form.qty_wasted || !form.unit_cost) return
    const qty = Number(form.qty_wasted)
    const cost = Number(form.unit_cost)
    const newRecord = {
      id: Date.now(),
      ingredient: form.ingredient,
      unit: form.unit,
      qty_wasted: qty,
      unit_cost: cost,
      reason: form.reason || 'Outros',
      date: new Date().toISOString().split('T')[0],
      batch: form.batch || 'Não especificado',
      loss: qty * cost,
    }
    setRecords(r => [newRecord, ...r])
    setForm({ ingredient: '', unit: 'kg', qty_wasted: '', unit_cost: '', reason: '', batch: '' })
    setShowForm(false)
  }

  const handleDelete = (id: number) => setRecords(r => r.filter(rec => rec.id !== id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-mocha-900">Controle de Desperdício</h2>
          <p className="text-mocha-500 text-sm">Identifique onde seu dinheiro está sendo perdido</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Registrar Desperdício
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mocha-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-cream-100">
              <h3 className="font-display font-bold text-mocha-900">Registrar Desperdício</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-cream-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Ingrediente</label>
                  <input className="input" placeholder="Ex: Farinha de Trigo" value={form.ingredient}
                    onChange={e => setForm(f => ({ ...f, ingredient: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Quantidade Perdida</label>
                  <input className="input" type="number" step="0.01" placeholder="0.00" value={form.qty_wasted}
                    onChange={e => setForm(f => ({ ...f, qty_wasted: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Unidade</label>
                  <select className="input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    {['kg', 'g', 'L', 'mL', 'un', 'cx', 'pct'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Custo por Unidade (R$)</label>
                  <input className="input" type="number" step="0.01" placeholder="0.00" value={form.unit_cost}
                    onChange={e => setForm(f => ({ ...f, unit_cost: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label">Motivo</label>
                  <select className="input" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}>
                    <option value="">Selecionar...</option>
                    {REASON_OPTIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Produção Relacionada (opcional)</label>
                  <input className="input" placeholder="Ex: Bolo Red Velvet" value={form.batch}
                    onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} />
                </div>
                {form.qty_wasted && form.unit_cost && (
                  <div className="col-span-2 bg-red-50 border border-red-100 rounded-xl p-3">
                    <p className="text-xs text-red-500">Prejuízo calculado</p>
                    <p className="font-display font-bold text-red-700 text-xl mt-0.5">
                      {formatCurrency(Number(form.qty_wasted) * Number(form.unit_cost))}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-cream-100">
              <button onClick={handleAdd} className="btn-primary flex-1">Registrar</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card border-l-4 border-red-400">
          <p className="text-xs font-medium text-mocha-400 uppercase tracking-wider">Perda Total (mês)</p>
          <p className="font-display text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalLoss)}</p>
          <p className="text-xs text-mocha-400 mt-1">Em {records.length} registros</p>
        </div>
        <div className="card border-l-4 border-orange-400">
          <p className="text-xs font-medium text-mocha-400 uppercase tracking-wider">Maior Prejuízo</p>
          <p className="font-display text-2xl font-bold text-orange-600 mt-1">{topWaste ? topWaste.ingredient : '—'}</p>
          <p className="text-xs text-mocha-400 mt-1">{topWaste ? formatCurrency(topWaste.loss) : ''}</p>
        </div>
        <div className="card border-l-4 border-yellow-400">
          <p className="text-xs font-medium text-mocha-400 uppercase tracking-wider">Impacto na Margem</p>
          <p className="font-display text-2xl font-bold text-yellow-700 mt-1">-{formatCurrency(avgLoss)}</p>
          <p className="text-xs text-mocha-400 mt-1">Média por semana</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-display font-semibold text-mocha-900 mb-4">Tendência de Perdas (8 semanas)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9a7e5a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9a7e5a' }} tickFormatter={v => `R$${v}`} />
              <Tooltip
                contentStyle={{ background: '#2c1c12', color: '#fdf6f0', border: 'none', borderRadius: 12 }}
                formatter={(v: any) => formatCurrency(v)}
              />
              <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} name="Perda" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-mocha-900 mb-4">Perda por Motivo (R$)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WASTE_REASONS} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9a7e5a' }} tickFormatter={v => `R$${v}`} />
              <YAxis type="category" dataKey="reason" tick={{ fontSize: 10, fill: '#9a7e5a' }} width={100} />
              <Tooltip
                contentStyle={{ background: '#2c1c12', color: '#fdf6f0', border: 'none', borderRadius: 12 }}
                formatter={(v: any) => formatCurrency(v)}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Perda">
                {WASTE_REASONS.map((entry, i) => (
                  <React.Fragment key={i}>
                    {/* @ts-ignore */}
                    <rect fill={entry.color} />
                  </React.Fragment>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-3">
            {WASTE_REASONS.map(r => (
              <span key={r.reason} className="flex items-center gap-1 text-xs text-mocha-500">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: r.color }} />
                {r.reason}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Records table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-100 flex items-center justify-between">
          <h3 className="font-display font-semibold text-mocha-900">Registros de Desperdício</h3>
          <span className="text-xs text-mocha-400">{records.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50">
              <tr>
                <th className="table-th">Ingrediente</th>
                <th className="table-th">Quantidade</th>
                <th className="table-th hidden md:table-cell">Motivo</th>
                <th className="table-th hidden lg:table-cell">Produção</th>
                <th className="table-th hidden md:table-cell">Data</th>
                <th className="table-th text-right">Prejuízo</th>
                <th className="table-th w-12"></th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="table-tr">
                  <td className="table-td font-medium text-mocha-900">{r.ingredient}</td>
                  <td className="table-td">{r.qty_wasted} {r.unit}</td>
                  <td className="table-td hidden md:table-cell">
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-lg">{r.reason}</span>
                  </td>
                  <td className="table-td hidden lg:table-cell text-mocha-400 text-xs">{r.batch}</td>
                  <td className="table-td hidden md:table-cell text-mocha-400 text-xs">{r.date}</td>
                  <td className="table-td text-right font-bold text-red-600">{formatCurrency(r.loss)}</td>
                  <td className="table-td">
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-50 text-mocha-300 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-cream-50 border-t-2 border-cream-200">
              <tr>
                <td className="table-td font-bold text-mocha-900" colSpan={5}>Total de Perdas</td>
                <td className="table-td text-right font-display font-bold text-red-600 text-base">{formatCurrency(totalLoss)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-amber-50 border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-amber-600" />
          <h4 className="font-semibold text-amber-800">Alertas e Sugestões da IA</h4>
        </div>
        <div className="space-y-2 text-sm text-amber-700">
          <p>🔴 <strong>Morango</strong> representa 20% do desperdício — considere pedidos menores e mais frequentes.</p>
          <p>🟡 <strong>Leite condensado</strong> com validade vencida 2x seguidas — revise o ponto de pedido.</p>
          <p>🟢 Implementar FIFO (primeiro a entrar, primeiro a sair) pode reduzir perdas por validade em ~40%.</p>
        </div>
      </div>
    </div>
  )
}
