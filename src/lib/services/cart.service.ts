// Cart Service - 장바구니 관련 비즈니스 로직

import { prisma } from '@/lib/prisma'
import { 
  AddToCartInput, 
  UpdateCartItemInput, 
  RemoveFromCartInput 
} from '@/lib/validations/product'
import { CartWithDetails, CartSummary } from '@/types/commerce'
import { Prisma } from '@prisma/client'

export class CartService {
  /**
   * 사용자 장바구니 조회 (로그인 사용자)
   */
  static async getUserCart(userId: string): Promise<CartWithDetails | null> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { position: 'asc' },
                  take: 1
                },
                category: true
              }
            }
          }
        }
      }
    })

    if (!cart) return null

    return this.calculateCartTotals(cart)
  }

  /**
   * 세션 장바구니 조회 (비로그인 사용자)
   */
  static async getSessionCart(sessionId: string): Promise<CartWithDetails | null> {
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { position: 'asc' },
                  take: 1
                },
                category: true
              }
            }
          }
        }
      }
    })

    if (!cart) return null

    return this.calculateCartTotals(cart)
  }

  /**
   * 장바구니에 상품 추가
   */
  static async addToCart(
    data: AddToCartInput, 
    userId?: string, 
    sessionId?: string
  ): Promise<CartWithDetails> {
    const { productId, quantity, variant } = data

    // 상품 존재 여부 확인
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        id: true, 
        name: true, 
        price: true, 
        stock: true, 
        trackStock: true,
        status: true
      }
    })

    if (!product) {
      throw new Error('상품을 찾을 수 없습니다.')
    }

    if (product.status !== 'ACTIVE') {
      throw new Error('판매 중이 아닌 상품입니다.')
    }

    // 재고 확인
    if (product.trackStock && product.stock < quantity) {
      throw new Error('재고가 부족합니다.')
    }

    return await prisma.$transaction(async (tx) => {
      // 장바구니 찾기 또는 생성
      let cart = await tx.cart.findFirst({
        where: userId ? { userId } : { sessionId }
      })

      if (!cart) {
        cart = await tx.cart.create({
          data: userId ? { userId } : { sessionId: sessionId! }
        })
      }

      // 기존 장바구니 아이템 확인
      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId
          }
        }
      })

      if (existingItem) {
        // 기존 아이템 수량 업데이트
        const newQuantity = existingItem.quantity + quantity
        
        // 재고 재확인
        if (product.trackStock && product.stock < newQuantity) {
          throw new Error('요청한 수량만큼 재고가 부족합니다.')
        }

        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { 
            quantity: newQuantity,
            variant: variant || existingItem.variant
          }
        })
      } else {
        // 새 아이템 추가
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            variant: variant || {}
          }
        })
      }

      // 업데이트된 장바구니 조회
      const updatedCart = await tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { position: 'asc' },
                    take: 1
                  },
                  category: true
                }
              }
            }
          }
        }
      })

      return this.calculateCartTotals(updatedCart!)
    })
  }

  /**
   * 장바구니 아이템 수량 수정
   */
  static async updateCartItem(data: UpdateCartItemInput): Promise<CartWithDetails> {
    const { cartItemId, quantity, variant } = data

    return await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          product: {
            select: { stock: true, trackStock: true }
          },
          cart: true
        }
      })

      if (!cartItem) {
        throw new Error('장바구니 아이템을 찾을 수 없습니다.')
      }

      // 재고 확인
      if (cartItem.product.trackStock && cartItem.product.stock < quantity) {
        throw new Error('재고가 부족합니다.')
      }

      await tx.cartItem.update({
        where: { id: cartItemId },
        data: { 
          quantity,
          variant: variant || cartItem.variant
        }
      })

      // 업데이트된 장바구니 조회
      const updatedCart = await tx.cart.findUnique({
        where: { id: cartItem.cartId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { position: 'asc' },
                    take: 1
                  },
                  category: true
                }
              }
            }
          }
        }
      })

      return this.calculateCartTotals(updatedCart!)
    })
  }

  /**
   * 장바구니에서 상품 제거
   */
  static async removeFromCart(
    data: RemoveFromCartInput, 
    userId?: string, 
    sessionId?: string
  ): Promise<CartWithDetails | null> {
    const { productId } = data

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId }
    })

    if (!cart) {
      throw new Error('장바구니를 찾을 수 없습니다.')
    }

    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    })

    // 업데이트된 장바구니 조회
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { position: 'asc' },
                  take: 1
                },
                category: true
              }
            }
          }
        }
      }
    })

    return updatedCart ? this.calculateCartTotals(updatedCart) : null
  }

  /**
   * 장바구니 비우기
   */
  static async clearCart(userId?: string, sessionId?: string): Promise<void> {
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId }
    })

    if (!cart) return

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })
  }

  /**
   * 세션 장바구니를 사용자 장바구니로 병합
   */
  static async mergeSessionCartToUser(sessionId: string, userId: string): Promise<CartWithDetails | null> {
    return await prisma.$transaction(async (tx) => {
      // 세션 장바구니 조회
      const sessionCart = await tx.cart.findUnique({
        where: { sessionId },
        include: { items: true }
      })

      if (!sessionCart || sessionCart.items.length === 0) {
        return null
      }

      // 사용자 장바구니 찾기 또는 생성
      let userCart = await tx.cart.findUnique({
        where: { userId }
      })

      if (!userCart) {
        userCart = await tx.cart.create({
          data: { userId }
        })
      }

      // 세션 장바구니 아이템들을 사용자 장바구니로 병합
      for (const item of sessionCart.items) {
        const existingItem = await tx.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId: userCart.id,
              productId: item.productId
            }
          }
        })

        if (existingItem) {
          // 기존 아이템 수량 합계
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity }
          })
        } else {
          // 새 아이템 추가
          await tx.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              quantity: item.quantity,
              variant: item.variant
            }
          })
        }
      }

      // 세션 장바구니 삭제
      await tx.cart.delete({
        where: { id: sessionCart.id }
      })

      // 병합된 장바구니 조회
      const mergedCart = await tx.cart.findUnique({
        where: { id: userCart.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { position: 'asc' },
                    take: 1
                  },
                  category: true
                }
              }
            }
          }
        }
      })

      return this.calculateCartTotals(mergedCart!)
    })
  }

  /**
   * 장바구니 요약 정보 계산
   */
  static calculateCartSummary(cart: CartWithDetails): CartSummary {
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    
    // 간단한 세금 계산 (10%)
    const tax = Math.round(subtotal * 0.1)
    
    // 배송비 계산 (5만원 이상 무료배송)
    const shipping = subtotal >= 50000 ? 0 : 3000
    
    const total = subtotal + tax + shipping

    return {
      itemCount,
      subtotal,
      tax,
      shipping,
      total
    }
  }

  /**
   * 장바구니 총계 계산 (내부 헬퍼 메서드)
   */
  private static calculateCartTotals(cart: any): CartWithDetails {
    const itemCount = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const totalAmount = cart.items.reduce((sum: number, item: any) => 
      sum + (item.product.price * item.quantity), 0
    )

    return {
      ...cart,
      itemCount,
      totalAmount
    }
  }

  /**
   * 장바구니 아이템 수 조회
   */
  static async getCartItemCount(userId?: string, sessionId?: string): Promise<number> {
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          select: { quantity: true }
        }
      }
    })

    if (!cart) return 0

    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }
}