import React, { useState, useEffect } from 'react'
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, Plus, X, Info, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { Product } from '../types'
import { formatCurrency, clsx } from '../utils'
import { LoadingPage, EmptyState } from '../components/ui'

interface Ingredient { id: number; name: string; qty: number; unit: string; unit_cost: number }

function MarginBar({ margin }: { margin: number }) {
  const good = margin >= 40
  const ok = margin >= 25 && margin < 40
  return (
    <div className="relative">
      <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${good ? 'bg-green-500' : ok ? 'bg-amber-400' : 'bg-red-500'}`}
          style={{ width: `${Math.min(Math.max(margin, 0), 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-mocha-400 mt-1">
        <span>0%</span>
        <span className="text-red-400">25%</span>
        <span className="text-amber-500">40%</span>
        <span className="text-green-500">100%</span>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [salePrice, setSalePrice] = useState('0')
  const [timeHours, setTimeHours] = useState('1')
  const [gasCost, setGasCost] = useState('0')
  const [packagingCost, setPackagingCost] = useState('0')
  const [laborHourly, setLaborHourly] = useState('20')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [showAddIng, setShowAddIng] = useState(false)
  const [newIng, setNewIng] = useState({ name: '', qty: '', unit: 'kg', unit_cost: '' })
  const [targetMargin, setTargetMargin] = useState(40)
  const [saving, setSaving] = useState(false)

  // ── Carrega os produtos REAIS já cadastrados no sistema ──────────
  useEffect(() => {
    api.get('/products')
      .then(res => {
        const active: Product[] = (res.data.data || []).filter((p: Product) => p.is_active)
        setProducts(active)
        if (active.length > 0) handleSelectProduct(active[0])
      })
      .catch(() => toast.error('Erro ao carregar produtos'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ingredientCost = ingredients.reduce((a, i) => a + i.qty * i.unit_cost, 0)
  const laborCost = Number(timeHours || 0) * Number(laborHourly || 0)
  const totalCost = ingredientCost + laborCost + Number(gasCost || 0) + Number(packagingCost || 0)
  const currentMargin = Number(salePrice) ? ((Number(salePrice) - totalCost) / Number(salePrice)) * 100 : 0
  const suggestedPrice = totalCost / (1 - targetMargin / 100)
  const profit = Number(salePrice || 0) - totalCost

  function handleSelectProduct(p: Product) {
    setSelectedProduct(p)
    setSalePrice(String(p.price))
    setTimeHours('1')
    setGasCost('0')
    setPackagingCost('0')
    setLaborHourly('20')
    // Se o produto já tem um custo registrado, usa como ponto de partida
    setIngredients(
      p.cost_price && Number(p.cost_price) > 0
        ? [{ id: 1, name: 'Custo já registrado no produto', qty: 1, unit: 'un', unit_cost: Number(p.cost_price) }]
        : []
    )
  }

  const addIngredient = () => {
    if (!newIng.name || !newIng.qty || !newIng.unit_cost) return
    setIngredients(ings => [...ings, { id: Date.now(), name: newIng.name, qty: Number(newIng.qty), unit: newIng.unit, unit_cost: Number(newIng.unit_cost) }])
    setNewIng({ name: '', qty: '', unit: 'kg', unit_cost: '' })
    setShowAddIng(false)
  }

  const removeIngredient = (id: number) => setIngredients(ings => ings.filter(i => i.id !== id))

  // ── Fecha o ciclo: grava o custo calculado e o preço de venda
  // de volta no cadastro do produto (mesma tabela usada por
  // Produtos, Pedidos e Dashboard) ──────────────────────────────
  async function handleSaveToProduct() {
    if (!selectedProduct) return
    setSaving(true)
    try {
      await api.put(`/products/${selectedProduct.id}`, {
        cost_price: Number(totalCost.toFixed(2)),
        price: Number(salePrice),
      })
      toast.success(`Custo e preço atualizados em "${selectedProduct.name}" ✅`)
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, cost_price: totalCost, price: Number(salePrice) } : p))
      setSelectedProduct(prev => prev ? { ...prev, cost_price: totalCost, price: Number(salePrice) } : prev)
    } catch {
      toast.error('Erro ao salvar no produto')
    } finally {
      setSaving(false)
    }
  }

  const costBreakdown = [
    { label: 'Ingredientes', value: ingredientCost, color: 'bg-amber-400', pct: totalCost > 0 ? (ingredientCost / totalCost) * 100 : 0 },
    { label: 'Mão de Obra', value: laborCost, color: 'bg-blue-400', pct: totalCost > 0 ? (laborCost / totalCost) * 100 : 0 },
    { label: 'Gás', value: Number(gasCost || 0), color: 'bg-orange-400', pct: totalCost > 0 ? (Number(gasCost || 0) / totalCost) * 100 : 0 },
    { label: 'Embalagem', value: Number(packagingCost || 0), color: 'bg-green-400', pct: totalCost > 0 ? (Number(packagingCost || 0) / totalCost) * 100 : 0 },
  ]

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
          <Calculator size={22} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-mocha-900">Precificação Inteligente</h2>
          <p className="text-mocha-500 text-sm">Calcule o custo real e defina o preço ideal de venda</p>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Cadastre produtos na página Produtos para usar a calculadora de precificação."
        />
      ) : (
        <>
          {/* Product selector — produtos REAIS cadastrados no sistema */}
          <div className="flex gap-2 flex-wrap">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  selectedProduct?.id === p.id
                    ? 'bg-chocolate-800 text-white shadow-warm'
                    : 'bg-white border border-cream-200 text-mocha-700 hover:border-chocolate-300'
                )}
              >
                {p.name}
                <span className={clsx('ml-2 text-xs', selectedProduct?.id === p.id ? 'text-cream-200' : 'text-mocha-400')}>
                  {formatCurrency(p.price)}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left — inputs */}
            <div className="lg:col-span-3 space-y-5">
              {/* Ingredients */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-mocha-900">Ingredientes</h3>
                  <button onClick={() => setShowAddIng(v => !v)} className="text-sm text-chocolate-700 hover:text-chocolate-900 flex items-center gap-1">
                    <Plus size={14} /> Adicionar
                  </button>
                </div>

                {showAddIng && (
                  <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-cream-50 rounded-xl">
                    <input className="input col-span-2 text-sm" placeholder="Ingrediente" value={newIng.name}
                      onChange={e => setNewIng(n => ({ ...n, name: e.target.value }))} />
                    <input className="input text-sm" type="number" placeholder="Qtd" value={newIng.qty}
                      onChange={e => setNewIng(n => ({ ...n, qty: e.target.value }))} />
                    <select className="input text-sm" value={newIng.unit} onChange={e => setNewIng(n => ({ ...n, unit: e.target.value }))}>
                      {['kg', 'g', 'L', 'mL', 'un', 'cx'].map(u => <option key={u}>{u}</option>)}
                    </select>
                    <div className="col-span-2">
                      <input className="input text-sm" type="number" step="0.01" placeholder="Custo por unidade (R$)" value={newIng.unit_cost}
                        onChange={e => setNewIng(n => ({ ...n, unit_cost: e.target.value }))} />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <button onClick={addIngredient} className="btn-primary text-sm flex-1">OK</button>
                      <button onClick={() => setShowAddIng(false)} className="btn-secondary text-sm px-3">✕</button>
                    </div>
                  </div>
                )}

                {ingredients.length === 0 ? (
                  <p className="text-sm text-mocha-400 text-center py-4">Nenhum ingrediente ainda. Clique em "Adicionar".</p>
                ) : (
                  <div className="space-y-2">
                    {ingredients.map(ing => (
                      <div key={ing.id} className="flex items-center justify-between px-3 py-2 bg-cream-50 rounded-xl">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-mocha-800">{ing.name}</span>
                          <span className="text-xs text-mocha-400 ml-2">{ing.qty} {ing.unit} × {formatCurrency(ing.unit_cost)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-mocha-900">{formatCurrency(ing.qty * ing.unit_cost)}</span>
                          <button onClick={() => removeIngredient(ing.id)} className="text-mocha-300 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Other costs */}
              <div className="card">
                <h3 className="font-display font-semibold text-mocha-900 mb-4">Outros Custos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label flex items-center gap-1">
                      Tempo de Produção (h)
                      <Info size={12} className="text-mocha-300" />
                    </label>
                    <input className="input" type="number" step="0.5" value={timeHours}
                      onChange={e => setTimeHours(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Valor Hora Mão de Obra (R$)</label>
                    <input className="input" type="number" step="1" value={laborHourly}
                      onChange={e => setLaborHourly(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Custo de Gás (R$)</label>
                    <input className="input" type="number" step="0.50" value={gasCost}
                      onChange={e => setGasCost(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Embalagem (R$)</label>
                    <input className="input" type="number" step="0.50" value={packagingCost}
                      onChange={e => setPackagingCost(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Sale price */}
              <div className="card">
                <label className="label text-base font-semibold text-mocha-900">Preço de Venda (R$)</label>
                <input
                  className="input text-xl font-bold"
                  type="number" step="1" value={salePrice}
                  onChange={e => setSalePrice(e.target.value)}
                />
                {selectedProduct && Number(salePrice) !== Number(selectedProduct.price) && (
                  <p className="text-xs text-mocha-400 mt-1">
                    Preço cadastrado atualmente: {formatCurrency(selectedProduct.price)}
                  </p>
                )}
              </div>

              {/* Salvar no produto — fecha o ciclo com Produtos/Pedidos/Dashboard */}
              {selectedProduct && (
                <button
                  onClick={handleSaveToProduct}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-chocolate-800 text-white font-semibold text-sm hover:bg-chocolate-900 transition disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar custo ({formatCurrency(totalCost)}) e preço ({formatCurrency(Number(salePrice || 0))}) em "{selectedProduct.name}"
                </button>
              )}
            </div>

            {/* Right — results */}
            <div className="lg:col-span-2 space-y-4">
              {/* Margin card */}
              <div className={clsx(
                'card border-2',
                currentMargin >= 40 ? 'border-green-300 bg-green-50' :
                currentMargin >= 25 ? 'border-amber-300 bg-amber-50' :
                'border-red-300 bg-red-50'
              )}>
                <div className="flex items-center gap-2 mb-3">
                  {currentMargin >= 40 ? <CheckCircle size={18} className="text-green-600" /> :
                   currentMargin >= 25 ? <AlertTriangle size={18} className="text-amber-600" /> :
                   <AlertTriangle size={18} className="text-red-600" />}
                  <h3 className="font-display font-bold text-mocha-900">Margem Real de Lucro</h3>
                </div>
                <div className="text-center mb-3">
                  <span className={`font-display text-5xl font-black ${currentMargin >= 40 ? 'text-green-600' : currentMargin >= 25 ? 'text-amber-600' : 'text-red-600'}`}>
                    {currentMargin.toFixed(1)}%
                  </span>
                </div>
                <MarginBar margin={currentMargin} />
                <p className={`text-xs mt-2 text-center ${currentMargin >= 40 ? 'text-green-700' : currentMargin >= 25 ? 'text-amber-700' : 'text-red-700'}`}>
                  {currentMargin >= 40 ? '✅ Margem excelente!' : currentMargin >= 25 ? '⚠️ Margem aceitável, pode melhorar' : '🔴 Margem baixa — você pode estar perdendo dinheiro!'}
                </p>
              </div>

              {/* Cost summary */}
              <div className="card">
                <h3 className="font-display font-semibold text-mocha-900 mb-3">Composição do Custo</h3>
                {costBreakdown.map(c => (
                  <div key={c.label} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-mocha-700">{c.label}</span>
                      <span className="font-semibold text-mocha-900">{formatCurrency(c.value)} <span className="text-mocha-400 font-normal">({c.pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
                <div className="border-t border-cream-200 pt-3 mt-3 flex justify-between">
                  <span className="font-bold text-mocha-900">Custo Total</span>
                  <span className="font-display font-bold text-red-600 text-lg">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-bold text-mocha-900">Lucro Líquido</span>
                  <span className={`font-display font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profit)}</span>
                </div>
              </div>

              {/* Suggested price */}
              <div className="card bg-chocolate-900 text-cream-50">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-amber-400" />
                  <h3 className="font-semibold text-sm">Preço Sugerido</h3>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-chocolate-300">Meta de Margem: <strong className="text-amber-400">{targetMargin}%</strong></label>
                  <input
                    type="range" min={20} max={70} value={targetMargin}
                    onChange={e => setTargetMargin(Number(e.target.value))}
                    className="w-full mt-1 accent-amber-400"
                  />
                  <div className="flex justify-between text-xs text-chocolate-400">
                    <span>20%</span><span>45%</span><span>70%</span>
                  </div>
                </div>
                <p className="font-display text-3xl font-black text-amber-400 text-center">
                  {formatCurrency(suggestedPrice)}
                </p>
                <p className="text-xs text-chocolate-300 text-center mt-1">
                  Para {targetMargin}% de margem sobre o custo de {formatCurrency(totalCost)}
                </p>
                <button
                  onClick={() => setSalePrice(suggestedPrice.toFixed(2))}
                  className="w-full mt-3 py-2 rounded-xl bg-amber-400 text-chocolate-900 text-sm font-semibold hover:bg-amber-300 transition"
                >
                  Usar este valor como preço de venda
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
