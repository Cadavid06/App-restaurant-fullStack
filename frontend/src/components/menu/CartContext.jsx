"use client"

import { createContext, useContext, useState, useMemo } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.product_id === product.product_id)
      if (existing) {
        return prev.map((item) =>
          item.product.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId, newQty) => {
  setItems((prev) =>
    prev
      .map((item) =>
        item.product.product_id === productId
          ? { ...item, quantity: Math.max(1, newQty) }
          : item
      )
      .filter((item) => item.quantity > 0)
  )
}


  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.product.product_id !== productId))
  }

  const clearCart = () => setItems([])

  const total = useMemo(() => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [items])

  const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items])

  const value = { items, addItem, updateQuantity, removeItem, clearCart, total, itemCount }  

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}

