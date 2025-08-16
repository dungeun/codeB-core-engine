// /api/commerce/cart - 장바구니 조회 및 전체 관리 API

import { NextRequest, NextResponse } from 'next/server'
import { CartService } from '@/lib/services/cart.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionManager } from '@/lib/session/session-manager'

// GET /api/commerce/cart - 장바구니 조회 (로그인/비로그인 사용자 지원)
export async function GET(request: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions)
    
    // 먼저 secure session에서 session ID 가져오기
    const sessionData = await SessionManager.getServerSession()
    let sessionId = sessionData?.id
    
    // fallback으로 기존 방식도 지원 (마이그레이션 중)
    if (!sessionId) {
      sessionId = request.headers.get('x-session-id') || request.cookies.get('session_id')?.value || null
    }

    let cart = null

    if (authSession?.user?.email) {
      // 로그인 사용자: userId로 장바구니 조회
      const user = await prisma.user.findUnique({
        where: { email: authSession.user.email },
        select: { id: true }
      })

      if (user) {
        cart = await CartService.getUserCart(user.id)
      }
    } else if (sessionId) {
      // 비로그인 사용자: sessionId로 장바구니 조회
      cart = await CartService.getSessionCart(sessionId)
    }

    // 장바구니가 없으면 빈 장바구니 구조 반환
    if (!cart) {
      return NextResponse.json({
        cart: {
          id: null,
          items: [],
          itemCount: 0,
          totalAmount: 0
        },
        summary: {
          itemCount: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0
        }
      })
    }

    // 장바구니 요약 정보 계산
    const summary = CartService.calculateCartSummary(cart)

    return NextResponse.json({
      cart,
      summary
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: '장바구니를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/commerce/cart - 장바구니 비우기
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionId = request.headers.get('x-session-id') || request.cookies.get('session_id')?.value

    if (session?.user?.email) {
      // 로그인 사용자
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })

      if (user) {
        await CartService.clearCart(user.id)
      }
    } else if (sessionId) {
      // 비로그인 사용자
      await CartService.clearCart(undefined, sessionId)
    } else {
      return NextResponse.json(
        { error: '세션 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: '장바구니가 비워졌습니다.' })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: '장바구니를 비우는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}