import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(i => i.productId === action.payload.productId)
      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter(i => i.productId !== action.payload)
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    updateQuantity(state, action: PayloadAction<{ productId: number; quantity: number }>) {
      const item = state.items.find(i => i.productId === action.payload.productId)
      if (item) item.quantity = action.payload.quantity
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    clearCart(state) {
      state.items = []
      localStorage.removeItem('cart')
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
