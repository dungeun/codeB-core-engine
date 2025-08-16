// /api/commerce/orders - 주문 목록 조회 및 생성 API

import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/services/order.service'
import { 
  CreateOrderSchema,
  OrderQuerySchema
} from '@/lib/validations/product'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/commerce/orders - 주문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // 쿼리 파라미터 검증
    const validatedQuery = OrderQuerySchema.parse(queryParams)

    // 관리자가 아닌 경우 자신의 주문만 조회
    let userId: string | undefined
    let isAdmin = false

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, type: true }
      })

      if (user) {
        userId = user.id
        isAdmin = user.type === 'ADMIN'
      }
    }

    // 비로그인 사용자는 주문 목록을 조회할 수 없음
    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 필터 구성 (관리자가 아니면 자신의 주문만)
    const filters = isAdmin ? {} : { userId }

    // 주문 목록 조회
    const result = await OrderService.getOrders(filters, validatedQuery)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching orders:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: '잘못된 요청 파라미터입니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '주문 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/commerce/orders - 새 주문 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    // 입력 데이터 검증
    const validatedData = CreateOrderSchema.parse(body)

    // 로그인 사용자의 경우 userId 추가
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })

      if (user) {
        validatedData.userId = user.id
      }
    }

    // 주문 생성
    const order = await OrderService.createOrder(validatedData)

    // 주문 생성 후 장바구니 비우기 (로그인 사용자인 경우)
    if (validatedData.userId) {
      const { CartService } = await import('@/lib/services/cart.service')
      await CartService.clearCart(validatedData.userId)
    }

    return NextResponse.json(
      {
        order,
        message: '주문이 성공적으로 생성되었습니다.'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    
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
      { error: '주문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}