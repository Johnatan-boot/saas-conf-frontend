import React, { useState, useEffect, useCallback } from 'react'
import {
  Crown, Users, TrendingUp, Shield, Search, MoreVertical,
  CheckCircle, XCircle, Clock, Star, Zap, Package, Sparkles,
  Building, Mail, Calendar, RefreshCw, Edit2, Ban,
  DollarSign, BarChart3, AlertTriangle, Loader2, Key, Activity
} from 'lucide-react'
import { formatCurrency, formatDate } from '../utils'
import toast from 'react-hot-toast'
import api from '../services/api'

// ── Constantes de planos ─────────────────────────────────────────────────
const PLANS = [
  {
    id: 'economico', name: 'Econômico', price: 49.90, icon: '🌱',
    color: 'from-slate-400 to-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    border: 'border-slate-200',
    limits: { orders: 50, users: 1, products: 30 },
    features: [
      '✅ Até 50 pedidos/mês',
      '✅ 1 usuário (admin)',
      '✅ Gestão de produtos (até 30)',
      '✅ Gestão de clientes (até 100)',
      '✅ Catálogo público básico',
      '✅ Checkout PIX/Dinheiro',
      '✅ Dashboard com KPIs',
      '✅ Design personalizado (básico)',
      '❌ Gateways online (Stripe/MP/Pagar.me)',
      '❌ Conta do cliente final',
      '❌ Precificação inteligente',
      '❌ Relatórios avançados',
      '❌ Telegram/Zapier',
      '❌ Auditoria de ações',
    ],
  },
  {
    id: 'standard', name: 'Standard', price: 99.90, icon: '🎂',
    color: 'from-amber-500 to-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-300',
    popular: true,
    limits: { orders: 300, users: 5, products: 200 },
    features: [
      '✅ Até 300 pedidos/mês',
      '✅ Até 5 usuários',
      '✅ Produtos ilimitados (até 200)',
      '✅ Clientes ilimitados (até 500)',
      '✅ Catálogo público + checkout',
      '✅ Gateways online (Stripe/MP/Pagar.me)',
      '✅ Conta do cliente final + Meus Pedidos',
      '✅ Precificação inteligente (custo/margem)',
      '✅ Dashboard completo + gráficos',
      '✅ Design completo (banner, cores, sobre)',
      '✅ Relatórios de faturamento',
      '✅ Notificações Telegram',
      '✅ Automações Zapier',
      '❌ Auditoria de ações',
    ],
  },
  {
    id: 'premium', name: 'Premium', price: 199.90, icon: '👑',
    color: 'from-chocolate-700 to-chocolate-900',
    badge: 'bg-chocolate-100 text-chocolate-800',
    border: 'border-chocolate-400',
    limits: { orders: 999999, users: 999999, products: 999999 },
    features: [
      '✅ Pedidos ILIMITADOS',
      '✅ Usuários ILIMITADOS',
      '✅ Produtos ILIMITADOS',
      '✅ Clientes ILIMITADOS',
      '✅ TUDO do plano Standard',
      '✅ Auditoria completa de ações',
      '✅ Relatórios avançados (por produto/cliente)',
      '✅ Múltiplas categorias',
      '✅ Integração iFood (beta)',
      '✅ Suporte prioritário 24h',
      '✅ Acesso antecipado a novas features',
    ],
  },
]

const BILLING_CYCLES = [
  { id: 'mensal', label: 'Mensal', months: 1, discount: 0 },
  { id: '12x', label: '12 meses (-10%)', months: 12, discount: 10 },
  { id: '24x', label: '24 meses (-15%)', months: 24, discount: 15 },
  { id: '36x', label: '36 meses (-20%)', months: 36, discount: 20 },
]

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active:    { label: 'Ativo',     color: 'text-green-600 bg-green-50',   icon: <CheckCircle size={12} /> },
  trial:     { label: 'Trial',     color: 'text-blue-600 bg-blue-50',     icon: <Clock size={12} /> },
  overdue:   { label: 'Inadimp.', color: 'text-red-600 bg-red-50',       icon: <AlertTriangle size={12} /> },
  suspended: { label: 'Suspenso', color: 'text-orange-600 bg-orange-50', icon: <Ban size={12} /> },
  cancelled: { label: 'Cancelado',color: 'text-gray-600 bg-gray-50',     icon: <XCircle size={12} /> },
}

