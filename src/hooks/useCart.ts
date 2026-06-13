import { useState, useCallback } from 'react'
import { CartItem, PublicProduct } from '../types/theme'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = useCallback((product: PublicProduct) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) { setItems(prev => prev.filter(i => i.product.id !== productId)); return }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)

  return { items, addToCart, removeFromCart, updateQuantity, clearCart, total, totalItems }
}
