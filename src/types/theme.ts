// ============================================================
// types/theme.ts — adicionado ao types/index.ts existente
// ============================================================

export interface StoreTheme {
  id?: number
  tenantId?: number
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  cardColor: string
  logoUrl: string
  bannerUrl: string
  storeName: string
  tagline: string
  aboutText: string
  slug: string
  address: string
  instagram: string
  facebook: string
  whatsapp: string
  youtube: string
  updatedAt?: string
}

export interface PublicProduct {
  id: number
  name: string
  description?: string
  price: number
  imageUrl?: string
  category?: string
  stock: number
}

export interface CartItem {
  product: PublicProduct
  quantity: number
}

export interface CustomerInfo {
  name: string
  phone: string
  address?: string
  notes?: string
  email?: string
  document?: string
}

export interface OrderPayload {
  storeSlug: string
  customer: CustomerInfo
  items: { productId: number; quantity: number; price: number }[]
  total: number
  paymentMethod: 'pix' | 'cartao' | 'dinheiro' | 'stripe' | 'mercadopago' | 'pagarme'
}

export interface CheckoutGatewayOptions {
  name: string
  amount: number
  quantity: number
  customerName?: string
  customerEmail?: string
  customerDocument?: string
  customerPhone?: string
}

// ============================================================
// Conta do cliente final (login no catálogo)
// ============================================================
export interface CustomerProfile {
  id: number
  name: string
  email: string
  phone: string
  address: string
  totalOrders: number
  totalSpent: number
}

export interface CustomerAuthResponse {
  accessToken: string
  client: CustomerProfile
}

export interface MyOrderItem {
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface MyOrder {
  id: number
  code: string
  status: string
  total: number
  deliveryType: string
  createdAt: string
  items: MyOrderItem[]
}

export const DEFAULT_THEME: StoreTheme = {
  primaryColor: '#6F4F37',
  secondaryColor: '#c4621d',
  backgroundColor: '#fffdf9',
  textColor: '#261c12',
  cardColor: '#ffffff',
  logoUrl: '',
  bannerUrl: '',
  storeName: 'Minha Confeitaria',
  tagline: 'Doces momentos para sua vida',
  aboutText: '',
  instagram: '',
  facebook: '',
  whatsapp: '',
  youtube: '',
  address: '',
  slug: '',
}
