import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OrdersPage from './pages/OrdersPage'
import ProductsPage from './pages/ProductsPage'
import ClientsPage from './pages/ClientsPage'
import PaymentsPage from './pages/PaymentsPage'
import { ReportsPage, AuditPage, SettingsPage, OnboardPage } from './pages/OtherPages'
import SuperAdminPage from './pages/SuperAdminPage'
import WastePage from './pages/WastePage'
import DemandForecastPage from './pages/DemandForecastPage'
import PricingPage from './pages/PricingPage'
import SmartMenuPage from './pages/SmartMenuPage'
import RecurrencePage from './pages/RecurrencePage'
import ProfitPage from './pages/ProfitPage'
import DesignSettings from './pages/settings/DesignSettings'
import CatalogPage from './pages/catalog/CatalogPage'
import IntegrationsPage from './pages/integrations/IntegrationsPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="flex flex-col items-center gap-3">
        <div className="text-4xl animate-pulse-soft">🎂</div>
        <p className="text-mocha-500 text-sm">Carregando...</p>
      </div>
    </div>
  )
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/onboard" element={<OnboardPage />} />
      {/* ✅ PÚBLICO — sem auth */}
      <Route path="/catalogo/:slug" element={<CatalogPage />} />
      {/* Privadas */}
      <Route path="/dashboard"    element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/orders"       element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
      <Route path="/products"     element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
      <Route path="/clients"      element={<PrivateRoute><ClientsPage /></PrivateRoute>} />
      <Route path="/payments"     element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />
      <Route path="/reports"      element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
      <Route path="/audit"        element={<PrivateRoute><AuditPage /></PrivateRoute>} />
      <Route path="/settings"     element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/super-admin"  element={<PrivateRoute><SuperAdminPage /></PrivateRoute>} />
      <Route path="/waste"        element={<PrivateRoute><WastePage /></PrivateRoute>} />
      <Route path="/demand"       element={<PrivateRoute><DemandForecastPage /></PrivateRoute>} />
      <Route path="/pricing"      element={<PrivateRoute><PricingPage /></PrivateRoute>} />
      <Route path="/smart-menu"   element={<PrivateRoute><SmartMenuPage /></PrivateRoute>} />
      <Route path="/recurrence"   element={<PrivateRoute><RecurrencePage /></PrivateRoute>} />
      <Route path="/profit"       element={<PrivateRoute><ProfitPage /></PrivateRoute>} />
      <Route path="/design"       element={<PrivateRoute><DesignSettings /></PrivateRoute>} />
      {/* ✅ NOVO */}
      <Route path="/integrations" element={<PrivateRoute><IntegrationsPage /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          duration: 3500,
          style: { background: '#2c1c12', color: '#fdf6f0', borderRadius: '14px', fontSize: '14px', fontFamily: '"DM Sans", sans-serif' },
          success: { iconTheme: { primary: '#556B2F', secondary: '#fdf6f0' } },
          error:   { iconTheme: { primary: '#e74c3c', secondary: '#fdf6f0' } },
        }} />
      </AuthProvider>
    </BrowserRouter>
  )
}
