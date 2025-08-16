// CSRF 보호 라이브러리
import crypto from 'crypto'
import { cookies } from 'next/headers'

const CSRF_TOKEN_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_LENGTH = 32

export class CSRFProtection {
  // CSRF 토큰 생성
  static generateToken(): string {
    return crypto.randomBytes(TOKEN_LENGTH).toString('hex')
  }

  // CSRF 토큰을 쿠키에 설정
  static setTokenCookie(token: string) {
    return {
      name: CSRF_TOKEN_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
    }
  }

  // 서버에서 CSRF 토큰 가져오기
  static async getServerToken(): Promise<string | null> {
    const cookieStore = cookies()
    return cookieStore.get(CSRF_TOKEN_NAME)?.value || null
  }

  // CSRF 토큰 검증
  static async verifyToken(request: Request): Promise<boolean> {
    // GET 요청은 CSRF 검증 스킵
    if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
      return true
    }

    // 쿠키에서 토큰 가져오기
    const cookieToken = await this.getServerToken()
    if (!cookieToken) {
      return false
    }

    // 헤더에서 토큰 가져오기
    const headerToken = request.headers.get(CSRF_HEADER_NAME)
    
    // Double Submit Cookie 패턴: 쿠키와 헤더의 토큰이 일치해야 함
    return cookieToken === headerToken
  }

  // 새 토큰 생성 및 쿠키 설정
  static async refreshToken() {
    const token = this.generateToken()
    return {
      token,
      cookie: this.setTokenCookie(token)
    }
  }
}

// 클라이언트용 CSRF 헬퍼
export class ClientCSRFHelper {
  // 쿠키에서 CSRF 토큰 가져오기
  static getTokenFromCookie(): string | null {
    if (typeof window === 'undefined') return null
    
    const name = CSRF_TOKEN_NAME + '='
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

  // API 요청에 CSRF 토큰 추가
  static addTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
    const token = this.getTokenFromCookie()
    if (token) {
      return {
        ...headers,
        [CSRF_HEADER_NAME]: token
      }
    }
    return headers
  }
}