// /api/commerce/orders/[id] - 주문 상세 조회 및 수정 API

import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/services/order.service'
import { UpdateOrderSchema } from '@/lib/validations/product'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/commerce/orders/[id] - 주문 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const orderId = params.id

    // 주문 조회
    const order = await OrderService.getOrderById(orderId)

    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 (주문 소유자 또는 관리자만 조회 가능)
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, type: true }
      })

      const isOwner = user?.id === order.userId
      const isAdmin = user?.type === 'ADMIN'

      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: '권한이 없습니다.' },
          { status: 403 }
        )
      }
    } else {
      // 비로그인 사용자는 주문 조회 불가
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: '주문을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/commerce/orders/[id] - 주문 수정 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const orderId = params.id
    const body = await request.json()

    // 관리자 권한 확인
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { type: true }
    })

    if (user?.type !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 입력 데이터 검증
    const validatedData = UpdateOrderSchema.parse({
      id: orderId,
      ...body
    })

    // 주문 업데이트
    const updatedOrder = await OrderService.updateOrder(validatedData)

    return NextResponse.json({
      order: updatedOrder,
      message: '주문이 수정되었습니다.'
    })
  } catch (error) {
    console.error('Error updating order:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: '입력 데이터가 올바르지 않습니다.', details: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: '주문 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}