import React, { useState, useEffect, useCallback } from 'react'
import {
  Plug, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  ExternalLink, ChevronRight, Eye, EyeOff, Clock, Package
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input, Badge, LoadingPage, Table, Modal } from '../../components/ui'
import { integrationsService } from '../../services/integrationsService'
import { formatDateTime, formatCurrency } from '../../utils'

// ─── Tipos locais ──────────────────────────────────────────
interface IFoodStatus {
  is_active: number
  merchant_id: string
  last_sync_at: string | null
  last_error: string | null
  has_credentials: number
}

interface MarketplaceOrder {
  id: number
  external_id: string
  status: string
  order_code: string
  order_total: number
  order_status: string
  created_at: string
}

// ─── Card de plataforma ────────────────────────────────────
function PlatformCard({
  logo, name, description, tag, children
}: { logo: string; name: string; description: string; tag?: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-cream-100 flex-shrink-0">{logo}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-mocha-900">{name}</h3>
              {tag && <span className="text-[10px] bg-chocolate-100 text-chocolate-700 px-2 py-0.5 rounded-full font-bold uppercase">{tag}</span>}
            </div>
            <p className="text-sm text-mocha-400">{description}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Seção iFood ────────────────────────────────────────────
function IFoodSection() {
  const [status, setStatus] = useState<IFoodStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [orders, setOrders] = useState<MarketplaceOrder[]>([])
  const [showConnect, setShowConnect] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [form, setForm] = useState({ clientId: '', clientSecret: '', merchantId: '' })

  const loadStatus = useCallback(async () => {
    try {
      const s = await integrationsService.getIFoodStatus()
      setStatus(s)
      if (s?.is_active) loadOrders()
    } catch { /* não conectado ainda */ }
    finally { setLoading(false) }
  }, [])

  async function loadOrders() {
    try { setOrders(await integrationsService.getIFoodOrders()) } catch {}
  }

  useEffect(() => { loadStatus() }, [loadStatus])

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault(); setConnecting(true)
    try {
      await integrationsService.connectIFood(form)
      toast.success('iFood conectado com sucesso! 🎉')
      setShowConnect(false)
      setForm({ clientId: '', clientSecret: '', merchantId: '' })
      loadStatus()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Credenciais inválidas')
    } finally { setConnecting(false) }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await integrationsService.syncIFood()
      toast.success(`Sincronizado! ${res.data.imported} novo(s) pedido(s) importado(s).`)
      loadOrders()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao sincronizar')
    } finally { setSyncing(false) }
  }

  async function handleDisconnect() {
    if (!confirm('Desconectar o iFood? Pedidos futuros não serão mais importados.')) return
    await integrationsService.disconnectIFood()
    toast.success('iFood desconectado.')
    setStatus(null); setOrders([])
  }

  async function handleConfirm(externalId: string) {
    try { await integrationsService.confirmIFoodOrder(externalId); toast.success('Pedido confirmado no iFood!'); loadOrders() }
    catch { toast.error('Erro ao confirmar') }
  }

  async function handleDispatch(externalId: string) {
    try { await integrationsService.dispatchIFoodOrder(externalId); toast.success('Pedido despachado!'); loadOrders() }
    catch { toast.error('Erro ao despachar') }
  }

  const isConnected = status?.is_active === 1

  if (loading) return <div className="card flex items-center gap-3 text-mocha-400"><RefreshCw className="animate-spin w-4 h-4" /> Verificando conexão...</div>

  return (
    <PlatformCard logo="🛵" name="iFood" description="Importe pedidos automaticamente do iFood para o seu sistema" tag="Marketplace">
      {/* Status */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isConnected ? 'bg-green-50 border-green-200' : 'bg-cream-50 border-cream-200'}`}>
        {isConnected
          ? <><CheckCircle2 className="w-5 h-5 text-green-600" /><div><p className="text-sm font-semibold text-green-800">Conectado</p>{status?.last_sync_at && <p className="text-xs text-green-600">Última sync: {formatDateTime(status.last_sync_at)}</p>}</div></>
          : <><XCircle className="w-5 h-5 text-mocha-400" /><p className="text-sm text-mocha-500">Não conectado</p></>}
        {status?.last_error && <p className="text-xs text-red-500 mt-1 truncate">{status.last_error}</p>}
      </div>

      {/* Ações */}
      {isConnected ? (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleSync} loading={syncing} icon={<RefreshCw size={15} />}>Sincronizar agora</Button>
            <Button variant="secondary" onClick={handleDisconnect}>Desconectar</Button>
          </div>

          {/* Pedidos do iFood */}
          {orders.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-mocha-700 mb-2 flex items-center gap-1"><Package size={15} /> Pedidos importados ({orders.length})</p>
              <div className="overflow-x-auto rounded-xl border border-cream-100">
                <table className="w-full text-sm">
                  <thead className="bg-cream-50 border-b border-cream-100">
                    <tr>
                      {['ID iFood', 'Código', 'Total', 'Status', 'Data', 'Ações'].map(h => (
                        <th key={h} className="table-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-cream-50">
                    {orders.map(o => (
                      <tr key={o.id} className="table-tr">
                        <td className="table-td font-mono text-xs text-chocolate-700">{o.external_id.slice(0, 12)}…</td>
                        <td className="table-td font-mono text-xs">{o.order_code || '—'}</td>
                        <td className="table-td font-semibold text-sage-700">{formatCurrency(o.order_total || 0)}</td>
                        <td className="table-td">
                          <Badge variant={o.status === 'confirmed' ? 'success' : o.status === 'dispatched' ? 'info' : 'warning'}>{o.status}</Badge>
                        </td>
                        <td className="table-td text-xs text-mocha-400">{formatDateTime(o.created_at)}</td>
                        <td className="table-td">
                          <div className="flex gap-1">
                            {o.status === 'placed' && (
                              <button onClick={() => handleConfirm(o.external_id)} className="text-xs text-chocolate-600 hover:underline">Confirmar</button>
                            )}
                            {o.status === 'confirmed' && (
                              <button onClick={() => handleDispatch(o.external_id)} className="text-xs text-blue-600 hover:underline">Despachar</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-mocha-400 text-sm">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Nenhum pedido importado ainda. Clique em "Sincronizar agora".
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {!showConnect ? (
            <div className="space-y-3">
              <div className="bg-cream-50 rounded-xl p-4 text-sm text-mocha-600 space-y-2">
                <p className="font-semibold text-mocha-800">Como conectar:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Acesse o Portal do iFood como restaurante parceiro</li>
                  <li>Vá em <strong>Configurações → Integrações</strong></li>
                  <li>Crie um novo app e copie o <strong>Client ID</strong> e <strong>Client Secret</strong></li>
                  <li>O <strong>Merchant ID</strong> é o ID da sua loja no iFood</li>
                </ol>
                <a href="https://developer.ifood.com.br" target="_blank" rel="noreferrer" className="text-chocolate-600 hover:underline text-xs flex items-center gap-1 mt-2">
                  <ExternalLink size={12} /> Portal do Desenvolvedor iFood
                </a>
              </div>
              <Button onClick={() => setShowConnect(true)} icon={<Plug size={15} />}>Conectar iFood</Button>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-3">
              <Input label="Client ID *" value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} placeholder="Seu Client ID do iFood" required />
              <div>
                <label className="label">Client Secret *</label>
                <div className="relative">
                  <input type={showSecret ? 'text' : 'password'} value={form.clientSecret}
                    onChange={e => setForm(f => ({ ...f, clientSecret: e.target.value }))}
                    placeholder="Seu Client Secret" required className="input pr-10" />
                  <button type="button" onClick={() => setShowSecret(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha-400">
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Input label="Merchant ID *" value={form.merchantId} onChange={e => setForm(f => ({ ...f, merchantId: e.target.value }))} placeholder="ID da sua loja no iFood" required />
              <div className="flex gap-2">
                <Button type="submit" loading={connecting} icon={<CheckCircle2 size={15} />}>Salvar e conectar</Button>
                <Button variant="secondary" type="button" onClick={() => setShowConnect(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </div>
      )}
    </PlatformCard>
  )
}

// ─── Seção Keeta (Coming Soon) ─────────────────────────────
function KeetaSection() {
  return (
    <PlatformCard logo="🏍️" name="Keeta" description="Delivery da Meituan — maior plataforma de delivery do mundo" tag="Em breve">
      <div className="bg-cream-50 border border-cream-200 rounded-xl p-5 text-center space-y-3">
        <div className="text-4xl">🚀</div>
        <p className="font-semibold text-mocha-800">Integração em desenvolvimento</p>
        <p className="text-sm text-mocha-500 max-w-sm mx-auto">
          O Keeta ainda não disponibilizou API pública no Brasil. Assim que liberarem o acesso para parceiros, a integração será ativada automaticamente aqui.
        </p>
        <div className="bg-white rounded-xl p-3 text-xs text-mocha-500 border border-cream-200 text-left space-y-1">
          <p className="font-semibold text-mocha-700">O que estará disponível:</p>
          <p>✅ Importação automática de pedidos</p>
          <p>✅ Sincronização de cardápio</p>
          <p>✅ Confirmação/despacho direto do sistema</p>
          <p>✅ Relatórios de vendas por plataforma</p>
        </div>
        <a href="https://keeta.com.br" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-chocolate-600 hover:underline">
          <ExternalLink size={12} /> Saiba mais sobre o Keeta
        </a>
      </div>
    </PlatformCard>
  )
}

// ─── Página principal ──────────────────────────────────────
export default function IntegrationsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-mocha-900 flex items-center gap-2">
          <Plug className="w-6 h-6 text-chocolate-600" /> Integrações
        </h2>
        <p className="text-mocha-500 text-sm mt-1">
          Conecte sua confeitaria aos principais apps de delivery e receba pedidos automaticamente.
        </p>
      </div>

      {/* Banner informativo sobre o modelo de credenciais */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Como funciona a integração</p>
          <p className="text-xs leading-relaxed">
            Cada confeitaria usa suas próprias credenciais do iFood. Você obtém as chaves diretamente no portal de parceiros do iFood, sem custo adicional. No futuro, quando você registrar sua empresa como integradora oficial, o sistema migrará automaticamente — sem alterar nada aqui.
          </p>
        </div>
      </div>

      <IFoodSection />
      <KeetaSection />
    </div>
  )
}
