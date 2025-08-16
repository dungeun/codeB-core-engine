// Admin API 서비스
'use client'

import { adminApi, ApiResponse } from './api-client'
import type { 
  ProductInput, 
  UpdateOrderStatusInput 
} from '@/lib/validation/commerce'

// Admin 전용 타입
export interface AdminStats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  totalProducts: number
  recentOrders: number
  monthlyGrowth: number
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  lastLogin?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}

export interface AdminOrder {
  id: string
  userId: string
  user: {
    name: string
    email: string
  }
  items: any[]
  status: string
  total: number
  createdAt: string
  updatedAt: string
  trackingNumber?: string
}

export interface AdminProduct {
  id: string
  name: string
  price: number
  stock: number
  category: string
  featured: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  createdAt: string
  updatedAt: string
  totalSales?: number
}

export interface AdminFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

// Admin 서비스 클래스
class AdminService {
  // 대시보드
  async getDashboardStats(): Promise<ApiResponse<AdminStats>> {
    return adminApi.get('/analytics')
  }

  async getRecentActivity(): Promise<ApiResponse<{ activities: any[] }>> {
    return adminApi.get('/analytics/recent-activity')
  }

  // 사용자 관리
  async getUsers(filters: AdminFilters = {}): Promise<ApiResponse<{ users: AdminUser[]; total: number; page: number }>> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
    
    const queryString = queryParams.toString()
    return adminApi.get(`/users${queryString ? `?${queryString}` : ''}`)
  }

  async getUser(id: string): Promise<ApiResponse<{ user: AdminUser }>> {
    return adminApi.get(`/users/${id}`)
  }

  async updateUser(id: string, data: Partial<AdminUser>): Promise<ApiResponse<{ user: AdminUser }>> {
    return adminApi.patch(`/users/${id}`, data)
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return adminApi.delete(`/users/${id}`)
  }

  async suspendUser(id: string, reason?: string): Promise<ApiResponse<{ user: AdminUser }>> {
    return adminApi.patch(`/users/${id}`, { 
      status: 'SUSPENDED',
      suspensionReason: reason 
    })
  }

  // 주문 관리
  async getOrders(filters: AdminFilters = {}): Promise<ApiResponse<{ orders: AdminOrder[]; total: number; page: number }>> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
    
    const queryString = queryParams.toString()
    return adminApi.get(`/orders${queryString ? `?${queryString}` : ''}`)
  }

  async getOrder(id: string): Promise<ApiResponse<{ order: AdminOrder }>> {
    return adminApi.get(`/orders/${id}`)
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusInput): Promise<ApiResponse<{ order: AdminOrder }>> {
    return adminApi.patch(`/orders/${id}`, data)
  }

  async cancelOrder(id: string, reason: string): Promise<ApiResponse<{ order: AdminOrder }>> {
    return adminApi.patch(`/orders/${id}`, { 
      status: 'CANCELLED',
      reason 
    })
  }

  async refundOrder(id: string, amount?: number, reason?: string): Promise<ApiResponse<{ order: AdminOrder }>> {
    return adminApi.post(`/orders/${id}/refund`, { 
      amount,
      reason 
    })
  }

  // 제품 관리
  async getProducts(filters: AdminFilters = {}): Promise<ApiResponse<{ products: AdminProduct[]; total: number; page: number }>> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
    
    const queryString = queryParams.toString()
    return adminApi.get(`/products${queryString ? `?${queryString}` : ''}`)
  }

  async getProduct(id: string): Promise<ApiResponse<{ product: AdminProduct }>> {
    return adminApi.get(`/products/${id}`)
  }

  async createProduct(data: ProductInput): Promise<ApiResponse<{ product: AdminProduct }>> {
    return adminApi.post('/products', data)
  }

  async updateProduct(id: string, data: Partial<ProductInput>): Promise<ApiResponse<{ product: AdminProduct }>> {
    return adminApi.patch(`/products/${id}`, data)
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return adminApi.delete(`/products/${id}`)
  }

  async updateProductStock(id: string, stock: number): Promise<ApiResponse<{ product: AdminProduct }>> {
    return adminApi.patch(`/products/${id}`, { stock })
  }

  async bulkUpdateProducts(productIds: string[], updates: Partial<ProductInput>): Promise<ApiResponse<{ updated: number }>> {
    return adminApi.patch('/products/bulk', { 
      productIds, 
      updates 
    })
  }

  // 카테고리 관리
  async getCategories(): Promise<ApiResponse<{ categories: any[] }>> {
    return adminApi.get('/categories')
  }

  async createCategory(data: { name: string; description?: string; parentId?: string }): Promise<ApiResponse<{ category: any }>> {
    return adminApi.post('/categories', data)
  }

  async updateCategory(id: string, data: { name?: string; description?: string }): Promise<ApiResponse<{ category: any }>> {
    return adminApi.patch(`/categories/${id}`, data)
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return adminApi.delete(`/categories/${id}`)
  }

  // 분석 및 리포트
  async getSalesReport(dateFrom: string, dateTo: string): Promise<ApiResponse<{ report: any }>> {
    return adminApi.get(`/analytics/sales?from=${dateFrom}&to=${dateTo}`)
  }

  async getProductAnalytics(productId: string): Promise<ApiResponse<{ analytics: any }>> {
    return adminApi.get(`/analytics/products/${productId}`)
  }

  async getUserAnalytics(): Promise<ApiResponse<{ analytics: any }>> {
    return adminApi.get('/analytics/users')
  }

  // 설정
  async getSettings(): Promise<ApiResponse<{ settings: any }>> {
    return adminApi.get('/settings')
  }

  async updateSettings(data: any): Promise<ApiResponse<{ settings: any }>> {
    return adminApi.patch('/settings', data)
  }

  // 알림 관리
  async getNotifications(): Promise<ApiResponse<{ notifications: any[] }>> {
    return adminApi.get('/notifications')
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return adminApi.patch(`/notifications/${id}`, { read: true })
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return adminApi.patch('/notifications/mark-all-read')
  }

  // 시스템 로그
  async getSystemLogs(filters: AdminFilters = {}): Promise<ApiResponse<{ logs: any[]; total: number }>> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
    
    const queryString = queryParams.toString()
    return adminApi.get(`/logs${queryString ? `?${queryString}` : ''}`)
  }
}

// 싱글톤 인스턴스
export const adminService = new AdminService()