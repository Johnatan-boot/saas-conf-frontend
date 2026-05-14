import React, { useState } from 'react'
import { ShoppingCart, Plus, Zap, Tag, TrendingUp, Star, ArrowRight, X, Check } from 'lucide-react'
import { formatCurrency } from '../utils'
import { clsx } from '../utils'

const MENU_ITEMS = [
  { id: 1, name: 'Bolo Red Velvet', category: 'Bolos', price: 120, cost: 54, margin: 55, emoji: '🎂', popular: true, trend: 'up', weekday_score: [3,3,4,4,5,5,4] },
  { id: 2, name: 'Bolo de Cenoura', category: 'Bolos', price: 85, cost: 38, margin: 55, emoji: '🥕', popular: false, trend: 'stable', weekday_score: [4,4,3,3,4,5,3] },
  { id: 3, name: 'Brigadeiro (cx 30)', category: 'Doces', price: 65, cost: 22, margin: 66, emoji: '🍫', popular: true, trend: 'up', weekday_score: [5,5,5,5,5,5,5] },
  { id: 4, name: 'Cupcake Decorado', category: 'Cupcakes', price: 12, cost: 4.50, margin: 62, emoji: '🧁', popular: true, trend: 'stable', weekday_score: [3,3,3,4,5,5,4] },
  { id: 5, name: 'Torta de Morango', category: 'Tortas', price: 95, cost: 42, margin: 55, emoji: '🍓', popular: false, trend: 'up', weekday_score: [2,3,3,4,5,5,4] },
  { id: 6, name: 'Macaron (cx 12)', category: 'Doces', price: 55, cost: 30, margin: 45, emoji: '🫧', popular: false, trend: 'down', weekday_score: [2,2,2,3,4,5,3] },
  { id: 7, name: 'Cheesecake NY', category: 'Tortas', price: 110, cost: 48, margin: 56, emoji: '🍰', popular: false, trend: 'stable', weekday_score: [3,3,4,4,5,5,5] },
]

const COMBOS = [
  {
    id: 1, name: 'Kit Festa Completo', emoji: '🎉',
    items: ['Bolo Red Velvet', 'Brigadeiro (cx 30)', 'Cupcake Decorado ×12'],
    original_price: 120 + 65 + 144, combo_price: 269, savings: 60,
    upsell_text: 'Aproveite! Você economiza R$ 60 no kit festa.',
  },
  {
    id: 2, name: 'Duo Doce', emoji: '💕',
    items: ['Cheesecake NY', 'Torta de Morango'],
    original_price: 110 + 95, combo_price: 175, savings: 30,
    upsell_text: 'Perfeito para o Dia dos Namorados!',
  },
]

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const SLOW_ITEMS = [
  { name: 'Macaron (cx 12)', days_without_sale: 5, suggestion: 'Coloque em destaque no cardápio digital' },
  { name: 'Cheesecake NY', days_without_sale: 3, suggestion: 'Crie um combo com Torta de Morango' },
]

