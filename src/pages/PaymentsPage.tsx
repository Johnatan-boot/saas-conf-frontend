import React, { useEffect, useState, useCallback } from 'react'
import { CreditCard, Plus, Zap, CheckCircle, AlertCircle, Wallet, QrCode, Globe, Loader2, ShieldCheck } from 'lucide-react'
import api from '../services/api'
import { Payment } from '../types'
import { formatCurrency, formatDateTime, PAYMENT_METHOD_LABELS } from '../utils'
import { LoadingPage, Modal, Button, Input, Select, EmptyState, Badge, Table } from '../components/ui'
import { paymentGatewayService } from '../services/paymentGatewayService'
import toast from 'react-hot-toast'

// --- Status de redirecionamento dos gateways externos ---
function GatewayStatusBanner() {
  const [status, setStatus] = useState<'success' | 'cancel' | null>(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') { setStatus('success'); toast.success('Pagamento aprovado pelo gateway! ✅') }
    else if (params.get('cancel') === 'true') { setStatus('cancel'); toast.error('Pagamento cancelado.') }
    if (params.has('success') || params.has('cancel')) window.history.replaceState({}, '', window.location.pathname)
  }, [])
  if (!status) return null
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border animate-slide-up ${status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      {status === 'success' ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 flex-shrink-0" />}
      <div>
        <p className="font-semibold">{status === 'success' ? 'Pagamento Aprovado!' : 'Pagamento Cancelado'}</p>
        <p className="text-sm opacity-80">{status === 'success' ? 'Transação processada com sucesso via gateway.' : 'O pagamento não foi completado. Tente novamente.'}</p>
      </div>
      <button onClick={() => setStatus(null)} className="ml-auto p-1 hover:opacity-60 transition">✕</button>
    </div>
  )
}

// --- Gateways disponíveis (estilo único, no tom da marca) ---
const GATEWAYS = [
  { id: 'pagarme' as const, label: 'Pagar.me', desc: 'Cartão ou Pix', icon: Wallet },
  { id: 'mercadopago' as const, label: 'Mercado Pago', desc: 'Pix, cartão, boleto', icon: QrCode },
  { id: 'stripe' as const, label: 'Stripe', desc: 'Cartão internacional', icon: Globe },
]

