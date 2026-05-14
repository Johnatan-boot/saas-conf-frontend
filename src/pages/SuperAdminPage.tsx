import React, { useState } from 'react'
import {
  Crown, Users, CreditCard, TrendingUp, Shield, Search, MoreVertical,
  CheckCircle, XCircle, Clock, Star, Zap, Package, ChevronDown, X,
  Edit, Ban, RefreshCw, Plus, Building, Mail, Phone, Calendar
} from 'lucide-react'
import { formatCurrency, formatDate } from '../utils'
import { clsx } from '../utils'

// ── Mock data ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'economico',
    name: 'Econômico',
    price: 49.90,
    color: 'from-slate-400 to-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    icon: '🌱',
    features: [
      'Até 50 pedidos/mês',
      '1 usuário',
      'Dashboard básico',
      'Gestão de produtos',
      'Clientes ilimitados',
      'Relatórios básicos',
    ],
    limits: { orders: 50, users: 1, products: 30 },
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 99.90,
    color: 'from-amber-500 to-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    icon: '🎂',
    features: [
      'Até 300 pedidos/mês',
      'Até 5 usuários',
      'Precificação inteligente',
      'Controle de desperdício',
      'Cardápio digital',
      'WhatsApp básico',
      'Previsão de demanda',
    ],
    limits: { orders: 300, users: 5, products: 200 },
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199.90,
    color: 'from-chocolate-700 to-chocolate-900',
    badge: 'bg-chocolate-100 text-chocolate-800',
    icon: '👑',
    features: [
      'Pedidos ilimitados',
      'Usuários ilimitados',
      'IA de previsão avançada',
      'WhatsApp automação total',
      'Sistema de recorrência',
      'Margem real de lucro',
      'Menu inteligente',
      'Suporte prioritário',
    ],
    limits: { orders: Infinity, users: Infinity, products: Infinity },
  },
]

const MOCK_TENANTS = [
  {
    id: 1, name: 'Doces da Maria', slug: 'doces-maria',
    email: 'maria@docesmaria.com.br', phone: '(11) 99999-1111',
    plan: 'premium', plan_status: 'active', mrr: 199.90,
    orders_this_month: 234, users: 3, created_at: '2024-01-15',
    last_activity: '2025-05-04',
  },
  {
    id: 2, name: 'Confeitaria Bella', slug: 'confeitaria-bella',
    email: 'bella@confbella.com', phone: '(21) 98888-2222',
    plan: 'standard', plan_status: 'active', mrr: 99.90,
    orders_this_month: 87, users: 2, created_at: '2024-03-20',
    last_activity: '2025-05-05',
  },
  {
    id: 3, name: 'Bolos da Ana', slug: 'bolos-ana',
    email: 'ana@bolosana.com', phone: '(31) 97777-3333',
    plan: 'economico', plan_status: 'active', mrr: 49.90,
    orders_this_month: 32, users: 1, created_at: '2024-06-01',
    last_activity: '2025-05-01',
  },
  {
    id: 4, name: 'Sweet Dreams', slug: 'sweet-dreams',
    email: 'contato@sweetdreams.com', phone: '(41) 96666-4444',
    plan: 'premium', plan_status: 'overdue', mrr: 199.90,
    orders_this_month: 0, users: 4, created_at: '2024-02-10',
    last_activity: '2025-04-15',
  },
  {
    id: 5, name: 'Ateliê Dulce', slug: 'atelie-dulce',
    email: 'dulce@ateliedluce.com', phone: '(51) 95555-5555',
    plan: 'standard', plan_status: 'cancelled', mrr: 0,
    orders_this_month: 0, users: 1, created_at: '2023-11-01',
    last_activity: '2025-03-20',
  },
]

const PLAN_STATUS = {
  active: { label: 'Ativo', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  overdue: { label: 'Inadimplente', color: 'bg-red-100 text-red-700', icon: XCircle },
  trial: { label: 'Trial', color: 'bg-blue-100 text-blue-700', icon: Clock },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500', icon: Ban },
}

const PLAN_COLORS: Record<string, string> = {
  economico: 'bg-slate-100 text-slate-700',
  standard: 'bg-amber-100 text-amber-700',
  premium: 'bg-chocolate-100 text-chocolate-800',
}

// ── Components ─────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon, color }: any) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-mocha-500 uppercase tracking-wider">{label}</p>
          <p className="font-display text-2xl font-bold text-mocha-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-mocha-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
      </div>
    </div>
  )
}