// ── Service ──────────────────────────────────────────────────────────────
const saApi = {
  getRevenue:   () => api.get('/superadmin/revenue').then(r => r.data.data),
  getTenants:   () => api.get('/superadmin/tenants').then(r => r.data.data),
  updatePlan:   (id: number, plan: string, planStatus = 'active') =>
    api.put(`/superadmin/tenants/${id}/plan`, { plan, plan_status: planStatus }),
  updateStatus: (id: number, status: string) =>
    api.put(`/superadmin/tenants/${id}/status`, { status }),
  getSubs:      () => api.get('/superadmin/subscriptions').then(r => r.data.data),
  createSub:    (data: any) => api.post('/superadmin/subscriptions', data).then(r => r.data.data),
  updateSub:    (id: number, status: string) => api.patch(`/superadmin/subscriptions/${id}/status`, { status }),
}

// ── Helpers ───────────────────────────────────────────────────────────────
function PlanBadge({ plan }: { plan: string }) {
  const p = PLANS.find(x => x.id === plan)
  if (!p) return <span className="text-xs text-gray-400">{plan}</span>
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${p.badge}`}>
      {p.icon} {p.name}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.active
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>
      {s.icon} {s.label}
    </span>
  )
}

// ── Componente principal ──────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [tab, setTab] = useState<'dashboard' | 'tenants' | 'subscriptions' | 'plans' | 'passwords' | 'logs'>('dashboard')
  const [revenue, setRevenue] = useState<any>(null)
  const [tenants, setTenants] = useState<any[]>([])
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [editingTenant, setEditingTenant] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rev, ten, sub] = await Promise.all([saApi.getRevenue(), saApi.getTenants(), saApi.getSubs()])
      setRevenue(rev)
      setTenants(ten)
      setSubs(sub)
    } catch {
      toast.error('Erro ao carregar dados do super admin')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // Cálculos de receita
  const mrr = revenue?.byPlan?.reduce((s: number, p: any) => s + Number(p.mrr || 0), 0) || 0
  const arr = mrr * 12
  const totalActive = tenants.filter(t => t.plan_status === 'active').length
  const totalOverdue = tenants.filter(t => t.plan_status === 'overdue').length

  const filteredTenants = tenants.filter(t => {
    const matchS = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase())
    const matchP = filterPlan === 'todos' || t.plan === filterPlan
    const matchSt = filterStatus === 'todos' || t.plan_status === filterStatus
    return matchS && matchP && matchSt
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-mocha-400">
      <Loader2 className="w-5 h-5 animate-spin" /> Carregando dados...
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-chocolate-700 to-chocolate-900 flex items-center justify-center">
            <Crown size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-mocha-900">Super Admin</h2>
            <p className="text-mocha-400 text-sm">Gestão global do SweetFlow SaaS</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-mocha-500 hover:text-mocha-800 transition">
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-cream-100 rounded-2xl w-fit">
        {[
          { id: 'dashboard', label: 'Painel', icon: BarChart3 },
          { id: 'tenants', label: 'Confeitarias', icon: Building },
          { id: 'subscriptions', label: 'Assinaturas', icon: DollarSign },
          { id: 'passwords', label: 'Senhas', icon: Key },
          { id: 'logs', label: 'Acessos', icon: Activity },
          { id: 'plans', label: 'Planos', icon: Star },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-mocha-900 shadow-sm' : 'text-mocha-400 hover:text-mocha-700'}`}>
            <t.icon size={14} /> {t.label}
            {t.id === 'tenants' && <span className="ml-1 bg-chocolate-100 text-chocolate-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{tenants.length}</span>}
          </button>
        ))}
      </div>

      {/* ── PAINEL DE RECEITA ── */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'MRR', value: formatCurrency(mrr), sub: 'Receita mensal recorrente', icon: TrendingUp, color: 'text-green-600' },
              { label: 'ARR', value: formatCurrency(arr), sub: 'Receita anual projetada', icon: BarChart3, color: 'text-blue-600' },
              { label: 'Ativos', value: totalActive, sub: 'Confeitarias ativas', icon: CheckCircle, color: 'text-green-600' },
              { label: 'Inadimplentes', value: totalOverdue, sub: 'Precisam de atenção', icon: AlertTriangle, color: 'text-red-500' },
            ].map(k => (
              <div key={k.label} className="card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-mocha-400 font-medium">{k.label}</p>
                  <k.icon size={16} className={k.color} />
                </div>
                <p className={`font-display text-2xl font-black ${k.color}`}>{k.value}</p>
                <p className="text-xs text-mocha-400 mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Por plano */}
          <div className="card">
            <h3 className="font-display font-semibold text-mocha-900 mb-4">Distribuição por Plano</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map(plan => {
                const row = revenue?.byPlan?.find((p: any) => p.plan === plan.id)
                const count = Number(row?.tenant_count || 0)
                const planMrr = Number(row?.mrr || 0)
                return (
                  <div key={plan.id} className={`rounded-2xl border-2 ${plan.border} p-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-sm`}>{plan.icon}</div>
                      <span className="font-semibold text-mocha-900">{plan.name}</span>
                    </div>
                    <p className="font-display text-3xl font-black text-mocha-900">{count}</p>
                    <p className="text-xs text-mocha-400 mb-2">{count === 1 ? 'confeitaria' : 'confeitarias'}</p>
                    <div className="border-t border-cream-100 pt-2">
                      <p className="text-sm font-semibold text-mocha-700">{formatCurrency(planMrr)}<span className="text-xs font-normal text-mocha-400">/mês</span></p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Crescimento mensal */}
          {revenue?.monthlyGrowth?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-mocha-900 mb-4">Novos clientes por mês</h3>
              <div className="flex items-end gap-2 h-32">
                {revenue.monthlyGrowth.map((m: any) => {
                  const max = Math.max(...revenue.monthlyGrowth.map((x: any) => x.new_tenants), 1)
                  const pct = (m.new_tenants / max) * 100
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-mocha-700">{m.new_tenants}</span>
                      <div className="w-full rounded-t-lg bg-chocolate-700 transition-all" style={{ height: `${Math.max(pct, 4)}%` }} />
                      <span className="text-[10px] text-mocha-400">{m.month.split('-')[1]}/{m.month.split('-')[0].slice(2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Assinaturas recentes */}
          <div className="card">
            <h3 className="font-display font-semibold text-mocha-900 mb-4">Assinaturas Recentes</h3>
            {revenue?.recentSubs?.length === 0
              ? <p className="text-sm text-mocha-400 text-center py-6">Nenhuma assinatura ainda</p>
              : <div className="space-y-2">
                  {revenue?.recentSubs?.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-mocha-800">{s.tenant_name}</p>
                        <p className="text-xs text-mocha-400">{s.billing_cycle} · {formatDate(s.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <PlanBadge plan={s.plan} />
                        <p className="text-xs text-mocha-500 mt-1">{formatCurrency(s.price_per_month)}/mês</p>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}

      {/* ── CONFEITARIAS ── */}
      {tab === 'tenants' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-300" />
              <input type="text" placeholder="Buscar por nome ou email..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 input text-sm" />
            </div>
            <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="input text-sm">
              <option value="todos">Todos os planos</option>
              {PLANS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input text-sm">
              <option value="todos">Todos os status</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <p className="text-sm text-mocha-400">{filteredTenants.length} confeitaria{filteredTenants.length !== 1 ? 's' : ''}</p>

          <div className="space-y-3">
            {filteredTenants.map(t => (
              <div key={t.id} className="card hover:shadow-warm-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cream-200 to-cream-100 flex items-center justify-center text-xl flex-shrink-0">🎂</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-mocha-900 truncate">{t.name}</h3>
                      <PlanBadge plan={t.plan} />
                      <StatusBadge status={t.plan_status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mocha-400">
                      <span className="flex items-center gap-1"><Mail size={10} /> {t.email}</span>
                      <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(t.created_at)}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {[
                        { icon: Package, label: 'pedidos', value: t.total_orders },
                        { icon: Users, label: 'clientes', value: t.total_clients },
                        { icon: DollarSign, label: 'faturamento', value: formatCurrency(t.total_revenue || 0) },
                      ].map(kpi => (
                        <div key={kpi.label} className="flex items-center gap-1.5">
                          <kpi.icon size={12} className="text-mocha-300" />
                          <span className="text-xs font-semibold text-mocha-700">{kpi.value}</span>
                          <span className="text-xs text-mocha-400">{kpi.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <TenantActions tenant={t} onUpdate={load} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ASSINATURAS ── */}
      {tab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-mocha-400">{subs.length} assinatura{subs.length !== 1 ? 's' : ''}</p>
            <p className="text-xs text-mocha-400 italic flex items-center gap-1.5">
              <Sparkles size={12} /> Assinaturas são criadas automaticamente quando a confeitaria escolhe o plano e conclui o pagamento no cadastro.
            </p>
          </div>

          <div className="space-y-3">
            {subs.map(s => (
              <div key={s.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-mocha-900 text-sm">{s.tenant_name}</span>
                      <PlanBadge plan={s.plan} />
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="flex gap-4 text-xs text-mocha-400">
                      <span>{s.billing_cycle} · {formatCurrency(s.price_per_month)}/mês</span>
                      <span>Início: {formatDate(s.started_at)}</span>
                      {s.expires_at && <span>Vence: {formatDate(s.expires_at)}</span>}
                    </div>
                    {s.notes && <p className="text-xs text-mocha-400 mt-1 italic">{s.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    {s.status === 'active'
                      ? <button onClick={async () => { await saApi.updateSub(s.id, 'cancelled'); load() }} className="text-xs text-red-400 hover:underline">Cancelar</button>
                      : <button onClick={async () => { await saApi.updateSub(s.id, 'active'); load() }} className="text-xs text-green-600 hover:underline">Reativar</button>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SENHAS ── */}
      {tab === 'passwords' && (
        <PasswordResetPanel tenants={tenants} onUpdate={load} />
      )}

      {/* ── HISTÓRICO DE ACESSOS ── */}
      {tab === 'logs' && (
        <AccessLogsPanel />
      )}

      {/* ── PLANOS ── */}
      {tab === 'plans' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-display text-lg font-bold text-mocha-900 mb-1">Tabela de Planos SweetFlow</h3>
            <p className="text-mocha-400 text-sm mb-5">Funcionalidades disponíveis em cada plano. Use isso para comercializar o produto.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <div key={plan.id} className={`rounded-2xl border-2 ${plan.border} overflow-hidden`}>
                  <div className={`bg-gradient-to-br ${plan.color} p-4 text-white`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{plan.icon}</span>
                        <span className="font-display font-bold text-lg">{plan.name}</span>
                      </div>
                      {(plan as any).popular && <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">POPULAR</span>}
                    </div>
                    <p className="font-display text-3xl font-black">{formatCurrency(plan.price)}<span className="text-sm font-normal opacity-80">/mês</span></p>
                    <div className="flex gap-3 mt-2 text-xs opacity-80">
                      <span>👤 {plan.limits.users === 999999 ? '∞' : plan.limits.users} usuário{plan.limits.users !== 1 ? 's' : ''}</span>
                      <span>📦 {plan.limits.products === 999999 ? '∞' : plan.limits.products} produtos</span>
                      <span>📋 {plan.limits.orders === 999999 ? '∞' : plan.limits.orders} pedidos/mês</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    {plan.features.map((f, i) => (
                      <p key={i} className={`text-xs ${f.startsWith('✅') ? 'text-mocha-700' : 'text-mocha-300'}`}>{f}</p>
                    ))}
                  </div>
                  <div className="px-4 pb-4">
                    <div className="border-t border-cream-100 pt-3">
                      <p className="text-xs font-semibold text-mocha-500 mb-1">Ciclos de cobrança:</p>
                      {BILLING_CYCLES.map(c => {
                        const discounted = c.discount > 0 ? plan.price * (1 - c.discount / 100) : plan.price
                        return (
                          <div key={c.id} className="flex justify-between text-xs text-mocha-600 py-0.5">
                            <span>{c.label}</span>
                            <span className="font-semibold">{formatCurrency(discounted)}/mês</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabela comparativa */}
          <div className="card overflow-x-auto">
            <h3 className="font-display font-semibold text-mocha-900 mb-4">Tabela Comparativa</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-100">
                  <th className="text-left text-mocha-500 font-medium pb-3">Funcionalidade</th>
                  {PLANS.map(p => <th key={p.id} className="text-center pb-3"><PlanBadge plan={p.id} /></th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Dashboard KPIs', '✅', '✅', '✅'],
                  ['Gráficos e Analytics', '❌', '✅', '✅'],
                  ['Top Produtos/Clientes', '❌', '✅', '✅'],
                  ['Pedidos/mês', '50', '300', '∞'],
                  ['Usuários', '1', '5', '∞'],
                  ['Produtos', '30', '200', '∞'],
                  ['Clientes', '100', '500', '∞'],
                  ['Catálogo E-commerce', '✅', '✅', '✅'],
                  ['Checkout Online (Stripe/MP/Pagar.me)', '❌', '✅', '✅'],
                  ['Conta do Cliente Final', '❌', '✅', '✅'],
                  ['Precificação Inteligente', '❌', '✅', '✅'],
                  ['Notificações Telegram', '❌', '✅', '✅'],
                  ['Automações Zapier', '❌', '✅', '✅'],
                  ['Auditoria de Ações', '❌', '❌', '✅'],
                  ['Integração iFood (beta)', '❌', '❌', '✅'],
                  ['Suporte', 'Email', 'Email+Chat', 'Prioritário 24h'],
                ].map(([feat, eco, std, prem]) => (
                  <tr key={feat} className="border-b border-cream-50 hover:bg-cream-50">
                    <td className="py-2 pr-4 text-mocha-700">{feat}</td>
                    {[eco, std, prem].map((v, i) => (
                      <td key={i} className={`text-center py-2 font-medium ${v === '✅' ? 'text-green-600' : v === '❌' ? 'text-gray-300' : 'text-mocha-700'}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────

function TenantActions({ tenant, onUpdate }: { tenant: any; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function changeStatus(status: string) {
    setLoading(true)
    try {
      await api.put(`/superadmin/tenants/${tenant.id}/status`, { status })
      toast.success(`Status atualizado para ${status}`)
      onUpdate()
    } catch { toast.error('Erro ao atualizar status') } finally { setLoading(false); setOpen(false) }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-cream-100 transition">
        {loading ? <Loader2 size={16} className="animate-spin text-mocha-400" /> : <MoreVertical size={16} className="text-mocha-400" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 w-48 bg-white rounded-2xl shadow-warm-lg overflow-hidden z-50 border border-cream-100">
            <div className="px-3 py-2 text-xs font-semibold text-mocha-400 border-b border-cream-100">Status</div>
            {tenant.plan_status !== 'active' && (
              <button onClick={() => changeStatus('active')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 transition">
                <CheckCircle size={14} /> Ativar
              </button>
            )}
            {tenant.plan_status === 'active' && (
              <button onClick={() => changeStatus('suspended')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 transition">
                <Ban size={14} /> Suspender
              </button>
            )}
            <div className="px-3 py-2 text-[11px] text-mocha-400 border-t border-cream-100 italic">
              O plano é escolhido e pago pela própria confeitaria no cadastro/checkout.
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────
function PasswordResetPanel({ tenants, onUpdate }: { tenants: any[]; onUpdate: () => void }) {
  const [selectedId, setSelectedId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = tenants.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) { toast.error('Selecione uma confeitaria'); return }
    if (newPassword.length < 6) { toast.error('Senha mínima: 6 caracteres'); return }
    if (newPassword !== confirm) { toast.error('As senhas não coincidem'); return }
    setSaving(true)
    try {
      await api.put(`/superadmin/tenants/${selectedId}/reset-password`, { newPassword })
      toast.success('Senha resetada com sucesso!')
      setNewPassword(''); setConfirm(''); setSelectedId('')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao resetar senha')
    } finally { setSaving(false) }
  }

  const sel = tenants.find(t => String(t.id) === selectedId)

  return (
    <div className="space-y-6">
      <div className="card border-2 border-chocolate-200">
        <h3 className="font-display font-semibold text-mocha-900 mb-1 flex items-center gap-2">
          <Key size={16} className="text-chocolate-600" /> Resetar Senha do Admin
        </h3>
        <p className="text-xs text-mocha-400 mb-4">Redefine a senha de todos os usuários admin/gerente da confeitaria selecionada.</p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="label">Buscar Confeitaria</label>
            <input type="text" placeholder="Nome ou email..." value={search}
              onChange={e => setSearch(e.target.value)} className="input mb-2" />
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="input" required>
              <option value="">Selecione a confeitaria...</option>
              {filtered.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.email} ({t.plan})
                </option>
              ))}
            </select>
          </div>

          {sel && (
            <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl">
              <div className="text-2xl">🎂</div>
              <div>
                <p className="font-semibold text-mocha-900 text-sm">{sel.name}</p>
                <p className="text-xs text-mocha-400">{sel.email} · <PlanBadge plan={sel.plan} /></p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nova Senha</label>
              <input type="password" placeholder="Mínimo 6 caracteres" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} className="input" required minLength={6} />
            </div>
            <div>
              <label className="label">Confirmar Senha</label>
              <input type="password" placeholder="Repita a senha" value={confirm}
                onChange={e => setConfirm(e.target.value)} className="input" required />
            </div>
          </div>

          {newPassword && confirm && newPassword !== confirm && (
            <p className="text-xs text-red-500">As senhas não coincidem</p>
          )}

          <button type="submit" disabled={saving || !selectedId || newPassword.length < 6 || newPassword !== confirm}
            className="btn-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
            Resetar Senha
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="font-display font-semibold text-mocha-900 mb-3">Todas as confeitarias ({tenants.length})</h3>
        <div className="space-y-2">
          {tenants.map(t => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-cream-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-mocha-800">{t.name}</p>
                <p className="text-xs text-mocha-400">{t.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <PlanBadge plan={t.plan} />
                <button onClick={() => { setSelectedId(String(t.id)); setSearch('') }}
                  className="text-xs px-3 py-1 bg-cream-100 hover:bg-cream-200 rounded-lg transition text-mocha-600">
                  Selecionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Painel de histórico de acessos ────────────────────────────────────────
function AccessLogsPanel() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/superadmin/access-logs?limit=100')
      .then(r => setLogs(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    login:           { label: 'Login',           color: 'text-green-600 bg-green-50' },
    logout:          { label: 'Logout',           color: 'text-slate-600 bg-slate-50' },
    login_failed:    { label: 'Falha de Login',   color: 'text-red-600 bg-red-50' },
    password_reset:  { label: 'Reset de Senha',   color: 'text-amber-600 bg-amber-50' },
    plan_change:     { label: 'Mudança de Plano', color: 'text-blue-600 bg-blue-50' },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-mocha-400">{logs.length} registros recentes</p>
        <button onClick={() => { setLoading(true); api.get('/superadmin/access-logs?limit=100').then(r => setLogs(r.data.data || [])).finally(() => setLoading(false)) }}
          className="flex items-center gap-1 text-xs text-mocha-500 hover:text-mocha-800 transition">
          <RefreshCw size={12} /> Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-mocha-400" /></div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-12">
          <Activity size={32} className="text-mocha-200 mx-auto mb-3" />
          <p className="text-mocha-400">Nenhum acesso registrado ainda</p>
          <p className="text-xs text-mocha-300 mt-1">Os acessos serão registrados a partir de agora</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-100 text-xs text-mocha-400">
                <th className="text-left pb-2">Data/Hora</th>
                <th className="text-left pb-2">Ação</th>
                <th className="text-left pb-2">Confeitaria</th>
                <th className="text-left pb-2">Email</th>
                <th className="text-left pb-2">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => {
                const act = ACTION_LABELS[log.action] || { label: log.action, color: 'text-mocha-600 bg-mocha-50' }
                return (
                  <tr key={log.id} className="border-b border-cream-50 hover:bg-cream-50">
                    <td className="py-2 text-xs text-mocha-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${act.color}`}>{act.label}</span>
                    </td>
                    <td className="py-2 text-xs text-mocha-700">{log.tenant_name || '—'}</td>
                    <td className="py-2 text-xs text-mocha-500">{log.email || log.user_name || '—'}</td>
                    <td className="py-2 text-xs text-mocha-400 max-w-[200px] truncate">{log.details || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
