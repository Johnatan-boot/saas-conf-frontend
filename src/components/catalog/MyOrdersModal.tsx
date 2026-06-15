import React, { useState, useEffect } from 'react'
import { X, ClipboardList, Package, Loader2 } from 'lucide-react'
import { StoreTheme, MyOrder } from '../../types/theme'
import { customerAuthService } from '../../services/customerAuthService'

interface Props {
  store: StoreTheme
  slug: string
  token: string
  onClose(): void
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', in_production: 'Em Produção',
  ready: 'Pronto', delivered: 'Entregue', cancelled: 'Cancelado',
}

export default function MyOrdersModal({ store, slug, token, onClose }: Props) {
  const [orders, setOrders] = useState<MyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const p = store.primaryColor

  useEffect(() => {
    customerAuthService.getMyOrders(slug, token)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [slug, token])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-mocha-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-warm-lg flex flex-col animate-slide-up" style={{ maxHeight: '85vh' }}>

        <div className="px-5 pt-5 pb-4 flex items-center justify-between" style={{ backgroundColor: p }}>
          <h2 className="font-display font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> Meus Pedidos
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/15 transition"><X size={18} className="text-white" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: p }} /></div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-mocha-400 gap-3">
              <Package className="w-12 h-12 opacity-30" />
              <p>Você ainda não fez nenhum pedido</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="rounded-2xl border border-cream-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-mocha-700">{order.code}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: p + '15', color: p }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className="space-y-1 mb-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-mocha-600">
                      <span>{item.quantity}x {item.productName}</span>
                      <span>{item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-cream-100">
                  <span className="text-xs text-mocha-400">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span className="font-bold text-sm" style={{ color: p }}>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