function PlanCard({ plan, isEditing, onEdit, onSave, onCancel }: any) {
  const [price, setPrice] = useState(plan.price)
  const [features, setFeatures] = useState(plan.features)
  const [newFeature, setNewFeature] = useState('')

  const handleSave = () => {
    onSave({ ...plan, price: Number(price), features })
  }

  const removeFeature = (i: number) => setFeatures((f: string[]) => f.filter((_: string, idx: number) => idx !== i))
  const addFeature = () => {
    if (newFeature.trim()) { setFeatures((f: string[]) => [...f, newFeature.trim()]); setNewFeature('') }
  }

  return (
    <div className={`card relative overflow-hidden ${plan.popular ? 'ring-2 ring-amber-400' : ''}`}>
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
          MAIS POPULAR
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl`}>
          {plan.icon}
        </div>
        <div>
          <h3 className="font-display font-bold text-mocha-900 text-lg">{plan.name}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${plan.badge}`}>{plan.id}</span>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="label">Preço Mensal (R$)</label>
            <input
              type="number" step="0.01"
              className="input"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Funcionalidades</label>
            <div className="space-y-1.5">
              {features.map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-cream-50 rounded-lg px-3 py-1.5">
                  <span className="text-sm flex-1">{f}</span>
                  <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                className="input text-sm"
                placeholder="Nova funcionalidade..."
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addFeature()}
              />
              <button onClick={addFeature} className="btn-primary px-3 py-2 text-sm whitespace-nowrap">+ Add</button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="btn-primary text-sm flex-1">Salvar</button>
            <button onClick={onCancel} className="btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <span className="font-display text-3xl font-bold text-mocha-900">
              {formatCurrency(plan.price)}
            </span>
            <span className="text-mocha-400 text-sm">/mês</span>
          </div>
          <ul className="space-y-2 mb-4">
            {plan.features.map((f: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-mocha-700">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <button onClick={onEdit} className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
            <Edit size={14} /> Editar Plano
          </button>
        </>
      )}
    </div>
  )
}

