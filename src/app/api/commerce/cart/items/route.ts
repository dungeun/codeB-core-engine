// /api/commerce/cart/items - 장바구니 아이템 추가/제거 API

import { NextRequest, NextResponse } from 'next/server'
import { CartService } from '@/lib/services/cart.service'
import { 
  AddToCartSchema, 
  RemoveFromCartSchema 
} from '@/lib/validations/product'
// SessionManager를 통한 인증 처리

import { prisma } from '@/lib/prisma'

// POST /api/commerce/cart/items - 장바구니에 상품 추가
export async function POST(request: NextRequest) {
  try {
    const session = await SessionManager.getServerSession()
    const sessionId = request.headers.get('x-session-id') || request.cookies.get('session_id')?.value
    const body = await request.json()

    // 입력 데이터 검증
    const validatedData = AddToCartSchema.parse(body)

    let userId: string | undefined
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      userId = user?.id
    }

    // 로그인 사용자도 아니고 세션 ID도 없으면 에러
    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: '세션 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 장바구니에 상품 추가
    const cart = await CartService.addToCart(validatedData, userId, sessionId)

    // 장바구니 요약 정보 계산
    const summary = CartService.calculateCartSummary(cart)

    return NextResponse.json({
      cart,
      summary,
      message: '상품이 장바구니에 추가되었습니다.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding item to cart:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('validation') || error.message.includes('required')) {
        return NextResponse.json(
          { error: '입력 데이터가 올바르지 않습니다.', details: error.message },
          { status: 400 }
        )
      }
      
      if (error.message.includes('재고') || error.message.includes('stock')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }
      
      if (error.message.includes('상품을 찾을 수 없습니다') || error.message.includes('판매 중이 아닌')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: '장바구니에 상품을 추가하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/commerce/cart/items - 장바구니에서 상품 제거
export async function DELETE(request: NextRequest) {
  try {
    const session = await SessionManager.getServerSession()
    const sessionId = request.headers.get('x-session-id') || request.cookies.get('session_id')?.value
    const body = await request.json()

    // 입력 데이터 검증
    const validatedData = RemoveFromCartSchema.parse(body)

    let userId: string | undefined
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      userId = user?.id
    }

    // 로그인 사용자도 아니고 세션 ID도 없으면 에러
    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: '세션 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 장바구니에서 상품 제거
    const cart = await CartService.removeFromCart(validatedData, userId, sessionId)

    // 장바구니 요약 정보 계산 (장바구니가 있는 경우만)
    const summary = cart ? CartService.calculateCartSummary(cart) : {
      itemCount: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0
    }

    return NextResponse.json({
      cart,
      summary,
      message: '상품이 장바구니에서 제거되었습니다.'
    })
  } catch (error) {
    console.error('Error removing item from cart:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('validation') || error.message.includes('required')) {
        return NextResponse.json(
          { error: '입력 데이터가 올바르지 않습니다.', details: error.message },
          { status: 400 }
        )
      }
      
      if (error.message.includes('장바구니를 찾을 수 없습니다')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: '장바구니에서 상품을 제거하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}