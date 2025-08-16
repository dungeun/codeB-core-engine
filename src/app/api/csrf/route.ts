// CSRF 토큰 API
import { NextResponse } from 'next/server'
import { CSRFProtection } from '@/lib/security/csrf'

// GET /api/csrf - CSRF 토큰 가져오기/생성
export async function GET() {
  try {
    // 기존 토큰 확인
    let token = await CSRFProtection.getServerToken()
    
    // 토큰이 없으면 새로 생성
    if (!token) {
      const newToken = await CSRFProtection.refreshToken()
      token = newToken.token
      
      const response = NextResponse.json({ 
        success: true,
        token 
      })
      
      // 쿠키 설정
      response.cookies.set(newToken.cookie)
      
      return response
    }
    
    return NextResponse.json({ 
      success: true,
      token 
    })
  } catch (error) {
    console.error('CSRF token error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}