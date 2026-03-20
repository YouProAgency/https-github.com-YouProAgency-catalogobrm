import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, CartItem } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  isCartAnimating: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartAnimating, setIsCartAnimating] = useState(false)
  const { toast } = useToast()

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('brm_cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse cart', e)
      }
    }
  }, [])

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('brm_cart', JSON.stringify(items))
  }, [items])

  const triggerAnimation = () => {
    setIsCartAnimating(true)
    setTimeout(() => setIsCartAnimating(false), 300)
  }

  const addToCart = (product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...current, { product, quantity }]
    })
    triggerAnimation()
    toast({
      title: 'Produto Adicionado',
      description: `${product.name} foi adicionado ao seu orçamento.`,
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId))
    toast({
      title: 'Produto Removido',
      description: 'O item foi removido do seu carrinho de orçamentos.',
      variant: 'destructive',
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((current) =>
      current.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        isCartAnimating,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
