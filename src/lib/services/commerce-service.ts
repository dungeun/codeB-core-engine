// Commerce API 서비스
'use client'

import { commerceApi, ApiResponse } from './api-client'
import type {
  AddToCartInput,
  UpdateCartItemInput,
  CouponInput,
  CreateOrderInput
} from '@/lib/validation/commerce'

// 타입 정의
export interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  category: string
  subcategory?: string
  brand?: string
  sku: string
  stock: number
  featured: boolean
  specifications?: Record<string, any>
  rating?: number
  reviewCount?: number
  tags?: string[]
  variants?: ProductVariant[]
  relatedProducts?: Product[]
}

export interface ProductVariant {
  id: string
  name: string
  options: VariantOption[]
}

export interface VariantOption {
  id: string
  value: string
  priceModifier?: number
  stock?: number
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  product: Product
  variants?: Record<string, any>
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
  images?: string[]
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  status: string
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  shippingAddress: any
  billingAddress: any
  paymentMethod: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  category?: string
  subcategory?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  search?: string
  sortBy?: 'name' | 'price' | 'rating' | 'created'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Commerce 서비스 클래스
class CommerceService {
  // 제품 관련
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<{ products: Product[]; total: number; page: number }>> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
    
    const queryString = queryParams.toString()
    return commerceApi.get(`/products${queryString ? `?${queryString}` : ''}`)
  }

  async getProduct(id: string): Promise<ApiResponse<{ product: Product }>> {
    return commerceApi.get(`/products/${id}`)
  }

  async getProductReviews(id: string): Promise<ApiResponse<{ reviews: Review[] }>> {
    return commerceApi.get(`/products/${id}/reviews`)
  }

  // 장바구니 관련
  async getCart(): Promise<ApiResponse<{ cart: Cart }>> {
    return commerceApi.get('/cart')
  }

  async addToCart(data: AddToCartInput): Promise<ApiResponse<{ cart: Cart }>> {
    return commerceApi.post('/cart/items', data)
  }

  async updateCartItem(itemId: string, data: UpdateCartItemInput): Promise<ApiResponse<{ cart: Cart }>> {
    return commerceApi.patch(`/cart/items/${itemId}`, data)
  }

  async removeCartItem(itemId: string): Promise<ApiResponse<{ cart: Cart }>> {
    return commerceApi.delete(`/cart/items/${itemId}`)
  }

  async clearCart(): Promise<ApiResponse<void>> {
    return commerceApi.delete('/cart')
  }

  async applyCoupon(data: CouponInput): Promise<ApiResponse<{ cart: Cart }>> {
    return commerceApi.post('/cart/coupon', data)
  }

  async removeCoupon(): Promise<ApiResponse<{ cart: Cart }>> {
    return commerceApi.delete('/cart/coupon')
  }

  // 주문 관련
  async createOrder(data: CreateOrderInput): Promise<ApiResponse<{ order: Order }>> {
    return commerceApi.post('/orders', data)
  }

  async getOrders(page = 1, limit = 10): Promise<ApiResponse<{ orders: Order[]; total: number; page: number }>> {
    return commerceApi.get(`/orders?page=${page}&limit=${limit}`)
  }

  async getOrder(id: string): Promise<ApiResponse<{ order: Order }>> {
    return commerceApi.get(`/orders/${id}`)
  }

  async cancelOrder(id: string, reason?: string): Promise<ApiResponse<{ order: Order }>> {
    return commerceApi.patch(`/orders/${id}`, { 
      status: 'CANCELLED',
      reason 
    })
  }

  // 위시리스트 관련 (향후 구현)
  async getWishlist(): Promise<ApiResponse<{ products: Product[] }>> {
    return commerceApi.get('/wishlist')
  }

  async addToWishlist(productId: string): Promise<ApiResponse<void>> {
    return commerceApi.post('/wishlist', { productId })
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<void>> {
    return commerceApi.delete(`/wishlist/${productId}`)
  }

  // 카테고리 관련
  async getCategories(): Promise<ApiResponse<{ categories: any[] }>> {
    return commerceApi.get('/categories')
  }

  // 검색 관련
  async searchProducts(query: string, filters: ProductFilters = {}): Promise<ApiResponse<{ products: Product[]; total: number }>> {
    return this.getProducts({ ...filters, search: query })
  }

  // 추천 상품
  async getRecommendedProducts(productId?: string, limit = 4): Promise<ApiResponse<{ products: Product[] }>> {
    const endpoint = productId 
      ? `/products/${productId}/recommendations?limit=${limit}`
      : `/products/recommended?limit=${limit}`
    
    return commerceApi.get(endpoint)
  }

  // 인기 상품
  async getFeaturedProducts(limit = 10): Promise<ApiResponse<{ products: Product[] }>> {
    return commerceApi.get(`/products/featured?limit=${limit}`)
  }

  // 최신 상품
  async getLatestProducts(limit = 10): Promise<ApiResponse<{ products: Product[] }>> {
    return commerceApi.get(`/products/latest?limit=${limit}`)
  }
}

// 싱글톤 인스턴스
export const commerceService = new CommerceService()