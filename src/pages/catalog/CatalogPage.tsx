import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ShoppingCart, Search, Instagram, Youtube, Phone, Facebook, Package, MapPin, Plus, Heart, User, LogOut, ClipboardList, Settings, ChevronDown } from 'lucide-react'
import { StoreTheme, PublicProduct } from '../../types/theme'
import { catalogService } from '../../services/catalogService'
import { useCart } from '../../hooks/useCart'
import { useCustomerAuth } from '../../hooks/useCustomerAuth'
import CheckoutModal from '../../components/catalog/CheckoutModal'
import CustomerAuthModal from '../../components/catalog/CustomerAuthModal'
import MyOrdersModal from '../../components/catalog/MyOrdersModal'
import ProfileModal from '../../components/catalog/ProfileModal'

export default function CatalogPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [store, setStore] = useState<StoreTheme | null>(null)
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [showCart, setShowCart] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const cart = useCart()
  const customerAuth = useCustomerAuth(slug)

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

    // Scroll suave para os links de navegação (Início/Cardápio/Sobre/Contato)
    const prevScrollBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'smooth'

    return () => {
      ;['--cat-primary', '--cat-secondary', '--cat-bg', '--cat-text', '--cat-card'].forEach(v => root.style.removeProperty(v))
      root.style.scrollBehavior = prevScrollBehavior
    }
  }, [store])

  // Retorno do gateway de pagamento (Stripe/MercadoPago/Pagar.me).
  // O PEDIDO já foi criado ANTES do redirect (ver checkoutWithGateway) —
  // aqui só avisamos o cliente e limpamos a URL. Confirmação real do
  // pagamento ainda é manual pelo lojista (sem webhook configurado).
  useEffect(() => {
    const payment = searchParams.get('payment')
    const order = searchParams.get('order')
    if (!payment) return

    if (payment === 'success') {
      toast.success(order ? `Pedido ${order} recebido! Em breve a loja entra em contato.` : 'Pedido recebido!', { duration: 6000 })
    } else if (payment === 'cancel') {
      toast(order ? `Pagamento do pedido ${order} não foi concluído. Seu pedido continua registrado.` : 'Pagamento não concluído.', { duration: 6000 })
    }

    const next = new URLSearchParams(searchParams)
    next.delete('payment'); next.delete('order')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // Quando há banner, o hero usa overlay escuro/colorido + texto branco
  // para garantir contraste sobre a foto. Sem banner ainda (aguardando
  // imagem real da loja), fundo branco sólido — limpo e neutro.
  const hasBanner = !!s.bannerUrl
  const heroTextColor = hasBanner ? '#ffffff' : s.textColor
  const heroBackground = hasBanner
    ? `linear-gradient(135deg, ${s.primaryColor}dd 0%, ${s.primaryColor}99 45%, ${s.secondaryColor}77 100%), url(${s.bannerUrl})`
    : '#ffffff'

  const hasContactInfo = !!(s.address || s.whatsapp || s.instagram || s.facebook || s.youtube)

  return (
    <div className="min-h-screen" style={{ backgroundColor: s.backgroundColor, color: s.textColor }}>
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 shadow-md" style={{ backgroundColor: s.primaryColor }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {s.logoUrl
              ? <img src={s.logoUrl} alt={s.storeName} className="h-11 w-11 rounded-2xl object-cover ring-2 ring-white/20 flex-shrink-0" />
              : <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center text-xl text-white flex-shrink-0">🎂</div>}
            <div className="min-w-0">
              <h1 className="font-display font-bold text-white text-base sm:text-lg leading-tight truncate">{s.storeName}</h1>
              {s.tagline && <p className="text-white/65 text-xs truncate hidden sm:block">{s.tagline}</p>}
            </div>
          </div>

          {/* Links de navegação */}
          <nav className="hidden md:flex items-center gap-1">
            <a href="#home" className="text-white/80 hover:text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 transition">Início</a>
            <a href="#cardapio" className="text-white/80 hover:text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 transition">Cardápio</a>
            {s.aboutText && <a href="#sobre" className="text-white/80 hover:text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 transition">Sobre</a>}
            <a href="#contato" className="text-white/80 hover:text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 transition">Contato</a>
          </nav>

          {/* Conta do cliente */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => customerAuth.isAuthenticated ? setShowAccountMenu(v => !v) : setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-full text-sm font-medium transition"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline max-w-[80px] truncate">
                {customerAuth.isAuthenticated ? customerAuth.profile?.name.split(' ')[0] : 'Entrar'}
              </span>
              {customerAuth.isAuthenticated && <ChevronDown className="w-3 h-3 hidden sm:inline" />}
            </button>

            {showAccountMenu && customerAuth.isAuthenticated && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-warm-lg overflow-hidden z-50 animate-fade-in">
                  <button onClick={() => { setShowOrdersModal(true); setShowAccountMenu(false) }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-mocha-700 hover:bg-cream-50 transition text-left">
                    <ClipboardList className="w-4 h-4" /> Meus Pedidos
                  </button>
                  <button onClick={() => { setShowProfileModal(true); setShowAccountMenu(false) }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-mocha-700 hover:bg-cream-50 transition text-left border-t border-cream-100">
                    <Settings className="w-4 h-4" /> Meu Perfil
                  </button>
                  <button onClick={() => { customerAuth.logout(); setShowAccountMenu(false) }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition text-left border-t border-cream-100">
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>
              </>
            )}
          </div>

          <button onClick={() => setShowCart(true)} className="relative flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-full text-sm font-medium transition flex-shrink-0">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Carrinho</span>
            {cart.totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cart.totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* HERO */}
      <div
        id="home"
        className="relative overflow-hidden scroll-mt-16 flex items-center justify-center min-h-[340px] sm:min-h-[440px] py-14 px-4 text-center bg-cover bg-center"
        style={{ background: heroBackground, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-5xl font-bold mb-3" style={{ color: heroTextColor }}>
            ✨ Nosso Cardápio
          </h2>
          <p className="text-sm sm:text-base mb-7" style={{ color: hasBanner ? 'rgba(255,255,255,0.85)' : undefined, opacity: hasBanner ? 1 : 0.7 }}>
            {s.tagline || 'Produtos fresquinhos, feitos com amor!'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" style={{ color: s.textColor }} />
              <input type="text" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-full border text-sm focus:outline-none focus:ring-2 shadow-sm bg-white/95"
                style={{ borderColor: s.primaryColor + '33', color: s.textColor }} />
            </div>
            <a href="#cardapio"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white font-semibold text-sm shadow-lg hover:scale-105 transition whitespace-nowrap"
              style={{ color: s.primaryColor }}>
              Ver Cardápio
            </a>
          </div>
        </div>
      </div>

      {/* CARDÁPIO: categorias + grid */}
      <div id="cardapio" className="scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition"
                style={activeCategory === cat
                  ? { backgroundColor: s.primaryColor, color: '#fff', borderColor: s.primaryColor, boxShadow: `0 4px 12px ${s.primaryColor}44` }
                  : { backgroundColor: 'transparent', color: s.textColor, borderColor: s.primaryColor + '55' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 pb-16">
          {filtered.length === 0
            ? <div className="text-center py-16 opacity-40"><Package className="w-12 h-12 mx-auto mb-3" /><p>Nenhum produto encontrado</p></div>
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {filtered.map(product => (
                  <div key={product.id} className="group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: s.cardColor }}>
                    {product.imageUrl
                      ? <div className="aspect-square overflow-hidden bg-gray-100"><img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                      : <div className="aspect-square flex items-center justify-center text-5xl" style={{ backgroundColor: s.primaryColor + '15' }}>🎂</div>}
                    <div className="p-3.5">
                      <h3 className="font-semibold text-sm truncate" style={{ color: s.textColor }}>{product.name}</h3>
                      {product.description && <p className="text-xs mt-0.5 opacity-60 line-clamp-2" style={{ color: s.textColor }}>{product.description}</p>}
                      {product.category && (
                        <span className="inline-block text-xs px-2.5 py-0.5 rounded-full mt-1.5 font-medium" style={{ backgroundColor: s.secondaryColor + '33', color: s.primaryColor }}>{product.category}</span>
                      )}
                      <div className="flex items-center justify-between mt-2.5">
                        <p className="text-base font-bold" style={{ color: s.primaryColor }}>{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <button onClick={() => cart.addToCart(product)}
                          className="w-8 h-8 rounded-full text-white flex items-center justify-center transition hover:opacity-90 active:scale-90 shadow-sm"
                          style={{ backgroundColor: s.primaryColor }}
                          aria-label="Adicionar ao carrinho">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </main>
      </div>

      {/* SOBRE */}
      {s.aboutText && (
        <section id="sobre" className="scroll-mt-16 px-4 pb-14">
          <div className="max-w-3xl mx-auto rounded-3xl p-8 sm:p-10 text-center" style={{ backgroundColor: s.cardColor, boxShadow: `0 8px 30px ${s.primaryColor}1a` }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ backgroundColor: s.primaryColor + '15' }}>
              <Heart className="w-5 h-5" style={{ color: s.primaryColor }} />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3" style={{ color: s.textColor }}>
              Sobre {s.storeName}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed opacity-75 whitespace-pre-line" style={{ color: s.textColor }}>
              {s.aboutText}
            </p>
          </div>
        </section>
      )}

      {/* CONTATO */}
      <section id="contato" className="scroll-mt-16 px-4 pb-14">
        <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-10 text-center" style={{ background: `linear-gradient(135deg, ${s.primaryColor} 0%, ${s.secondaryColor} 100%)` }}>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">Contato</h2>
          <p className="text-white/75 text-sm mb-7">Fale com a gente, vamos adorar atender você!</p>

          {hasContactInfo ? (
            <div className="flex flex-col items-center gap-5">
              {s.address && (
                <p className="flex items-center gap-2 text-white/90 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0" /> {s.address}
                </p>
              )}
              {s.whatsapp && (
                <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white font-semibold text-sm shadow-lg hover:scale-105 transition"
                  style={{ color: s.primaryColor }}>
                  <Phone className="w-4 h-4" /> Conversar no WhatsApp
                </a>
              )}
              {(s.instagram || s.facebook || s.youtube) && (
                <div className="flex gap-3">
                  {s.instagram && <a href={s.instagram} target="_blank" rel="noreferrer" className="p-3 rounded-2xl bg-white/15 hover:bg-white/25 hover:scale-110 transition"><Instagram className="w-5 h-5 text-white" /></a>}
                  {s.facebook && <a href={s.facebook} target="_blank" rel="noreferrer" className="p-3 rounded-2xl bg-white/15 hover:bg-white/25 hover:scale-110 transition"><Facebook className="w-5 h-5 text-white" /></a>}
                  {s.youtube && <a href={s.youtube} target="_blank" rel="noreferrer" className="p-3 rounded-2xl bg-white/15 hover:bg-white/25 hover:scale-110 transition"><Youtube className="w-5 h-5 text-white" /></a>}
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/70 text-sm">Em breve, mais informações de contato.</p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 px-4 text-center" style={{ borderTop: `1px solid ${s.primaryColor}22` }}>
        <p className="font-display font-bold text-sm" style={{ color: s.textColor }}>{s.storeName}</p>
        <p className="text-xs opacity-30 mt-1">Powered by Confeitaria SaaS</p>
      </footer>

      {showCart && (
        <CheckoutModal
          cart={cart} store={s} onClose={() => setShowCart(false)}
          customerToken={customerAuth.token}
          customerProfile={customerAuth.profile}
        />
      )}

      {showAuthModal && (
        <CustomerAuthModal
          store={s}
          onClose={() => setShowAuthModal(false)}
          onLogin={customerAuth.login}
          onRegister={customerAuth.register}
        />
      )}

      {showOrdersModal && customerAuth.token && slug && (
        <MyOrdersModal store={s} slug={slug} token={customerAuth.token} onClose={() => setShowOrdersModal(false)} />
      )}

      {showProfileModal && customerAuth.profile && (
        <ProfileModal
          store={s}
          profile={customerAuth.profile}
          onClose={() => setShowProfileModal(false)}
          onSave={customerAuth.updateProfile}
          onLogout={() => { customerAuth.logout(); setShowProfileModal(false) }}
        />
      )}
    </div>
  )
}
