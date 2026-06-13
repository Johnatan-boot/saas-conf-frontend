import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart, Search, Instagram, Youtube, Phone, Facebook, Package } from 'lucide-react'
import { StoreTheme, PublicProduct } from '../../types/theme'
import { catalogService } from '../../services/catalogService'
import { useCart } from '../../hooks/useCart'
import CheckoutModal from '../../components/catalog/CheckoutModal'

export default function CatalogPage() {
  const { slug } = useParams<{ slug: string }>()
  const [store, setStore] = useState<StoreTheme | null>(null)
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [showCart, setShowCart] = useState(false)
  const cart = useCart()

  useEffect(() => {
    if (!slug) return
    Promise.all([catalogService.getStoreInfo(slug), catalogService.getProducts(slug)])
      .then(([s, p]) => { setStore(s); setProducts(p) })
      .catch(() => setError('Catálogo não encontrado'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!store) return
    const root = document.documentElement
    root.style.setProperty('--cat-primary', store.primaryColor)
    root.style.setProperty('--cat-secondary', store.secondaryColor)
    root.style.setProperty('--cat-bg', store.backgroundColor)
    root.style.setProperty('--cat-text', store.textColor)
    root.style.setProperty('--cat-card', store.cardColor)
    document.title = store.storeName || 'Catálogo'
    return () => ['--cat-primary', '--cat-secondary', '--cat-bg', '--cat-text', '--cat-card'].forEach(v => root.style.removeProperty(v))
  }, [store])

  const categories = useMemo(() => ['Todos', ...new Set(products.map(p => p.category).filter(Boolean) as string[])], [products])
  const filtered = useMemo(() => products.filter(p => {
    const matchS = p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
    const matchC = activeCategory === 'Todos' || p.category === activeCategory
    return matchS && matchC
  }), [products, search, activeCategory])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#fff7f9' }}>
      <div className="text-5xl animate-bounce-subtle">🎂</div>
      <p className="text-gray-500 text-sm">Carregando cardápio...</p>
    </div>
  )

  if (error || !store) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <Package className="w-16 h-16 text-gray-300" />
      <h1 className="text-xl font-semibold text-gray-600">Catálogo não encontrado</h1>
      <p className="text-gray-400 text-sm">Verifique o link e tente novamente.</p>
    </div>
  )

  const s = store

  return (
    <div className="min-h-screen" style={{ backgroundColor: s.backgroundColor, color: s.textColor }}>
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 shadow-md" style={{ backgroundColor: s.primaryColor }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {s.logoUrl
              ? <img src={s.logoUrl} alt={s.storeName} className="h-10 w-10 rounded-xl object-cover" />
              : <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-xl text-white">🎂</div>}
            <div>
              <h1 className="font-bold text-white text-base leading-tight">{s.storeName}</h1>
              {s.tagline && <p className="text-white/70 text-xs">{s.tagline}</p>}
            </div>
          </div>
          <button onClick={() => setShowCart(true)} className="relative flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Carrinho</span>
            {cart.totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cart.totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* HERO */}
      <div className="py-10 px-4 text-center" style={{ background: `linear-gradient(135deg, ${s.primaryColor}22 0%, ${s.secondaryColor}33 100%)` }}>
        <h2 className="text-3xl font-bold mb-2" style={{ color: s.textColor }}>✨ Nosso Cardápio</h2>
        <p className="text-sm opacity-70 max-w-md mx-auto">{s.tagline || 'Produtos fresquinhos, feitos com amor!'}</p>
        <div className="mt-6 max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" style={{ color: s.textColor }} />
          <input type="text" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 shadow-sm"
            style={{ backgroundColor: s.cardColor, borderColor: s.primaryColor + '44', color: s.textColor }} />
        </div>
      </div>

      {/* CATEGORIAS */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition"
              style={activeCategory === cat
                ? { backgroundColor: s.primaryColor, color: '#fff', borderColor: s.primaryColor }
                : { backgroundColor: 'transparent', color: s.textColor, borderColor: s.primaryColor + '55' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        {filtered.length === 0
          ? <div className="text-center py-16 opacity-40"><Package className="w-12 h-12 mx-auto mb-3" /><p>Nenhum produto encontrado</p></div>
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(product => (
                <div key={product.id} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: s.cardColor }}>
                  {product.imageUrl
                    ? <div className="aspect-square overflow-hidden bg-gray-100"><img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" /></div>
                    : <div className="aspect-square flex items-center justify-center text-5xl" style={{ backgroundColor: s.primaryColor + '15' }}>🎂</div>}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate" style={{ color: s.textColor }}>{product.name}</h3>
                    {product.description && <p className="text-xs mt-0.5 opacity-60 line-clamp-2" style={{ color: s.textColor }}>{product.description}</p>}
                    {product.category && (
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1.5 font-medium" style={{ backgroundColor: s.secondaryColor + '33', color: s.primaryColor }}>{product.category}</span>
                    )}
                    <p className="text-base font-bold mt-2" style={{ color: s.primaryColor }}>{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <button onClick={() => cart.addToCart(product)} className="mt-2 w-full py-1.5 rounded-xl text-white text-xs font-semibold transition hover:opacity-90 active:scale-95" style={{ backgroundColor: s.primaryColor }}>
                      Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </main>

      {/* FOOTER */}
      <footer className="py-8 px-4" style={{ backgroundColor: s.primaryColor + '18', borderTop: `1px solid ${s.primaryColor}33` }}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <p className="font-bold" style={{ color: s.textColor }}>{s.storeName}</p>
          <div className="flex gap-3">
            {s.instagram && <a href={s.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-xl transition hover:scale-110" style={{ backgroundColor: s.primaryColor + '22' }}><Instagram className="w-5 h-5" style={{ color: s.primaryColor }} /></a>}
            {s.facebook && <a href={s.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-xl transition hover:scale-110" style={{ backgroundColor: s.primaryColor + '22' }}><Facebook className="w-5 h-5" style={{ color: s.primaryColor }} /></a>}
            {s.whatsapp && <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl transition hover:scale-110" style={{ backgroundColor: s.primaryColor + '22' }}><Phone className="w-5 h-5" style={{ color: s.primaryColor }} /></a>}
            {s.youtube && <a href={s.youtube} target="_blank" rel="noreferrer" className="p-2 rounded-xl transition hover:scale-110" style={{ backgroundColor: s.primaryColor + '22' }}><Youtube className="w-5 h-5" style={{ color: s.primaryColor }} /></a>}
          </div>
          <p className="text-xs opacity-30">Powered by Confeitaria SaaS</p>
        </div>
      </footer>

      {showCart && <CheckoutModal cart={cart} store={s} onClose={() => setShowCart(false)} />}
    </div>
  )
}
