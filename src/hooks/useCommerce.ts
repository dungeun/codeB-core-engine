// Commerce 관련 커스텀 훅
'use client'

import { useState, useCallback } from 'react'
import { commerceService, type Cart, type Product } from '@/lib/services/commerce-service'
import { useToast } from '@/contexts/ToastContext'
import type { AddToCartInput, UpdateCartItemInput } from '@/lib/validation/commerce'

// 장바구니 훅
export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const { showSuccess, showError } = useToast()

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      const response = await commerceService.getCart()
      
      if (response.success && response.data) {
        setCart(response.data.cart)
      } else {
        setCart({
          id: '',
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      showError('장바구니를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [showError])

  const addToCart = useCallback(async (data: AddToCartInput) => {
    try {
      const response = await commerceService.addToCart(data)
      
      if (response.success) {
        showSuccess('장바구니에 추가되었습니다.')
        await fetchCart()
        return true
      } else {
        showError('장바구니 추가 실패', response.error || '알 수 없는 오류')
        return false
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      showError('장바구니 추가 중 오류가 발생했습니다.')
      return false
    }
  }, [showSuccess, showError, fetchCart])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      setUpdating(itemId)
      const response = await commerceService.updateCartItem(itemId, { quantity })
      
      if (response.success) {
        await fetchCart()
        return true
      } else {
        showError('수량 변경 실패', response.error || '알 수 없는 오류')
        return false
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
      showError('수량 변경 중 오류가 발생했습니다.')
      return false
    } finally {
      setUpdating(null)
    }
  }, [showError, fetchCart])

  const removeItem = useCallback(async (itemId: string) => {
    try {
      setUpdating(itemId)
      const response = await commerceService.removeCartItem(itemId)
      
      if (response.success) {
        showSuccess('상품이 삭제되었습니다.')
        await fetchCart()
        return true
      } else {
        showError('삭제 실패', response.error || '알 수 없는 오류')
        return false
      }
    } catch (error) {
      console.error('Failed to remove item:', error)
      showError('삭제 중 오류가 발생했습니다.')
      return false
    } finally {
      setUpdating(null)
    }
  }, [showSuccess, showError, fetchCart])

  const clearCart = useCallback(async () => {
    try {
      setLoading(true)
      const response = await commerceService.clearCart()
      
      if (response.success) {
        showSuccess('장바구니가 비워졌습니다.')
        setCart({
          id: '',
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0
        })
        return true
      } else {
        showError('장바구니 비우기 실패', response.error || '알 수 없는 오류')
        return false
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
      showError('장바구니 비우기 중 오류가 발생했습니다.')
      return false
    } finally {
      setLoading(false)
    }
  }, [showSuccess, showError])

  const applyCoupon = useCallback(async (code: string) => {
    try {
      const response = await commerceService.applyCoupon({ code })
      
      if (response.success) {
        showSuccess('쿠폰이 적용되었습니다.')
        await fetchCart()
        return true
      } else {
        showError('쿠폰 적용 실패', response.error || '유효하지 않은 쿠폰입니다.')
        return false
      }
    } catch (error) {
      console.error('Failed to apply coupon:', error)
      showError('쿠폰 적용 중 오류가 발생했습니다.')
      return false
    }
  }, [showSuccess, showError, fetchCart])

  return {
    cart,
    loading,
    updating,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon
  }
}

// 제품 훅
export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true)
      const response = await commerceService.getProduct(productId)
      
      if (response.success && response.data) {
        setProduct(response.data.product)
      } else {
        showError('제품을 찾을 수 없습니다.')
        setProduct(null)
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      showError('제품 정보를 불러오는 중 오류가 발생했습니다.')
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [productId, showError])

  return {
    product,
    loading,
    fetchProduct,
    setProduct
  }
}

// 제품 목록 훅
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const { showError } = useToast()

  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true)
      const response = await commerceService.getProducts(filters)
      
      if (response.success && response.data) {
        setProducts(response.data.products)
        setTotal(response.data.total)
        setPage(response.data.page)
      } else {
        showError('제품 목록을 불러올 수 없습니다.')
        setProducts([])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      showError('제품 목록을 불러오는 중 오류가 발생했습니다.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [showError])

  return {
    products,
    loading,
    total,
    page,
    fetchProducts,
    setProducts
  }
}