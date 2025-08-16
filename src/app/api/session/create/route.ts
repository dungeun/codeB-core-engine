// 세션 생성 API
import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/session/session-manager'

export async function POST(request: NextRequest) {
  try {
    // 새 세션 생성
    const token = await SessionManager.createSession()
    
    // 쿠키 설정
    const cookieOptions = SessionManager.setSessionCookie(token)
    
    const response = NextResponse.json({ 
      success: true,
      token 
    })
    
    // 쿠키 설정
    response.cookies.set(cookieOptions)
    
    return response
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}