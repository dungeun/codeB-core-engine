// 안전한 세션 관리 훅
'use client'

import { useState, useEffect } from 'react'
import { ClientSessionHelper } from '@/lib/session/session-manager'
import { ClientCSRFHelper } from '@/lib/security/csrf'

export function useSecureSession() {
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 쿠키에서 세션 토큰 가져오기
    const token = ClientSessionHelper.getSessionFromCookie()
    
    // CSRF 토큰 가져오기
    fetchCSRFToken()
    
    if (!token) {
      // localStorage에서 마이그레이션 시도
      const oldSessionId = ClientSessionHelper.migrateFromLocalStorage()
      
      if (oldSessionId) {
        // 서버에 마이그레이션 요청
        migrateSession(oldSessionId)
      } else {
        // 새 세션 생성 요청
        createNewSession()
      }
    } else {
      setSessionToken(token)
      setIsLoading(false)
    }
  }, [])

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/session/create', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSessionToken(data.token)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const migrateSession = async (oldSessionId: string) => {
    try {
      const response = await fetch('/api/session/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldSessionId }),
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSessionToken(data.token)
      } else {
        // 마이그레이션 실패 시 새 세션 생성
        createNewSession()
      }
    } catch (error) {
      console.error('Failed to migrate session:', error)
      createNewSession()
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCsrfToken(data.token)
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
    }
  }

  const getSessionHeaders = () => {
    // API 요청에 사용할 헤더 (쿠키는 자동으로 포함됨)
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    // CSRF 토큰 추가
    return ClientCSRFHelper.addTokenToHeaders(headers)
  }

  return {
    sessionToken,
    csrfToken,
    isLoading,
    getSessionHeaders
  }
}