export default function SmartMenuPage() {
  const [activeDay, setActiveDay] = useState(5) // Saturday
  const [cart, setCart] = useState<typeof MENU_ITEMS>([])
  const [cartOpen, setCartOpen] = useState(false)

  const todayItems = [...MENU_ITEMS].sort((a, b) => b.weekday_score[activeDay] - a.weekday_score[activeDay])
  const addToCart = (item: typeof MENU_ITEMS[0]) => setCart(c => [...c, item])
  const removeFromCart = (id: number) => setCart(c => c.filter(i => i.id !== id))
  const cartTotal = cart.reduce((a, i) => a + i.price, 0)
  const ticketBoost = cartTotal > 200 ? formatCurrency(cartTotal * 0.1) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl">
            🛍️
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-mocha-900">Menu Inteligente</h2>
            <p className="text-mocha-500 text-sm">Venda mais com sugestões automáticas e combos</p>
          </div>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative btn-primary flex items-center gap-2"
        >
          <ShoppingCart size={18} />
          Carrinho
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Cart modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-mocha-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-cream-100">
              <h3 className="font-display font-bold text-mocha-900">Carrinho do Pedido</h3>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-cream-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6">
              {cart.length === 0 ? (
                <p className="text-center text-mocha-400 py-6">Carrinho vazio</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{item.emoji}</span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatCurrency(item.price)}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-mocha-300 hover:text-red-500"><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                  {/* Upsell suggestion */}
                  {cartTotal > 100 && cartTotal < 200 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
                      <p className="text-sm text-amber-800">🎯 <strong>Adicione mais {formatCurrency(200 - cartTotal)}</strong> para ganhar 10% de desconto!</p>
                    </div>
                  )}
                  {cartTotal >= 200 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3">
                      <p className="text-sm text-green-800">✅ Parabéns! Você tem direito a <strong>10% de desconto</strong> neste pedido.</p>
                    </div>
                  )}
                  <div className="border-t border-cream-200 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="font-display text-lg">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-cream-100">
              <button className="btn-primary w-full">Enviar para WhatsApp 📱</button>
            </div>
          </div>
        </div>
      )}

      {/* Day selector */}
      <div className="card">
        <h3 className="font-display font-semibold text-mocha-900 mb-3">🧠 IA: Produtos em Alta Hoje</h3>
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => setActiveDay(i)}
              className={clsx(
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                activeDay === i
                  ? 'bg-chocolate-800 text-white'
                  : 'bg-cream-100 text-mocha-600 hover:bg-cream-200'
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {todayItems.slice(0, 4).map((item, rank) => (
            <div key={item.id} className={clsx(
              'flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-card',
              rank === 0 ? 'border-amber-300 bg-amber-50' : 'border-cream-200 bg-white'
            )}>
              <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-xl flex-shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {rank === 0 && <Star size={12} className="text-amber-500 fill-amber-500" />}
                  <p className="font-medium text-mocha-900 text-sm truncate">{item.name}</p>
                </div>
                <p className="text-xs text-mocha-400">Score: {'⭐'.repeat(item.weekday_score[activeDay])}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-mocha-900">{formatCurrency(item.price)}</p>
                <p className="text-xs text-green-600">{item.margin}% margem</p>
              </div>
              <button onClick={() => addToCart(item)} className="w-8 h-8 bg-chocolate-800 hover:bg-chocolate-700 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Combos */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-amber-500" />
          <h3 className="font-display font-semibold text-mocha-900">Combos com Upsell Automático</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMBOS.map(combo => (
            <div key={combo.id} className="border-2 border-amber-200 bg-amber-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{combo.emoji}</span>
                <div>
                  <h4 className="font-bold text-mocha-900">{combo.name}</h4>
                  <p className="text-xs text-amber-700">{combo.upsell_text}</p>
                </div>
              </div>
              <ul className="space-y-1 mb-3">
                {combo.items.map(i => (
                  <li key={i} className="flex items-center gap-2 text-sm text-mocha-700">
                    <Check size={12} className="text-green-500" />
                    {i}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-mocha-400 line-through">{formatCurrency(combo.original_price)}</p>
                  <p className="font-display font-bold text-amber-700 text-xl">{formatCurrency(combo.combo_price)}</p>
                  <p className="text-xs text-green-600 font-medium">Economia de {formatCurrency(combo.savings)}</p>
                </div>
                <button className="btn-primary bg-amber-500 hover:bg-amber-600 text-white">
                  Oferecer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slow items */}
      <div className="card border-orange-200 bg-orange-50">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-orange-600 rotate-180" />
          <h3 className="font-display font-semibold text-orange-900">Produtos Parados — Ação Necessária</h3>
        </div>
        <div className="space-y-3">
          {SLOW_ITEMS.map(item => (
            <div key={item.name} className="flex items-center justify-between bg-white rounded-xl p-3">
              <div>
                <p className="font-medium text-mocha-900">{item.name}</p>
                <p className="text-xs text-mocha-400">{item.days_without_sale} dias sem venda</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-orange-600 text-right max-w-32">{item.suggestion}</p>
                <ArrowRight size={14} className="text-orange-400 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All products table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-100">
          <h3 className="font-display font-semibold text-mocha-900">Cardápio Completo</h3>
        </div>
        <table className="w-full">
          <thead className="bg-cream-50">
            <tr>
              <th className="table-th">Produto</th>
              <th className="table-th">Preço</th>
              <th className="table-th hidden md:table-cell">Margem</th>
              <th className="table-th hidden lg:table-cell">Tendência</th>
              <th className="table-th"></th>
            </tr>
          </thead>
          <tbody>
            {MENU_ITEMS.map(item => (
              <tr key={item.id} className="table-tr">
                <td className="table-td">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <div>
                      <p className="font-medium text-mocha-900">{item.name}</p>
                      <p className="text-xs text-mocha-400">{item.category}</p>
                    </div>
                    {item.popular && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Popular</span>}
                  </div>
                </td>
                <td className="table-td font-bold text-mocha-900">{formatCurrency(item.price)}</td>
                <td className="table-td hidden md:table-cell">
                  <span className={`font-semibold ${item.margin >= 50 ? 'text-green-600' : item.margin >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                    {item.margin}%
                  </span>
                </td>
                <td className="table-td hidden lg:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.trend === 'up' ? 'bg-green-100 text-green-700' : item.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.trend === 'up' ? '📈 Subindo' : item.trend === 'down' ? '📉 Caindo' : '➡️ Estável'}
                  </span>
                </td>
                <td className="table-td">
                  <button onClick={() => addToCart(item)} className="btn-secondary text-xs px-3 py-1.5">+ Carrinho</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
