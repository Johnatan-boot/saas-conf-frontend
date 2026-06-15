import React, { useState } from 'react'
import { X, ShoppingCart, Trash2, Plus, Minus, ChevronRight, CheckCircle, MessageCircle, CreditCard, Banknote, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoreTheme, CartItem, CustomerInfo } from '../../types/theme'
import { catalogService } from '../../services/catalogService'

type Step = 'cart' | 'info' | 'payment' | 'success'

interface Props {
  cart: { items: CartItem[]; total: number; totalItems: number; updateQuantity(id: number, q: number): void; removeFromCart(id: number): void; clearCart(): void }
  store: StoreTheme
  onClose(): void
  customerToken?: string | null
  customerProfile?: { name: string; email: string; phone: string; address: string } | null
}

export default function CheckoutModal({ cart, store, onClose, customerToken, customerProfile }: Props) {
  const [step, setStep] = useState<Step>('cart')
  const [customer, setCustomer] = useState<CustomerInfo>(() => ({
    name: customerProfile?.name || '',
    phone: customerProfile?.phone || '',
    address: customerProfile?.address || '',
    notes: '',
    email: customerProfile?.email || '',
    document: '',
  }))
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro' | 'stripe' | 'mercadopago' | 'pagarme'>('pix')
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState('')
  const p = store.primaryColor

  async function handleFinalize() {
    setSubmitting(true)
    try {
      // Gateways externos (Stripe / MP / Pagar.me): cria o pedido E a
      // sessão de pagamento numa chamada só, depois redireciona.
      // Antes, pra esses 3 métodos, o pedido NUNCA era criado.
      if (['stripe', 'mercadopago', 'pagarme'].includes(paymentMethod)) {
        const res = await catalogService.checkoutWithGateway(paymentMethod as 'stripe' | 'mercadopago' | 'pagarme', {
          storeSlug: store.slug, customer,
          items: cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })),
          total: cart.total, paymentMethod: paymentMethod as any,
        }, customerToken)
        window.location.href = res.url
        return
      }

      // Pagamento manual (PIX, dinheiro, cartão na entrega)
      const res = await catalogService.createOrder({
        storeSlug: store.slug, customer,
        items: cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })),
        total: cart.total, paymentMethod: paymentMethod as any,
      }, customerToken)
      setOrderId(res.orderId); cart.clearCart(); setStep('success')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao finalizar pedido')
    } finally {
      setSubmitting(false)
    }
  }

  function sendWhatsApp() {
    if (!store.whatsapp) return
    const lines = cart.items.map(i => `• ${i.quantity}x ${i.product.name} — ${(i.product.price * i.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`).join('\n')
    const msg = encodeURIComponent(`Olá! Gostaria de fazer um pedido:\n\n${lines}\n\n*Total: ${cart.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*\n\nNome: ${customer.name}\nTelefone: ${customer.phone}${customer.address ? '\nEndereço: ' + customer.address : ''}${customer.notes ? '\nObs: ' + customer.notes : ''}`)
    window.open(`https://wa.me/${store.whatsapp}?text=${msg}`, '_blank')
  }

  const steps: Step[] = ['cart', 'info', 'payment']
  const stepLabels = ['Carrinho', 'Dados', 'Pagamento']

  const gatewayOptions = [
    { value: 'pix', label: 'PIX', icon: <QrCode className="w-5 h-5" />, desc: 'Aprovação instantânea' },
    { value: 'cartao', label: 'Cartão (entrega)', icon: <CreditCard className="w-5 h-5" />, desc: 'Débito/crédito na entrega' },
    { value: 'dinheiro', label: 'Dinheiro', icon: <Banknote className="w-5 h-5" />, desc: 'Pagamento presencial' },
    { value: 'stripe', label: 'Stripe (online)', icon: <CreditCard className="w-5 h-5" />, desc: 'Cartão de crédito/débito online' },
    { value: 'mercadopago', label: 'Mercado Pago', icon: <QrCode className="w-5 h-5" />, desc: 'PIX, cartão, boleto' },
    { value: 'pagarme', label: 'Pagar.me', icon: <CreditCard className="w-5 h-5" />, desc: 'Cartão ou PIX via Pagar.me' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-mocha-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-warm-lg flex flex-col animate-slide-up" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-100">
          <h2 className="font-display font-bold text-mocha-900 flex items-center gap-2">
            {step === 'cart' && <><ShoppingCart className="w-5 h-5" style={{ color: p }} />Carrinho</>}
            {step === 'info' && <>👤 Seus dados</>}
            {step === 'payment' && <><CreditCard className="w-5 h-5" style={{ color: p }} />Pagamento</>}
            {step === 'success' && <><CheckCircle className="w-5 h-5 text-green-500" />Confirmado!</>}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-cream-100 transition"><X size={18} className="text-mocha-500" /></button>
        </div>

        {/* Stepper */}
        {step !== 'success' && (
          <div className="flex items-center px-5 pt-3 gap-2">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={s === step ? { backgroundColor: p, color: '#fff' } : steps.indexOf(s) < steps.indexOf(step) ? { backgroundColor: p + '33', color: p } : { backgroundColor: '#e5e7eb', color: '#9ca3af' }}>
                    {i + 1}
                  </div>
                  <span className="text-xs hidden sm:inline" style={{ color: s === step ? p : '#9ca3af' }}>{stepLabels[i]}</span>
                </div>
                {i < 2 && <div className="flex-1 h-0.5 bg-cream-200 rounded" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* CART */}
          {step === 'cart' && (
            cart.items.length === 0
              ? <div className="flex flex-col items-center justify-center py-12 text-mocha-400 gap-3"><ShoppingCart className="w-12 h-12 opacity-30" /><p>Carrinho vazio</p></div>
              : cart.items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 pb-3 border-b border-cream-100">
                  {item.product.imageUrl
                    ? <img src={item.product.imageUrl} alt={item.product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-cream-100">🎂</div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-mocha-900 truncate">{item.product.name}</p>
                    <p className="text-sm font-bold" style={{ color: p }}>{(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-xl flex items-center justify-center border transition hover:opacity-70" style={{ borderColor: p, color: p }}><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center text-sm font-bold text-mocha-900">{item.quantity}</span>
                    <button onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-xl flex items-center justify-center text-white transition" style={{ backgroundColor: p }}><Plus className="w-3 h-3" /></button>
                    <button onClick={() => cart.removeFromCart(item.product.id)} className="ml-1 w-7 h-7 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 transition"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))
          )}

          {/* INFO */}
          {step === 'info' && (
            <div className="space-y-4">
              <div><label className="label">Nome completo *</label><input type="text" value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))} placeholder="Seu nome" className="input" /></div>
              <div><label className="label">WhatsApp / Telefone *</label><input type="tel" value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className="input" /></div>
              <div><label className="label">E-mail</label><input type="email" value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))} placeholder="seu@email.com" className="input" /></div>
              <div><label className="label">CPF (para pagamento online)</label><input type="text" value={customer.document} onChange={e => setCustomer(p => ({ ...p, document: e.target.value.replace(/\D/g, '') }))} placeholder="000.000.000-00" className="input" /></div>
              <div><label className="label">Endereço (opcional)</label><input type="text" value={customer.address} onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))} placeholder="Rua, número, bairro" className="input" /></div>
              <div><label className="label">Observações (opcional)</label><textarea value={customer.notes} onChange={e => setCustomer(p => ({ ...p, notes: e.target.value }))} placeholder="Alguma informação especial?" rows={2} className="input resize-none" /></div>
            </div>
          )}

          {/* PAYMENT */}
          {step === 'payment' && (
            <div className="space-y-3">
              <p className="text-sm text-mocha-500">Escolha como deseja pagar:</p>
              {gatewayOptions.map(opt => (
                <button key={opt.value} onClick={() => setPaymentMethod(opt.value as any)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-left"
                  style={{ borderColor: paymentMethod === opt.value ? p : '#f0e8dd', backgroundColor: paymentMethod === opt.value ? p + '11' : '#fff' }}>
                  <span style={{ color: p }}>{opt.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-mocha-900">{opt.label}</p>
                    <p className="text-xs text-mocha-400">{opt.desc}</p>
                  </div>
                  {paymentMethod === opt.value && <CheckCircle className="w-4 h-4 ml-auto" style={{ color: p }} />}
                </button>
              ))}
              <div className="rounded-xl p-4 mt-2" style={{ backgroundColor: p + '11' }}>
                <p className="text-sm font-semibold text-mocha-900 mb-2">Resumo do pedido</p>
                {cart.items.map(i => (
                  <div key={i.product.id} className="flex justify-between text-xs text-mocha-600 mb-1">
                    <span>{i.quantity}x {i.product.name}</span>
                    <span>{(i.product.price * i.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-cream-200 text-mocha-900">
                  <span>Total</span><span style={{ color: p }}>{cart.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
              <h3 className="font-display text-xl font-bold text-mocha-900 mb-1">Pedido confirmado!</h3>
              {orderId && <p className="text-xs text-mocha-400 mb-3">Pedido {orderId}</p>}
              <p className="text-sm text-mocha-500 max-w-xs mx-auto mb-6">Recebemos seu pedido! A confeitaria entrará em contato em breve.</p>
              {store.whatsapp && (
                <button onClick={sendWhatsApp} className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90" style={{ backgroundColor: '#25D366' }}>
                  <MessageCircle className="w-4 h-4" /> Confirmar pelo WhatsApp
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-cream-100 bg-cream-50 rounded-b-2xl">
          {step === 'cart' && cart.items.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-mocha-500">Total</span>
                <span className="font-display text-2xl font-bold" style={{ color: p }}>{cart.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <button onClick={() => setStep('info')} className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition active:scale-95" style={{ backgroundColor: p }}>
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {step === 'info' && (
            <button onClick={() => setStep('payment')} disabled={!customer.name || !customer.phone}
              className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-95" style={{ backgroundColor: p }}>
              Ir para pagamento <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === 'payment' && (
            <button onClick={handleFinalize} disabled={submitting}
              className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 active:scale-95" style={{ backgroundColor: p }}>
              {submitting ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><CheckCircle className="w-4 h-4" />Confirmar pedido</>}
            </button>
          )}
          {step === 'success' && (
            <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold text-sm transition btn-secondary">Fechar</button>
          )}
        </div>
      </div>
    </div>
  )
}
