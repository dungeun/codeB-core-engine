// 세션 마이그레이션 API (localStorage → httpOnly 쿠키)
import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/session/session-manager'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { oldSessionId } = await request.json()
    
    if (!oldSessionId) {
      return NextResponse.json(
        { error: 'Old session ID required' },
        { status: 400 }
      )
    }
    
    // 기존 세션 데이터 찾기 (카트 등)
    const existingCart = await prisma.cart.findFirst({
      where: {
        sessionId: oldSessionId,
        userId: null // 게스트 카트
      }
    })
    
    // 새 세션 생성
    const token = await SessionManager.createSession()
    const sessionData = await SessionManager.validateSession(token)
    
    if (!sessionData) {
      throw new Error('Failed to create valid session')
    }
    
    // 기존 카트가 있다면 새 세션 ID로 업데이트
    if (existingCart) {
      await prisma.cart.update({
        where: { id: existingCart.id },
        data: { sessionId: sessionData.id }
      })
    }
    
    // 쿠키 설정
    const cookieOptions = SessionManager.setSessionCookie(token)
    
    const response = NextResponse.json({ 
      success: true,
      token,
      migrated: !!existingCart
    })
    
    // 쿠키 설정
    response.cookies.set(cookieOptions)
    
    return response
  } catch (error) {
    console.error('Session migration error:', error)
    return NextResponse.json(
      { error: 'Failed to migrate session' },
      { status: 500 }
    )
  }
}