function TenantModal({ tenant, onClose }: { tenant: any; onClose: () => void }) {
  const [plan, setPlan] = useState(tenant.plan)
  const [status, setStatus] = useState(tenant.plan_status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mocha-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-cream-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chocolate-100 flex items-center justify-center text-xl">🏪</div>
            <div>
              <h3 className="font-display font-bold text-mocha-900">{tenant.name}</h3>
              <p className="text-xs text-mocha-400">{tenant.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-cream-100 rounded-xl text-mocha-400"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cream-50 rounded-xl p-3">
              <p className="text-xs text-mocha-400">Email</p>
              <p className="text-sm font-medium text-mocha-800 mt-1 truncate">{tenant.email}</p>
            </div>
            <div className="bg-cream-50 rounded-xl p-3">
              <p className="text-xs text-mocha-400">Telefone</p>
              <p className="text-sm font-medium text-mocha-800 mt-1">{tenant.phone}</p>
            </div>
            <div className="bg-cream-50 rounded-xl p-3">
              <p className="text-xs text-mocha-400">Pedidos (mês)</p>
              <p className="text-sm font-bold text-mocha-900 mt-1">{tenant.orders_this_month}</p>
            </div>
            <div className="bg-cream-50 rounded-xl p-3">
              <p className="text-xs text-mocha-400">MRR</p>
              <p className="text-sm font-bold text-mocha-900 mt-1">{formatCurrency(tenant.mrr)}</p>
            </div>
          </div>

          <div>
            <label className="label">Plano</label>
            <select
              className="input"
              value={plan}
              onChange={e => setPlan(e.target.value)}
            >
              <option value="economico">🌱 Econômico — R$ 49,90/mês</option>
              <option value="standard">🎂 Standard — R$ 99,90/mês</option>
              <option value="premium">👑 Premium — R$ 199,90/mês</option>
            </select>
          </div>

          <div>
            <label className="label">Status da Assinatura</label>
            <select
              className="input"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="active">✅ Ativo</option>
              <option value="trial">🔵 Trial</option>
              <option value="overdue">🔴 Inadimplente</option>
              <option value="cancelled">⚫ Cancelado</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-cream-100">
          <button
            onClick={onClose}
            className="btn-primary flex-1"
          >
            Salvar Alterações
          </button>
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [tab, setTab] = useState<'overview' | 'subscriptions' | 'plans'>('overview')
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [plans, setPlans] = useState(PLANS)
  const [selectedTenant, setSelectedTenant] = useState<any>(null)

  const totalMRR = MOCK_TENANTS.filter(t => t.plan_status === 'active').reduce((a, t) => a + t.mrr, 0)
  const activeCount = MOCK_TENANTS.filter(t => t.plan_status === 'active').length
  const overdueCount = MOCK_TENANTS.filter(t => t.plan_status === 'overdue').length
  const totalTenants = MOCK_TENANTS.length

  const filteredTenants = MOCK_TENANTS.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === 'all' || t.plan === filterPlan
    const matchStatus = filterStatus === 'all' || t.plan_status === filterStatus
    return matchSearch && matchPlan && matchStatus
  })

  const handleSavePlan = (updated: any) => {
    setPlans(ps => ps.map(p => p.id === updated.id ? updated : p))
    setEditingPlan(null)
  }

  const TABS = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'subscriptions', label: 'Assinaturas', icon: Users },
    { id: 'plans', label: 'Planos & Preços', icon: Star },
  ]

  return (
    <div className="space-y-6">
      {selectedTenant && (
        <TenantModal tenant={selectedTenant} onClose={() => setSelectedTenant(null)} />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-chocolate-700 to-chocolate-900 flex items-center justify-center">
          <Crown size={22} className="text-cream-100" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-mocha-900">Super Admin</h2>
          <p className="text-mocha-500 text-sm">Gerenciamento global do SaaS Confeitaria</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-cream-100 rounded-xl w-fit">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                tab === t.id
                  ? 'bg-white text-chocolate-800 shadow-card'
                  : 'text-mocha-500 hover:text-mocha-800'
              )}
            >
              <Icon size={16} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Overview ──────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="MRR Total" value={formatCurrency(totalMRR)} sub="Receita mensal recorrente" icon="💰" color="bg-green-100" />
            <KPICard label="Clientes Ativos" value={activeCount} sub={`de ${totalTenants} total`} icon="🏪" color="bg-blue-100" />
            <KPICard label="Inadimplentes" value={overdueCount} sub="Pagamento em atraso" icon="⚠️" color="bg-red-100" />
            <KPICard label="ARR Projetado" value={formatCurrency(totalMRR * 12)} sub="Receita anual recorrente" icon="📈" color="bg-purple-100" />
          </div>

          {/* MRR por Plano */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-display font-semibold text-mocha-900 mb-4">Distribuição por Plano</h3>
              <div className="space-y-3">
                {PLANS.map(plan => {
                  const count = MOCK_TENANTS.filter(t => t.plan === plan.id && t.plan_status === 'active').length
                  const mrr = MOCK_TENANTS.filter(t => t.plan === plan.id && t.plan_status === 'active').reduce((a, t) => a + t.mrr, 0)
                  const pct = totalTenants > 0 ? (count / activeCount) * 100 : 0
                  return (
                    <div key={plan.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span>{plan.icon}</span>
                          <span className="font-medium text-mocha-800">{plan.name}</span>
                          <span className="text-mocha-400">({count} clientes)</span>
                        </span>
                        <span className="font-semibold text-mocha-900">{formatCurrency(mrr)}/mês</span>
                      </div>
                      <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${plan.color} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card">
              <h3 className="font-display font-semibold text-mocha-900 mb-4">Status das Assinaturas</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PLAN_STATUS).map(([key, val]) => {
                  const Icon = val.icon
                  const count = MOCK_TENANTS.filter(t => t.plan_status === key).length
                  return (
                    <div key={key} className={`rounded-xl px-4 py-3 ${val.color} bg-opacity-20`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={14} />
                        <span className="text-xs font-semibold uppercase tracking-wide">{val.label}</span>
                      </div>
                      <p className="font-display text-2xl font-bold">{count}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-cream-100">
                <h4 className="text-sm font-medium text-mocha-700 mb-3">Ações rápidas</h4>
                <div className="space-y-2">
                  {MOCK_TENANTS.filter(t => t.plan_status === 'overdue').map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-red-800">{t.name}</p>
                        <p className="text-xs text-red-500">Pagamento em atraso</p>
                      </div>
                      <button
                        onClick={() => setSelectedTenant(t)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Gerenciar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Subscriptions ────────────────────────────────── */}
      {tab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400" />
              <input
                className="input pl-9"
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="input w-auto" value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
              <option value="all">Todos os Planos</option>
              <option value="economico">🌱 Econômico</option>
              <option value="standard">🎂 Standard</option>
              <option value="premium">👑 Premium</option>
            </select>
            <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="trial">Trial</option>
              <option value="overdue">Inadimplente</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-100">
                <tr>
                  <th className="table-th">Confeitaria</th>
                  <th className="table-th hidden md:table-cell">Contato</th>
                  <th className="table-th">Plano</th>
                  <th className="table-th">Status</th>
                  <th className="table-th hidden lg:table-cell">Pedidos (mês)</th>
                  <th className="table-th hidden lg:table-cell">MRR</th>
                  <th className="table-th hidden xl:table-cell">Desde</th>
                  <th className="table-th w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map(tenant => {
                  const statusInfo = PLAN_STATUS[tenant.plan_status as keyof typeof PLAN_STATUS]
                  const StatusIcon = statusInfo.icon
                  return (
                    <tr key={tenant.id} className="table-tr">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-chocolate-100 flex items-center justify-center text-sm flex-shrink-0">
                            🏪
                          </div>
                          <div>
                            <p className="font-medium text-mocha-900">{tenant.name}</p>
                            <p className="text-xs text-mocha-400">{tenant.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td hidden md:table-cell">
                        <p className="text-xs text-mocha-600">{tenant.email}</p>
                        <p className="text-xs text-mocha-400">{tenant.phone}</p>
                      </td>
                      <td className="table-td">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${PLAN_COLORS[tenant.plan]}`}>
                          {tenant.plan === 'economico' ? '🌱' : tenant.plan === 'standard' ? '🎂' : '👑'}
                          {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon size={11} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="table-td hidden lg:table-cell font-medium">{tenant.orders_this_month}</td>
                      <td className="table-td hidden lg:table-cell font-semibold text-green-700">
                        {tenant.plan_status === 'cancelled' ? '—' : formatCurrency(tenant.mrr)}
                      </td>
                      <td className="table-td hidden xl:table-cell text-mocha-400 text-xs">
                        {formatDate(tenant.created_at)}
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => setSelectedTenant(tenant)}
                          className="p-2 hover:bg-cream-100 rounded-xl text-mocha-400 hover:text-mocha-700 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filteredTenants.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-mocha-400">
                      Nenhuma confeitaria encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Plans ───────────────────────────────────────── */}
      {tab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-mocha-600 text-sm">Configure os planos e preços do seu SaaS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isEditing={editingPlan === plan.id}
                onEdit={() => setEditingPlan(plan.id)}
                onCancel={() => setEditingPlan(null)}
                onSave={handleSavePlan}
              />
            ))}
          </div>

          <div className="card bg-chocolate-900 text-cream-50">
            <div className="flex items-center gap-3 mb-3">
              <Shield size={20} className="text-amber-400" />
              <h3 className="font-display font-semibold">Dica de Precificação</h3>
            </div>
            <p className="text-chocolate-200 text-sm leading-relaxed">
              Com base no mercado brasileiro de SaaS para confeitaria, o plano{' '}
              <strong className="text-amber-400">Standard (R$ 99,90)</strong> tende a converter melhor.
              O plano Econômico funciona bem como porta de entrada, e o Premium deve ter valor percebido
              claro — como IA de previsão e automação WhatsApp — para justificar o investimento.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
