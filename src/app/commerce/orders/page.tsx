// 주문 내역 페이지
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from '@/hooks/use-translations'
import { useSecureSession } from '@/hooks/useSecureSession'
import { useToast } from '@/contexts/ToastContext'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'PAYMENT_PENDING' | 'PAYMENT_FAILED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  total: number
  itemCount: number
  createdAt: string
  items: OrderItem[]
  shippingAddress: any
  paymentMethod: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export default function OrdersPage() {
  const t = useTranslations()
  const { data: session } = useSession()
  const { getSessionHeaders, isLoading: sessionLoading } = useSecureSession()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin?redirect=/commerce/orders')
      return
    }
    
    fetchOrders()
  }, [session, filter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }
      
      const response = await fetch(`/api/commerce/orders?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: '주문 대기', color: 'bg-gray-100 text-gray-700' },
      'PAYMENT_PENDING': { label: '결제 대기', color: 'bg-yellow-100 text-yellow-700' },
      'PAYMENT_FAILED': { label: '결제 실패', color: 'bg-red-100 text-red-700' },
      'PROCESSING': { label: '처리 중', color: 'bg-blue-100 text-blue-700' },
      'SHIPPED': { label: '배송 중', color: 'bg-indigo-100 text-indigo-700' },
      'DELIVERED': { label: '배송 완료', color: 'bg-green-100 text-green-700' },
      'CANCELLED': { label: '취소됨', color: 'bg-gray-100 text-gray-700' },
      'REFUNDED': { label: '환불 완료', color: 'bg-purple-100 text-purple-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('정말로 이 주문을 취소하시겠습니까?')) return

    try {
      const response = await fetch(`/api/commerce/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: '고객 요청' })
      })

      if (response.ok) {
        showSuccess(t('commerce.message.orderCancelled'))
        fetchOrders()
      } else {
        const error = await response.json()
        showError('주문 취소 실패', error.message)
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
      showError('주문 취소 중 오류가 발생했습니다.')
    }
  }

  if (!session) {
    return null
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('commerce.order.history')}</h1>

      {/* 필터 탭 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter('PROCESSING')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'PROCESSING' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          처리 중
        </button>
        <button
          onClick={() => setFilter('SHIPPED')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'SHIPPED' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          배송 중
        </button>
        <button
          onClick={() => setFilter('DELIVERED')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'DELIVERED' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          배송 완료
        </button>
        <button
          onClick={() => setFilter('CANCELLED')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'CANCELLED' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          취소/환불
        </button>
      </div>

      {/* 주문 목록 */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              {/* 주문 헤더 */}
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      주문번호: {order.orderNumber}
                    </h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold">{formatPrice(order.total)}</p>
                  <p className="text-sm text-gray-600">{order.itemCount}개 상품</p>
                </div>
              </div>

              {/* 주문 상품 목록 */}
              <div className="border-t pt-4 mb-4">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex justify-between py-2">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-gray-600 mt-2">
                    외 {order.items.length - 2}개 상품
                  </p>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/commerce/orders/${order.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {t('commerce.order.details')}
                </Link>
                
                {['PENDING', 'PAYMENT_PENDING', 'PAYMENT_FAILED'].includes(order.status) && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                  >
                    {t('commerce.order.cancel')}
                  </button>
                )}
                
                {order.status === 'DELIVERED' && (
                  <>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      {t('commerce.order.return')}
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      리뷰 작성
                    </button>
                  </>
                )}
                
                {['SHIPPED', 'DELIVERED'].includes(order.status) && (
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    {t('commerce.order.track')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">주문 내역이 없습니다.</p>
          <Link
            href="/commerce/products"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            쇼핑 시작하기
          </Link>
        </div>
      )}
    </div>
  )
}