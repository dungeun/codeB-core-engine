// Order Service - 주문 관련 비즈니스 로직

import { prisma } from '@/lib/prisma'
import { 
  CreateOrderInput, 
  UpdateOrderInput, 
  OrderFilterInput,
  OrderQueryInput
} from '@/lib/validations/product'
import { 
  OrderWithDetails, 
  OrderStats, 
  OrderStatus,
  AddressData
} from '@/types/commerce'
import { Prisma } from '@prisma/client'

export class OrderService {
  /**
   * 주문 목록 조회 (페이지네이션, 필터링, 정렬 지원)
   */
  static async getOrders(
    filters?: OrderFilterInput,
    query?: OrderQueryInput
  ) {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', status } = query || {}
    const skip = (page - 1) * limit

    // Where 조건 구성
    const where: Prisma.OrderWhereInput = {}

    if (filters?.userId) {
      where.userId = filters.userId
    }

    if (filters?.status || status) {
      where.status = filters?.status || status
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
      where.total = {}
      if (filters.minAmount !== undefined) {
        where.total.gte = filters.minAmount
      }
      if (filters.maxAmount !== undefined) {
        where.total.lte = filters.maxAmount
      }
    }

    // 데이터 조회
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    select: { url: true, alt: true },
                    orderBy: { position: 'asc' },
                    take: 1
                  }
                }
              }
            }
          },
          payment: {
            include: {
              refunds: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ])

    return {
      orders: orders as OrderWithDetails[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 주문 상세 조회
   */
  static async getOrderById(id: string): Promise<OrderWithDetails | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: { url: true, alt: true },
                  orderBy: { position: 'asc' },
                  take: 1
                }
              }
            }
          }
        },
        payment: {
          include: {
            refunds: true
          }
        }
      }
    })

    return order as OrderWithDetails | null
  }

  /**
   * 주문 번호로 주문 조회
   */
  static async getOrderByNumber(orderNumber: string): Promise<OrderWithDetails | null> {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: { url: true, alt: true },
                  orderBy: { position: 'asc' },
                  take: 1
                }
              }
            }
          }
        },
        payment: {
          include: {
            refunds: true
          }
        }
      }
    })

    return order as OrderWithDetails | null
  }

  /**
   * 새 주문 생성
   */
  static async createOrder(data: CreateOrderInput): Promise<OrderWithDetails> {
    return await prisma.$transaction(async (tx) => {
      // 주문 번호 생성
      const orderNumber = await this.generateOrderNumber()

      // 상품 재고 확인
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { 
            id: true, 
            name: true, 
            stock: true, 
            trackStock: true, 
            status: true 
          }
        })

        if (!product) {
          throw new Error(`상품을 찾을 수 없습니다: ${item.name}`)
        }

        if (product.status !== 'ACTIVE') {
          throw new Error(`판매 중이 아닌 상품입니다: ${product.name}`)
        }

        if (product.trackStock && product.stock < item.quantity) {
          throw new Error(`재고가 부족합니다: ${product.name} (재고: ${product.stock}개)`)
        }
      }

      // 주문 생성
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: data.userId,
          status: 'PENDING',
          subtotal: data.subtotal,
          tax: data.tax || 0,
          shipping: data.shipping || 0,
          discount: data.discount || 0,
          total: data.total,
          shippingAddress: data.shippingAddress as any,
          billingAddress: data.billingAddress as any,
          notes: data.notes,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              name: item.name,
              sku: item.sku,
              price: item.price,
              quantity: item.quantity,
              variant: item.variant || {}
            }))
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    select: { url: true, alt: true },
                    orderBy: { position: 'asc' },
                    take: 1
                  }
                }
              }
            }
          }
        }
      })

      // 재고 차감
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }

      return order as OrderWithDetails
    })
  }

  /**
   * 주문 상태 업데이트
   */
  static async updateOrder(data: UpdateOrderInput): Promise<OrderWithDetails> {
    const { id, ...updateData } = data

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: { url: true, alt: true },
                  orderBy: { position: 'asc' },
                  take: 1
                }
              }
            }
          }
        },
        payment: {
          include: {
            refunds: true
          }
        }
      }
    })

    return order as OrderWithDetails
  }

  /**
   * 주문 취소
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<OrderWithDetails> {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      })

      if (!order) {
        throw new Error('주문을 찾을 수 없습니다.')
      }

      if (!['PENDING', 'PAYMENT_PENDING', 'PAYMENT_FAILED'].includes(order.status)) {
        throw new Error('취소할 수 없는 주문 상태입니다.')
      }

      // 주문 상태 업데이트
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { 
          status: 'CANCELLED',
          notes: reason ? `취소 사유: ${reason}` : '주문 취소됨'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    select: { url: true, alt: true },
                    orderBy: { position: 'asc' },
                    take: 1
                  }
                }
              }
            }
          },
          payment: {
            include: {
              refunds: true
            }
          }
        }
      })

      // 재고 복원
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity }
          }
        })
      }

      return updatedOrder as OrderWithDetails
    })
  }

  /**
   * 주문 통계 조회
   */
  static async getOrderStats(): Promise<OrderStats> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      revenueStats,
      todayStats
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ 
        where: { 
          status: { in: ['PENDING', 'PAYMENT_PENDING', 'PROCESSING'] }
        }
      }),
      prisma.order.count({ 
        where: { 
          status: { in: ['DELIVERED', 'PAYMENT_COMPLETED'] }
        }
      }),
      prisma.order.count({ 
        where: { 
          status: { in: ['CANCELLED', 'REFUNDED'] }
        }
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        _avg: { total: true },
        where: {
          status: { notIn: ['CANCELLED', 'REFUNDED'] }
        }
      }),
      prisma.order.aggregate({
        _count: true,
        _sum: { total: true },
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          },
          status: { notIn: ['CANCELLED', 'REFUNDED'] }
        }
      })
    ])

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: revenueStats._sum.total || 0,
      averageOrderValue: Math.round(revenueStats._avg.total || 0),
      todayOrders: todayStats._count,
      todayRevenue: todayStats._sum.total || 0
    }
  }

  /**
   * 사용자의 주문 내역 조회
   */
  static async getUserOrders(
    userId: string,
    query?: Pick<OrderQueryInput, 'page' | 'limit' | 'status'>
  ) {
    const { page = 1, limit = 10, status } = query || {}
    const skip = (page - 1) * limit

    const where: Prisma.OrderWhereInput = { userId }
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    select: { url: true, alt: true },
                    orderBy: { position: 'asc' },
                    take: 1
                  }
                }
              }
            }
          },
          payment: {
            select: {
              status: true,
              method: true,
              paidAt: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ])

    return {
      orders: orders as OrderWithDetails[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 주문 번호 생성 (내부 헬퍼 메서드)
   */
  private static async generateOrderNumber(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    
    // 오늘 날짜의 주문 수 조회
    const todayStart = new Date(today)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const todayOrderCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    })

    const sequence = (todayOrderCount + 1).toString().padStart(4, '0')
    return `ORD${dateStr}${sequence}`
  }

  /**
   * 배송 정보 업데이트
   */
  static async updateShipping(
    orderId: string, 
    trackingNumber: string, 
    carrier: string
  ): Promise<OrderWithDetails> {
    return await this.updateOrder({
      id: orderId,
      status: 'SHIPPED',
      trackingNumber,
      carrier
    })
  }

  /**
   * 주문 완료 처리
   */
  static async completeOrder(orderId: string): Promise<OrderWithDetails> {
    return await this.updateOrder({
      id: orderId,
      status: 'DELIVERED'
    })
  }
}