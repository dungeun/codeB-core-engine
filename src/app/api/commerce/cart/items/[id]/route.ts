// /api/commerce/cart/items/[id] - 장바구니 아이템 수정/삭제 API

import { NextRequest, NextResponse } from 'next/server'
import { CartService } from '@/lib/services/cart.service'
import { UpdateCartItemSchema } from '@/lib/validations/product'
// SessionManager를 통한 인증 처리

import { prisma } from '@/lib/prisma'

// PATCH /api/commerce/cart/items/[id] - 장바구니 아이템 수량 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await SessionManager.getServerSession()
    const body = await request.json()
    const cartItemId = params.id

    // 입력 데이터 검증
    const validatedData = UpdateCartItemSchema.parse({
      cartItemId,
      ...body
    })

    // 장바구니 아이템 소유권 확인 (보안)
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: {
          select: {
            userId: true,
            sessionId: true
          }
        }
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: '장바구니 아이템을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인
    let hasPermission = false
    
    if (session?.user?.email) {
      // 로그인 사용자: userId 확인
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      
      if (user && cartItem.cart.userId === user.id) {
        hasPermission = true
      }
    } else {
      // 비로그인 사용자: sessionId 확인
      const sessionId = request.headers.get('x-session-id') || request.cookies.get('session_id')?.value
      
      if (sessionId && cartItem.cart.sessionId === sessionId) {
        hasPermission = true
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 장바구니 아이템 수정
    const cart = await CartService.updateCartItem(validatedData)

    // 장바구니 요약 정보 계산
    const summary = CartService.calculateCartSummary(cart)

    return NextResponse.json({
      cart,
      summary,
      message: '장바구니 아이템이 수정되었습니다.'
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    
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
      
      if (error.message.includes('장바구니 아이템을 찾을 수 없습니다')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: '장바구니 아이템을 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/commerce/cart/items/[id] - 장바구니 아이템 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await SessionManager.getServerSession()
    const cartItemId = params.id

    // 장바구니 아이템 조회 및 소유권 확인
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: {
          select: {
            userId: true,
            sessionId: true
          }
        },
        product: {
          select: {
            id: true
          }
        }
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: '장바구니 아이템을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인
    let hasPermission = false
    let userId: string | undefined
    let sessionId: string | undefined
    
    if (session?.user?.email) {
      // 로그인 사용자: userId 확인
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      
      if (user && cartItem.cart.userId === user.id) {
        hasPermission = true
        userId = user.id
      }
    } else {
      // 비로그인 사용자: sessionId 확인
      sessionId = request.headers.get('x-session-id') || request.cookies.get('session_id')?.value
      
      if (sessionId && cartItem.cart.sessionId === sessionId) {
        hasPermission = true
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 장바구니에서 아이템 제거
    const cart = await CartService.removeFromCart(
      { productId: cartItem.product.id },
      userId,
      sessionId
    )

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
      message: '장바구니 아이템이 삭제되었습니다.'
    })
  } catch (error) {
    console.error('Error deleting cart item:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('장바구니를 찾을 수 없습니다')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: '장바구니 아이템을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}