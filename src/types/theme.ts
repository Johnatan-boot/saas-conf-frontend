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
  storeName: string
  tagline: string
  slug: string
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

export const DEFAULT_THEME: StoreTheme = {
  primaryColor: '#6F4F37',
  secondaryColor: '#c4621d',
  backgroundColor: '#fffdf9',
  textColor: '#261c12',
  cardColor: '#ffffff',
  logoUrl: '',
  storeName: 'Minha Confeitaria',
  tagline: 'Doces momentos para sua vida',
  instagram: '',
  facebook: '',
  whatsapp: '',
  youtube: '',
  slug: '',
}