// --- Modal de checkout via gateways externos (OmniPay) — estilo SweetFlow ---
function GatewayCheckoutModal({ open, onClose, amount, orderCode }: { open: boolean; onClose(): void; amount: number; orderCode: string }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState('')
  const [doc, setDoc] = useState(''); const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  if (!open) return null

  async function handleGateway(gw: 'stripe' | 'mercadopago' | 'pagarme') {
    setLoading(gw)
    const opts = { name: `Pedido ${orderCode}`, amount, quantity: 1, customerName: name, customerEmail: email, customerDocument: doc.replace(/\D/g, ''), customerPhone: phone.replace(/\D/g, '') }
    if (gw === 'stripe') await paymentGatewayService.checkoutWithStripe(opts)
    if (gw === 'mercadopago') await paymentGatewayService.checkoutWithMercadoPago(opts)
    if (gw === 'pagarme') await paymentGatewayService.checkoutWithPagarme(opts)
    setLoading(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-mocha-900/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative bg-white rounded-2xl shadow-warm-lg w-full max-w-md animate-slide-up overflow-hidden">

        {/* Header com total em destaque */}
        <div className="px-6 pt-6 pb-5 bg-chocolate-900">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-cream-100/80 text-xs font-semibold uppercase tracking-wider">
              <Zap size={12} /> Checkout Online
            </span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition text-cream-100/70 hover:text-cream-50">✕</button>
          </div>
          <p className="text-cream-100/70 text-xs mb-1">Pedido <span className="font-mono text-cream-50">{orderCode}</span></p>
          <p className="font-display text-3xl font-bold text-cream-50">{formatCurrency(amount)}</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Dados do comprador */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-mocha-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={12} /> Dados do comprador
            </p>
            <input type="text" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} className="input text-sm" />
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="input text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="CPF (só números)" value={doc} onChange={e => setDoc(e.target.value)} className="input text-sm" />
              <input type="tel" placeholder="Celular (DDD)" value={phone} onChange={e => setPhone(e.target.value)} className="input text-sm" />
            </div>
            <p className="text-[11px] text-mocha-400">Necessário para Mercado Pago e Pagar.me.</p>
          </div>

          {/* Seleção de gateway — cards no tom da marca */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-mocha-700 uppercase tracking-wider">Forma de pagamento</p>
            <div className="grid grid-cols-3 gap-2.5">
              {GATEWAYS.map(gw => {
                const Icon = gw.icon
                const isLoading = loading === gw.id
                return (
                  <button
                    key={gw.id}
                    onClick={() => handleGateway(gw.id)}
                    disabled={loading !== null}
                    className="group flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border border-cream-200 bg-cream-50/50 hover:border-chocolate-300 hover:bg-cream-50 hover:shadow-warm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-chocolate-50 text-chocolate-600 group-hover:bg-chocolate-100 transition">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="text-center leading-tight">
                      <p className="font-display font-semibold text-xs text-mocha-900">{gw.label}</p>
                      <p className="text-[10px] text-mocha-400 mt-0.5">{gw.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-mocha-400 pt-1">
            <ShieldCheck size={12} className="text-sage-500" />
            Transação segura — você será redirecionado para o gateway escolhido
          </p>
        </div>
      </div>
    </div>
  )
}

// --- Página principal de Pagamentos ---
export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [gatewayModal, setGatewayModal] = useState<{ open: boolean; amount: number; code: string }>({ open: false, amount: 0, code: '' })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ order_id: '', amount: '', method: 'pix', notes: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pmtRes, ordRes] = await Promise.all([api.get('/payments'), api.get('/orders?status=pending')])
      setPayments(pmtRes.data.data); setOrders(ordRes.data.data)
    } catch { toast.error('Erro ao carregar') } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/payments', { order_id: Number(form.order_id), amount: Number(form.amount), method: form.method, notes: form.notes || undefined })
      toast.success('Pagamento registrado! ✅'); setModalOpen(false); load()
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Erro ao registrar') } finally { setSaving(false) }
  }

  function openGateway(orderId: string) {
    const o = orders.find(o => o.id === Number(orderId))
    if (!o) return
    setGatewayModal({ open: true, amount: Number(o.total), code: o.code })
  }

  const totalReceived = payments.filter(p => p.status === 'paid').reduce((a, p) => a + Number(p.amount), 0)

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-5">
      <GatewayStatusBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-mocha-900">Pagamentos</h2>
          <p className="text-mocha-500 text-sm">Total recebido: <span className="font-bold text-sage-700">{formatCurrency(totalReceived)}</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(true)} icon={<Plus size={16} />}>Registrar Manual</Button>
          <Button onClick={() => { if (orders.length > 0) openGateway(String(orders[0].id)); else toast.error('Nenhum pedido pendente') }} icon={<Zap size={16} />}>Checkout Online</Button>
        </div>
      </div>

      {/* Breakdown por método */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['pix', 'cash', 'credit_card', 'debit_card'].map(method => {
          const total = payments.filter(p => p.method === method && p.status === 'paid').reduce((a, p) => a + Number(p.amount), 0)
          return (
            <div key={method} className="card text-center">
              <p className="text-xs text-mocha-400 mb-1">{PAYMENT_METHOD_LABELS[method]}</p>
              <p className="font-display font-bold text-mocha-900">{formatCurrency(total)}</p>
            </div>
          )
        })}
      </div>

      {payments.length === 0
        ? <EmptyState title="Nenhum pagamento" description="Registre o primeiro pagamento" action={<Button onClick={() => setModalOpen(true)} icon={<Plus size={16} />}>Registrar</Button>} />
        : (
          <Table headers={['Pedido', 'Cliente', 'Valor', 'Método', 'Data', 'Gateway']}>
            {payments.map(p => (
              <tr key={p.id} className="table-tr">
                <td className="table-td font-mono text-xs font-semibold text-chocolate-700">{p.order_code}</td>
                <td className="table-td">{p.client_name || '—'}</td>
                <td className="table-td font-semibold text-sage-700">{formatCurrency(Number(p.amount))}</td>
                <td className="table-td"><Badge variant="info">{PAYMENT_METHOD_LABELS[p.method]}</Badge></td>
                <td className="table-td text-xs text-mocha-400">{formatDateTime(p.created_at)}</td>
                <td className="table-td">
                  {p.status !== 'paid' && (
                    <button onClick={() => setGatewayModal({ open: true, amount: Number(p.amount), code: p.order_code || '' })}
                      className="text-xs text-chocolate-600 hover:underline flex items-center gap-1">
                      <Zap size={12} /> Pagar online
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}

      {/* Modal registro manual */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Pagamento Manual">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Pedido pendente *" value={form.order_id}
            onChange={e => { const o = orders.find(o => o.id === Number(e.target.value)); setForm(f => ({ ...f, order_id: e.target.value, amount: o ? String(o.total) : f.amount })) }}
            options={[{ value: '', label: 'Selecione...' }, ...orders.map(o => ({ value: o.id, label: `${o.code} — ${o.client_name || 'Avulso'} — ${formatCurrency(o.total)}` }))]} />
          <Input label="Valor (R$) *" type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
          <Select label="Método de pagamento" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
            options={Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Registrar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal gateway checkout */}
      <GatewayCheckoutModal open={gatewayModal.open} onClose={() => setGatewayModal(g => ({ ...g, open: false }))} amount={gatewayModal.amount} orderCode={gatewayModal.code} />
    </div>
  )
}
