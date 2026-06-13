import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Users, Package, CreditCard,
  LogOut, ChevronLeft, ChevronRight, Settings, BarChart3,
  Bell, Menu, X, FileText, Crown, Trash2, Brain,
  Calculator, ShoppingCart, RefreshCw, DollarSign, Palette, Plug
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { clsx } from '../../utils'
import AIChatWidget from '../ui/AIChatWidget'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard',    icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { to: '/orders',       icon: <ShoppingBag size={18} />,     label: 'Pedidos' },
      { to: '/products',     icon: <Package size={18} />,          label: 'Produtos' },
      { to: '/clients',      icon: <Users size={18} />,            label: 'Clientes' },
      { to: '/payments',     icon: <CreditCard size={18} />,       label: 'Pagamentos' },
    ],
  },
  {
    label: 'Inteligência',
    items: [
      { to: '/profit',       icon: <DollarSign size={18} />,   label: 'Lucro Real' },
      { to: '/pricing',      icon: <Calculator size={18} />,   label: 'Precificação' },
      { to: '/demand',       icon: <Brain size={18} />,         label: 'Previsão IA' },
      { to: '/smart-menu',   icon: <ShoppingCart size={18} />, label: 'Menu Inteligente' },
      { to: '/recurrence',   icon: <RefreshCw size={18} />,    label: 'Recorrência' },
      { to: '/waste',        icon: <Trash2 size={18} />,        label: 'Desperdício' },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { to: '/reports',      icon: <BarChart3 size={18} />,  label: 'Relatórios' },
      { to: '/design',       icon: <Palette size={18} />,    label: 'Design da Loja' },
      { to: '/integrations', icon: <Plug size={18} />,       label: 'Integrações' },
      { to: '/audit',        icon: <FileText size={18} />,   label: 'Auditoria',   adminOnly: true },
      { to: '/settings',     icon: <Settings size={18} />,   label: 'Configurações', adminOnly: true },
      { to: '/super-admin',  icon: <Crown size={18} />,      label: 'Super Admin', superAdminOnly: true },
    ],
  },
]

const NAV = NAV_GROUPS.flatMap(g => g.items)

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() { logout(); navigate('/login') }

  const visibleNav = NAV.filter(n => {
    if ((n as any).superAdminOnly) return user?.role === 'super_admin' || user?.email?.includes('admin')
    if ((n as any).adminOnly) return isAdmin()
    return true
  })

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={clsx('flex items-center gap-3 px-4 py-6 border-b border-chocolate-700/30', collapsed && 'justify-center')}>
        <div className="w-9 h-9 rounded-xl bg-cream-100 flex items-center justify-center text-xl flex-shrink-0">🎂</div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display font-bold text-cream-50 text-sm leading-tight truncate">Confeitaria</p>
            <p className="text-chocolate-300 text-xs truncate">SaaS</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => {
          const groupItems = group.items.filter(n => {
            if ((n as any).superAdminOnly) return user?.role === 'super_admin' || user?.email?.includes('admin')
            if ((n as any).adminOnly) return isAdmin()
            return true
          })
          if (groupItems.length === 0) return null
          return (
            <div key={gi}>
              {gi > 0 && !collapsed && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-bold text-chocolate-500 uppercase tracking-widest">{group.label}</p>
                </div>
              )}
              {gi > 0 && collapsed && <div className="border-t border-chocolate-700/30 my-2" />}
              {groupItems.map(item => (
                <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => clsx('sidebar-link', isActive && 'active', collapsed && 'justify-center px-3')}
                  title={collapsed ? item.label : undefined}>
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.to === '/super-admin' && (
                    <span className="ml-auto text-[9px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-bold">SA</span>
                  )}
                  {!collapsed && item.to === '/integrations' && (
                    <span className="ml-auto text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-chocolate-700/30 space-y-2">
        {!collapsed && (
          <div className="px-4 py-2 rounded-xl bg-chocolate-700/30">
            <p className="text-cream-100 text-sm font-medium truncate">{user?.name}</p>
            <p className="text-chocolate-300 text-xs capitalize truncate">{user?.role}</p>
          </div>
        )}
        <button onClick={handleLogout}
          className={clsx('sidebar-link w-full text-red-300 hover:text-red-200 hover:bg-red-900/20', collapsed && 'justify-center px-3')}>
          <LogOut size={20} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      <button onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center py-3 border-t border-chocolate-700/30 text-chocolate-300 hover:text-cream-100 transition-colors">
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  )

  return (
    <div className="flex h-screen bg-cream-50 overflow-hidden">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-mocha-900/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={clsx('fixed inset-y-0 left-0 z-50 w-64 bg-chocolate-900 transition-transform duration-300 lg:hidden', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-chocolate-300 hover:text-cream-100"><X size={20} /></button>
        <SidebarContent />
      </aside>
      <aside className={clsx('hidden lg:flex flex-col bg-chocolate-900 transition-all duration-300 flex-shrink-0', collapsed ? 'w-16' : 'w-64')}>
        <SidebarContent />
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-cream-100 px-4 lg:px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-cream-100 text-mocha-600"><Menu size={20} /></button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-semibold text-mocha-900 text-base lg:text-lg truncate">
              {visibleNav.find(n => location.pathname.startsWith(n.to))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-cream-100 text-mocha-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-chocolate-800 flex items-center justify-center text-cream-100 text-sm font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-pattern">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      <AIChatWidget />
    </div>
  )
}
