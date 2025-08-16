// /api/commerce/orders/[id]/cancel - 주문 취소 API

import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/services/order.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/commerce/orders/[id]/cancel - 주문 취소
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const orderId = params.id
    const body = await request.json()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 주문 조회
    const order = await OrderService.getOrderById(orderId)
    
    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 (주문 소유자 또는 관리자만 취소 가능)
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

    // 주문 상태 확인 (취소 가능한 상태인지)
    const cancellableStatuses = ['PENDING', 'PAYMENT_PENDING', 'PAYMENT_FAILED', 'PROCESSING']
    
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `${order.status} 상태의 주문은 취소할 수 없습니다. 고객센터에 문의하세요.` },
        { status: 400 }
      )
    }

    // 사용자가 취소하는 경우 PROCESSING 상태는 취소 불가
    if (!isAdmin && order.status === 'PROCESSING') {
      return NextResponse.json(
        { error: '처리 중인 주문은 고객센터를 통해서만 취소할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 취소 사유
    const reason = body.reason || (isAdmin ? '관리자 취소' : '고객 요청')

    // 주문 취소 처리
    const cancelledOrder = await OrderService.cancelOrder(orderId, reason)

    return NextResponse.json({
      order: cancelledOrder,
      message: '주문이 취소되었습니다.'
    })
  } catch (error) {
    console.error('Error cancelling order:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('취소할 수 없는')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: '주문 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}