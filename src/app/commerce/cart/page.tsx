// 장바구니 페이지
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from '@/hooks/use-translations'
import { useSession } from 'next-auth/react'
import { useSecureSession } from '@/hooks/useSecureSession'
import { useToast } from '@/contexts/ToastContext'\nimport { useFormValidation } from '@/hooks/useFormValidation'\nimport { UpdateCartItemSchema, CouponSchema } from '@/lib/validation/commerce'

interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string[]
    stock: number
  }
  variants?: Record<string, any>
}

interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
}

export default function CartPage() {
  const t = useTranslations()
  const { data: session } = useSession()
  const { getSessionHeaders, isLoading: sessionLoading } = useSecureSession()
  const { showSuccess, showError, showWarning } = useToast()
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const { validate: validateCartUpdate } = useFormValidation(UpdateCartItemSchema)
  const { validate: validateCoupon } = useFormValidation(CouponSchema)

  useEffect(() => {
    if (!sessionLoading) {
      fetchCart()
    }
  }, [sessionLoading, fetchCart])

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/commerce/cart', {
        headers: getSessionHeaders(),
        credentials: 'include'
      })
      
      const data = await response.json()

      if (response.ok && data.cart) {
        setCart(data.cart)
      } else {
        setCart({
          id: '',
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }, [getSessionHeaders])

  const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    // 수량 검증
    const validationResult = validateCartUpdate({ quantity: newQuantity })
    if (!validationResult.success) {
      return // 오류는 useFormValidation에서 토스트로 표시됨
    }

    try {
      setUpdating(itemId)

      const response = await fetch(`/api/commerce/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: getSessionHeaders(),
        body: JSON.stringify({ quantity: newQuantity }),
        credentials: 'include'
      })

      if (response.ok) {
        await fetchCart()
      } else {
        const error = await response.json()
        showError('수량 변경 실패', error.message)
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
      showError('수량 변경 중 오류가 발생했습니다.')
    } finally {
      setUpdating(null)
    }
  }, [validateCartUpdate, getSessionHeaders, showError, fetchCart])

  const removeItem = useCallback(async (itemId: string) => {
    if (!confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) return

    try {
      setUpdating(itemId)

      const response = await fetch(`/api/commerce/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: getSessionHeaders(),
        credentials: 'include'
      })

      if (response.ok) {
        await fetchCart()
        showSuccess(t('commerce.message.removedFromCart'))
      } else {
        const error = await response.json()
        showError('삭제 실패', error.message)
      }
    } catch (error) {
      console.error('Failed to remove item:', error)
      showError('삭제 중 오류가 발생했습니다.')
    } finally {
      setUpdating(null)
    }
  }, [getSessionHeaders, fetchCart, showSuccess, showError, t])

  const clearCart = useCallback(async () => {
    if (!confirm('장바구니를 비우시겠습니까?')) return

    try {
      setLoading(true)

      const response = await fetch('/api/commerce/cart', {
        method: 'DELETE',
        headers: getSessionHeaders(),
        credentials: 'include'
      })

      if (response.ok) {
        setCart({
          id: '',
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0
        })
        showSuccess('장바구니가 비워졌습니다.')
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
      showError('장바구니 비우기 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [getSessionHeaders, showSuccess, showError])

  const applyCoupon = useCallback(async () => {
    // 쿠폰 코드 검증
    const validationResult = validateCoupon({ code: couponCode })
    if (!validationResult.success) {
      return // 오류는 useFormValidation에서 토스트로 표시됨
    }

    try {
      setApplyingCoupon(true)
      
      // 쿠폰 적용 API 호출 (실제 구현 필요)
      showSuccess(t('commerce.message.couponApplied'))
      
      // 장바구니 다시 가져오기
      await fetchCart()
      setCouponCode('')
    } catch (error) {
      console.error('Failed to apply coupon:', error)
      showError(t('commerce.message.invalidCoupon'))
    } finally {
      setApplyingCoupon(false)
    }
  }, [validateCoupon, couponCode, showSuccess, showError, fetchCart, t])

  const proceedToCheckout = useCallback(() => {
    if (!cart || cart.items.length === 0) {
      showWarning('장바구니가 비어있습니다.')
      return
    }

    // 로그인 확인
    if (!session) {
      if (confirm('결제를 위해 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push('/auth/signin?redirect=/commerce/checkout')
      }
      return
    }

    router.push('/commerce/checkout')
  }, [cart, showWarning, session, router])

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('commerce.cart.title')}</h1>
        
        <div className="text-center py-12">
          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v8m0-8l2.293 2.293c.63.63.184 1.707-.707 1.707H5M9 19a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          
          <p className="text-xl text-gray-600 mb-8">{t('commerce.cart.empty')}</p>
          
          <Link
            href="/commerce/products"
            className="inline-block px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {t('commerce.cart.continueShopping')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('commerce.cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 장바구니 아이템 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {/* 헤더 */}
            <div className="flex justify-between items-center p-4 border-b">
              <span className="text-gray-600">
                {cart.items.length}개 상품
              </span>
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                {t('commerce.cart.clear')}
              </button>
            </div>

            {/* 아이템 목록 */}
            <div className="divide-y">
              {cart.items.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex gap-4">
                    {/* 상품 이미지 */}
                    <Link
                      href={`/commerce/products/${item.productId}`}
                      className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      {item.product.images && item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </Link>

                    {/* 상품 정보 */}
                    <div className="flex-1">
                      <Link
                        href={`/commerce/products/${item.productId}`}
                        className="font-semibold hover:text-blue-600"
                      >
                        {item.product.name}
                      </Link>
                      
                      {/* 옵션 정보 */}
                      {item.variants && Object.entries(item.variants).length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          {Object.entries(item.variants).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 가격 */}
                      <div className="font-bold mt-2">
                        {formatPrice(item.product.price)}
                      </div>

                      {/* 재고 상태 */}
                      {item.product.stock <= 5 && item.product.stock > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          재고 {item.product.stock}개 남음
                        </p>
                      )}
                    </div>

                    {/* 수량 및 삭제 */}
                    <div className="flex flex-col items-end justify-between">
                      {/* 수량 조절 */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id || item.quantity <= 1}
                          className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          disabled={updating === item.id}
                          className="w-12 px-2 py-1 border rounded text-center"
                          min="1"
                          max={item.product.stock}
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id || item.quantity >= item.product.stock}
                          className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* 소계 */}
                      <div className="text-right">
                        <div className="font-bold">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updating === item.id}
                          className="text-red-500 hover:text-red-600 text-sm mt-2"
                        >
                          {t('commerce.cart.remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">주문 요약</h2>

            {/* 쿠폰 입력 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {t('commerce.cart.couponCode')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="쿠폰 코드 입력"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={applyCoupon}
                  disabled={applyingCoupon}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  {applyingCoupon ? '적용 중...' : '적용'}
                </button>
              </div>
            </div>

            {/* 금액 정보 */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('commerce.cart.subtotal')}</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('commerce.cart.discount')}</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t('commerce.cart.shipping')}</span>
                <span>
                  {cart.shipping === 0 ? t('commerce.cart.freeShipping') : formatPrice(cart.shipping)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t('commerce.cart.tax')}</span>
                <span>{formatPrice(cart.tax)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>{t('commerce.cart.total')}</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
              </div>
            </div>

            {/* 결제 버튼 */}
            <button
              onClick={proceedToCheckout}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
            >
              {t('commerce.cart.checkout')}
            </button>

            {/* 계속 쇼핑하기 */}
            <Link
              href="/commerce/products"
              className="block w-full text-center px-6 py-3 mt-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {t('commerce.cart.continueShopping')}
            </Link>

            {/* 안내 문구 */}
            <div className="mt-6 text-xs text-gray-500 space-y-1">
              <p>• 배송비는 주문 금액에 따라 결정됩니다</p>
              <p>• 50,000원 이상 구매시 무료배송</p>
              <p>• 결제 전 쿠폰 적용을 확인하세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}