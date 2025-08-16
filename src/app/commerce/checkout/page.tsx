// 주문/결제 페이지
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from '@/hooks/use-translations'
import { useSecureSession } from '@/hooks/useSecureSession'
import { useToast } from '@/contexts/ToastContext'
import Image from 'next/image'

interface CheckoutForm {
  // 배송 정보
  shippingAddress: {
    fullName: string
    phone: string
    email: string
    address1: string
    address2: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  // 청구 정보
  billingAddress: {
    sameAsShipping: boolean
    fullName: string
    phone: string
    email: string
    address1: string
    address2: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  // 결제 정보
  paymentMethod: 'credit_card' | 'bank_transfer' | 'toss_pay' | 'kakao_pay' | 'naver_pay'
  cardDetails?: {
    number: string
    name: string
    expiry: string
    cvv: string
  }
  // 추가 정보
  orderNotes: string
  agreeToTerms: boolean
}

interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string[]
  }
}

export default function CheckoutPage() {
  const t = useTranslations()
  const { data: session } = useSession()
  const { getSessionHeaders, isLoading: sessionLoading } = useSecureSession()
  const { showSuccess, showError, showWarning } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: 배송, 2: 결제, 3: 확인
  const [cart, setCart] = useState<any>(null)
  const [formData, setFormData] = useState<CheckoutForm>({
    shippingAddress: {
      fullName: '',
      phone: '',
      email: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'KR'
    },
    billingAddress: {
      sameAsShipping: true,
      fullName: '',
      phone: '',
      email: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'KR'
    },
    paymentMethod: 'credit_card',
    orderNotes: '',
    agreeToTerms: false
  })

  useEffect(() => {
    // 로그인 확인
    if (!session) {
      router.push('/auth/signin?redirect=/commerce/checkout')
      return
    }

    if (!sessionLoading) {
      fetchCart()
      loadUserInfo()
    }
  }, [session, sessionLoading])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/commerce/cart', { 
        headers: getSessionHeaders(),
        credentials: 'include'
      })
      const data = await response.json()

      if (response.ok && data.cart && data.cart.items.length > 0) {
        setCart(data.cart)
      } else {
        // 장바구니가 비어있으면 장바구니 페이지로
        router.push('/commerce/cart')
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserInfo = async () => {
    // 사용자 정보 불러오기 (저장된 주소 등)
    if (session?.user?.email) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          email: session.user.email || '',
          fullName: session.user.name || ''
        }
      }))
    }
  }

  const handleInputChange = (section: 'shippingAddress' | 'billingAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const validateStep = (step: number) => {
    if (step === 1) {
      // 배송 정보 검증
      const { shippingAddress } = formData
      if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.email ||
          !shippingAddress.address1 || !shippingAddress.city || !shippingAddress.postalCode) {
        showWarning('배송 정보를 모두 입력해주세요.')
        return false
      }
    } else if (step === 2) {
      // 결제 정보 검증
      if (formData.paymentMethod === 'credit_card' && formData.cardDetails) {
        const { cardDetails } = formData
        if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
          showWarning('카드 정보를 모두 입력해주세요.')
          return false
        }
      }
    } else if (step === 3) {
      // 약관 동의 검증
      if (!formData.agreeToTerms) {
        showWarning('이용약관에 동의해주세요.')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(3, prev + 1))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  const placeOrder = async () => {
    if (!validateStep(3)) return

    try {
      setProcessing(true)

      // 주문 생성 API 호출
      const orderData = {
        items: cart.items.map((item: CartItem) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress.sameAsShipping 
          ? formData.shippingAddress 
          : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        orderNotes: formData.orderNotes,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        total: cart.total
      }

      const response = await fetch('/api/commerce/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (response.ok) {
        // 장바구니 비우기
        await fetch('/api/commerce/cart', {
          method: 'DELETE',
          headers: getSessionHeaders(),
          credentials: 'include'
        })

        // 주문 완료 페이지로 이동
        router.push(`/commerce/orders/${data.order.id}/success`)
      } else {
        showError('주문 처리 중 오류가 발생했습니다.', data.message)
      }
    } catch (error) {
      console.error('Failed to place order:', error)
      showError('주문 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (!cart) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('commerce.checkout.title')}</h1>

      {/* 진행 단계 표시 */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            1
          </div>
          <span className="ml-2 mr-4">{t('commerce.checkout.shipping')}</span>
        </div>
        <div className="w-20 h-1 bg-gray-300 mx-2">
          <div className={`h-1 ${currentStep >= 2 ? 'bg-blue-500' : ''}`} style={{ width: currentStep >= 2 ? '100%' : '0' }} />
        </div>
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            2
          </div>
          <span className="ml-2 mr-4">{t('commerce.checkout.payment')}</span>
        </div>
        <div className="w-20 h-1 bg-gray-300 mx-2">
          <div className={`h-1 ${currentStep >= 3 ? 'bg-blue-500' : ''}`} style={{ width: currentStep >= 3 ? '100%' : '0' }} />
        </div>
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            3
          </div>
          <span className="ml-2">{t('commerce.checkout.review')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 좌측: 입력 폼 */}
        <div className="lg:col-span-2">
          {/* Step 1: 배송 정보 */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{t('commerce.checkout.shippingInfo')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('commerce.address.fullName')} *
                  </label>
                  <input
                    type="text"
                    value={formData.shippingAddress.fullName}
                    onChange={(e) => handleInputChange('shippingAddress', 'fullName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('commerce.address.phone')} *
                  </label>
                  <input
                    type="tel"
                    value={formData.shippingAddress.phone}
                    onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    {t('commerce.address.email')} *
                  </label>
                  <input
                    type="email"
                    value={formData.shippingAddress.email}
                    onChange={(e) => handleInputChange('shippingAddress', 'email', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    {t('commerce.address.address1')} *
                  </label>
                  <input
                    type="text"
                    value={formData.shippingAddress.address1}
                    onChange={(e) => handleInputChange('shippingAddress', 'address1', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    {t('commerce.address.address2')}
                  </label>
                  <input
                    type="text"
                    value={formData.shippingAddress.address2}
                    onChange={(e) => handleInputChange('shippingAddress', 'address2', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('commerce.address.city')} *
                  </label>
                  <input
                    type="text"
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('commerce.address.postalCode')} *
                  </label>
                  <input
                    type="text"
                    value={formData.shippingAddress.postalCode}
                    onChange={(e) => handleInputChange('shippingAddress', 'postalCode', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-1">
                  {t('commerce.checkout.orderNotes')}
                </label>
                <textarea
                  value={formData.orderNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderNotes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="배송 요청사항을 입력해주세요"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  다음 단계
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 결제 정보 */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{t('commerce.checkout.payment')}</h2>
              
              {/* 청구 주소 */}
              <div className="mb-6">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={formData.billingAddress.sameAsShipping}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      billingAddress: {
                        ...prev.billingAddress,
                        sameAsShipping: e.target.checked
                      }
                    }))}
                    className="mr-2"
                  />
                  <span>{t('commerce.checkout.sameAsBilling')}</span>
                </label>
              </div>

              {/* 결제 방법 선택 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">{t('commerce.order.paymentMethod')}</h3>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={formData.paymentMethod === 'credit_card'}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: 'credit_card' }))}
                      className="mr-3"
                    />
                    <span>{t('commerce.payment.creditCard')}</span>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: 'bank_transfer' }))}
                      className="mr-3"
                    />
                    <span>{t('commerce.payment.bankTransfer')}</span>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="toss_pay"
                      checked={formData.paymentMethod === 'toss_pay'}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: 'toss_pay' }))}
                      className="mr-3"
                    />
                    <span>{t('commerce.payment.tossPay')}</span>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="kakao_pay"
                      checked={formData.paymentMethod === 'kakao_pay'}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: 'kakao_pay' }))}
                      className="mr-3"
                    />
                    <span>{t('commerce.payment.kakaoPay')}</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  이전 단계
                </button>
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  다음 단계
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 주문 확인 */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{t('commerce.checkout.review')}</h2>
              
              {/* 배송 정보 확인 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">{t('commerce.order.shippingAddress')}</h3>
                <div className="text-sm text-gray-600">
                  <p>{formData.shippingAddress.fullName}</p>
                  <p>{formData.shippingAddress.phone}</p>
                  <p>{formData.shippingAddress.address1}</p>
                  {formData.shippingAddress.address2 && <p>{formData.shippingAddress.address2}</p>}
                  <p>{formData.shippingAddress.city} {formData.shippingAddress.postalCode}</p>
                </div>
              </div>

              {/* 결제 방법 확인 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">{t('commerce.order.paymentMethod')}</h3>
                <p className="text-sm text-gray-600">
                  {formData.paymentMethod === 'credit_card' && t('commerce.payment.creditCard')}
                  {formData.paymentMethod === 'bank_transfer' && t('commerce.payment.bankTransfer')}
                  {formData.paymentMethod === 'toss_pay' && t('commerce.payment.tossPay')}
                  {formData.paymentMethod === 'kakao_pay' && t('commerce.payment.kakaoPay')}
                </p>
              </div>

              {/* 약관 동의 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                    className="mr-2 mt-1"
                  />
                  <span className="text-sm">
                    {t('commerce.checkout.agreeToTerms')}
                  </span>
                </label>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  이전 단계
                </button>
                <button
                  onClick={placeOrder}
                  disabled={processing || !formData.agreeToTerms}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? '처리 중...' : t('commerce.checkout.placeOrder')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 우측: 주문 요약 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">{t('commerce.order.orderSummary')}</h2>
            
            {/* 상품 목록 */}
            <div className="space-y-3 mb-4">
              {cart.items.map((item: CartItem) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
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
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-sm text-gray-600">수량: {item.quantity}</p>
                    <p className="text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 금액 정보 */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('commerce.cart.subtotal')}</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('commerce.cart.discount')}</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>{t('commerce.cart.shipping')}</span>
                <span>{cart.shipping === 0 ? '무료' : formatPrice(cart.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('commerce.cart.tax')}</span>
                <span>{formatPrice(cart.tax)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('commerce.cart.total')}</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}