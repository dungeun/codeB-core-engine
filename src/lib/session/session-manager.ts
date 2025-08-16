// 안전한 세션 관리자
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production'
const SESSION_COOKIE_NAME = 'session_token'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface SessionData {
  id: string
  userId?: string
  cartId?: string
  createdAt: Date
  expiresAt: Date
}

export class SessionManager {
  // 세션 생성
  static async createSession(userId?: string): Promise<string> {
    const sessionId = uuidv4()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE * 1000)

    const sessionData: SessionData = {
      id: sessionId,
      userId,
      createdAt: now,
      expiresAt
    }

    // JWT로 세션 데이터 암호화
    const token = jwt.sign(sessionData, SESSION_SECRET, {
      expiresIn: SESSION_MAX_AGE
    })

    return token
  }

  // 세션 검증
  static async validateSession(token: string): Promise<SessionData | null> {
    try {
      const decoded = jwt.verify(token, SESSION_SECRET) as SessionData
      
      // 만료 시간 확인
      if (new Date(decoded.expiresAt) < new Date()) {
        return null
      }

      return decoded
    } catch (error) {
      console.error('Session validation error:', error)
      return null
    }
  }

  // 쿠키에서 세션 가져오기 (서버 컴포넌트용)
  static async getServerSession(): Promise<SessionData | null> {
    const cookieStore = cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    return await this.validateSession(token)
  }

  // 세션 쿠키 설정 (서버 액션용)
  static setSessionCookie(token: string) {
    return {
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: SESSION_MAX_AGE,
      path: '/'
    }
  }

  // 세션 삭제 쿠키 설정
  static deleteSessionCookie() {
    return {
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0,
      path: '/'
    }
  }

  // 클라이언트용 세션 토큰 가져오기
  static async getSessionToken(): Promise<string | null> {
    return ClientSessionHelper.getSessionFromCookie()
  }

  // 클라이언트용 CSRF 토큰 가져오기  
  static async getCSRFToken(): Promise<string | null> {
    return ClientSessionHelper.getCSRFFromCookie()
  }
}

// 클라이언트용 세션 헬퍼
export class ClientSessionHelper {
  // 세션 ID 가져오기 (클라이언트 컴포넌트용 - 쿠키에서 읽기)
  static getSessionFromCookie(): string | null {
    if (typeof window === 'undefined') return null
    
    const name = SESSION_COOKIE_NAME + '='
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return null
  }

  // localStorage 마이그레이션 헬퍼
  static migrateFromLocalStorage(): string | null {
    if (typeof window === 'undefined') return null
    
    const oldSessionId = localStorage.getItem('session_id')
    if (oldSessionId) {
      // 기존 localStorage 세션 ID 제거
      localStorage.removeItem('session_id')
      return oldSessionId
    }
    return null
  }

  // CSRF 토큰 가져오기
  static getCSRFFromCookie(): string | null {
    if (typeof window === 'undefined') return null
    
    const name = 'csrf_token='
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return null
  }
}

