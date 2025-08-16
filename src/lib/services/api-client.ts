// API 클라이언트 베이스 클래스
'use client'

import { SessionManager } from '@/lib/session/session-manager'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface RequestOptions {
  headers?: Record<string, string>
  includeAuth?: boolean
  includeCSRF?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  private async getHeaders(options: RequestOptions = {}): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // 인증 토큰 포함
    if (options.includeAuth !== false) {
      const token = await SessionManager.getSessionToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    // CSRF 토큰 포함
    if (options.includeCSRF !== false) {
      const csrfToken = await SessionManager.getCSRFToken()
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json()
      
      if (response.ok) {
        return {
          success: true,
          data,
          message: data.message
        }
      } else {
        return {
          success: false,
          error: data.message || data.error || 'API 요청 실패',
          message: data.message
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders(options)
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  async post<T, D = any>(endpoint: string, data?: D, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders(options)
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  async put<T, D = any>(endpoint: string, data?: D, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders(options)
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  async patch<T, D = any>(endpoint: string, data?: D, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders(options)
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders(options)
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient()

// 특정 API 영역별 클라이언트
export const commerceApi = new ApiClient('/api/commerce')
export const adminApi = new ApiClient('/api/admin')
export const authApi = new ApiClient('/api/auth')