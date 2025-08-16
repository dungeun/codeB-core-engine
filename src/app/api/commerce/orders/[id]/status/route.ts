// /api/commerce/orders/[id]/status - 주문 상태 변경 API

import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/services/order.service'
import { OrderStatusSchema } from '@/lib/validations/product'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/commerce/orders/[id]/status - 주문 상태 변경 (관리자 전용)
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

    // 상태 검증
    const validatedStatus = OrderStatusSchema.parse(body.status)

    // 주문 존재 확인
    const order = await OrderService.getOrderById(orderId)
    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 상태 변경 로직
    let updatedOrder
    
    switch (validatedStatus) {
      case 'SHIPPED':
        // 배송 시작 처리
        if (!body.trackingNumber || !body.carrier) {
          return NextResponse.json(
            { error: '배송 정보(운송장 번호, 택배사)가 필요합니다.' },
            { status: 400 }
          )
        }
        updatedOrder = await OrderService.updateShipping(
          orderId, 
          body.trackingNumber, 
          body.carrier
        )
        break
        
      case 'DELIVERED':
        // 배송 완료 처리
        updatedOrder = await OrderService.completeOrder(orderId)
        break
        
      default:
        // 기타 상태 변경
        updatedOrder = await OrderService.updateOrder({
          id: orderId,
          status: validatedStatus,
          notes: body.notes
        })
    }

    return NextResponse.json({
      order: updatedOrder,
      message: `주문 상태가 ${validatedStatus}로 변경되었습니다.`
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: '잘못된 상태 값입니다.', details: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: '주문 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}