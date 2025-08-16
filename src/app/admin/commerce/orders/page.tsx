// 관리자 - 주문 관리 페이지
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Image from 'next/image'
import { withAdminAuth } from '@/components/auth/withAdminAuth'
import { useToast } from '@/contexts/ToastContext'

interface Order {
  id: string
  orderNumber: string
  userId: string
  user?: {
    name: string
    email: string
    phone?: string
  }
  status: 'PENDING' | 'PAYMENT_PENDING' | 'PAYMENT_FAILED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  shippingAddress: {
    fullName: string
    phone: string
    email: string
    address1: string
    address2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: string
  productId: string
  product?: {
    name: string
    sku: string
    images?: string[]
  }
  quantity: number
  price: number
  total: number
}

function AdminOrdersPage() {
  const router = useRouter()
  const { showSuccess, showError, showWarning } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  
  // 주문 상태 업데이트 폼
  const [updateForm, setUpdateForm] = useState({
    status: '',
    trackingNumber: '',
    notes: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/commerce/orders?limit=100&includeDetails=true')
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

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`/api/commerce/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateForm)
      })

      if (response.ok) {
        showSuccess('주문이 업데이트되었습니다.')
        setShowUpdateModal(false)
        setSelectedOrder(null)
        fetchOrders()
        resetUpdateForm()
      } else {
        const error = await response.json()
        showError('주문 업데이트 실패', error.message)
      }
    } catch (error) {
      console.error('Failed to update order:', error)
      showError('주문 업데이트 중 오류가 발생했습니다.')
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('정말로 이 주문을 취소하시겠습니까?')) return

    try {
      const response = await fetch(`/api/commerce/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: '관리자 취소' })
      })

      if (response.ok) {
        showSuccess('주문이 취소되었습니다.')
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

  const handleRefundOrder = async (orderId: string) => {
    if (!confirm('정말로 이 주문을 환불하시겠습니까?')) return

    try {
      const response = await fetch(`/api/commerce/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: '관리자 환불', amount: selectedOrder?.total })
      })

      if (response.ok) {
        showSuccess('주문이 환불되었습니다.')
        fetchOrders()
      } else {
        const error = await response.json()
        showError('주문 환불 실패', error.message)
      }
    } catch (error) {
      console.error('Failed to refund order:', error)
      showError('주문 환불 중 오류가 발생했습니다.')
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) {
      showWarning('변경할 주문을 선택해주세요.')
      return
    }

    if (!confirm(`선택한 ${selectedOrders.length}개의 주문 상태를 변경하시겠습니까?`)) return

    try {
      for (const orderId of selectedOrders) {
        await fetch(`/api/commerce/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        })
      }
      
      showSuccess(`${selectedOrders.length}개의 주문 상태가 변경되었습니다.`)
      setSelectedOrders([])
      fetchOrders()
    } catch (error) {
      console.error('Failed to update orders:', error)
      showError('주문 상태 변경 중 오류가 발생했습니다.')
    }
  }

  const resetUpdateForm = () => {
    setUpdateForm({
      status: '',
      trackingNumber: '',
      notes: ''
    })
  }

  const startUpdate = (order: Order) => {
    setSelectedOrder(order)
    setUpdateForm({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      notes: order.notes || ''
    })
    setShowUpdateModal(true)
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
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
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: '대기', color: 'bg-yellow-100 text-yellow-700' },
      'COMPLETED': { label: '완료', color: 'bg-green-100 text-green-700' },
      'FAILED': { label: '실패', color: 'bg-red-100 text-red-700' },
      'REFUNDED': { label: '환불', color: 'bg-purple-100 text-purple-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  // 필터링된 주문 목록
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || order.status === filterStatus
    const matchesPaymentStatus = !filterPaymentStatus || order.paymentStatus === filterPaymentStatus
    
    let matchesDate = true
    if (dateRange.start && dateRange.end) {
      const orderDate = new Date(order.createdAt)
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      matchesDate = orderDate >= startDate && orderDate <= endDate
    }
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDate
  })

  // 통계 계산
  const stats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: filteredOrders.filter(o => o.status === 'PENDING' || o.status === 'PAYMENT_PENDING').length,
    processingOrders: filteredOrders.filter(o => o.status === 'PROCESSING').length,
    shippedOrders: filteredOrders.filter(o => o.status === 'SHIPPED').length,
    completedOrders: filteredOrders.filter(o => o.status === 'DELIVERED').length
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">주문 관리</h1>
          
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">전체 주문</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">총 매출</p>
              <p className="text-xl font-bold">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">대기중</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">처리중</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processingOrders}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">배송중</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.shippedOrders}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">완료</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
            </div>
          </div>
          
          {/* 필터 및 액션 */}
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="주문번호, 이메일, 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 상태</option>
              <option value="PENDING">주문 대기</option>
              <option value="PAYMENT_PENDING">결제 대기</option>
              <option value="PAYMENT_FAILED">결제 실패</option>
              <option value="PROCESSING">처리 중</option>
              <option value="SHIPPED">배송 중</option>
              <option value="DELIVERED">배송 완료</option>
              <option value="CANCELLED">취소됨</option>
              <option value="REFUNDED">환불 완료</option>
            </select>
            
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 결제</option>
              <option value="PENDING">결제 대기</option>
              <option value="COMPLETED">결제 완료</option>
              <option value="FAILED">결제 실패</option>
              <option value="REFUNDED">환불됨</option>
            </select>
            
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {selectedOrders.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate('PROCESSING')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  일괄 처리중 변경
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('SHIPPED')}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  일괄 배송중 변경
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 주문 테이블 */}
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(filteredOrders.map(o => o.id))
                        } else {
                          setSelectedOrders([])
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문번호
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order.id])
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order.id))
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{order.orderNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium">{order.user?.name || order.shippingAddress.fullName}</div>
                        <div className="text-gray-500">{order.user?.email || order.shippingAddress.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {order.items.length}개 상품
                        {order.items.length > 0 && (
                          <div className="text-gray-500">
                            {order.items[0].product?.name || 'Unknown Product'}
                            {order.items.length > 1 && ` 외 ${order.items.length - 1}개`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-semibold">{formatPrice(order.total)}</div>
                    </td>
                    <td className="px-4 py-3">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          상세
                        </button>
                        <button
                          onClick={() => startUpdate(order)}
                          className="text-green-600 hover:text-green-800"
                        >
                          수정
                        </button>
                        {['PENDING', 'PAYMENT_PENDING', 'PROCESSING'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            취소
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                주문이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 주문 상세 모달 */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                주문 상세 - {selectedOrder.orderNumber}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 주문 정보 */}
                <div>
                  <h3 className="font-semibold mb-2">주문 정보</h3>
                  <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">주문 상태:</span>
                      <span>{getStatusBadge(selectedOrder.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">결제 상태:</span>
                      <span>{getPaymentStatusBadge(selectedOrder.paymentStatus)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">결제 방법:</span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">주문 일시:</span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">운송장 번호:</span>
                        <span className="font-mono">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 고객 정보 */}
                <div>
                  <h3 className="font-semibold mb-2">고객 정보</h3>
                  <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">이름: </span>
                      <span>{selectedOrder.user?.name || selectedOrder.shippingAddress.fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">이메일: </span>
                      <span>{selectedOrder.user?.email || selectedOrder.shippingAddress.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">전화번호: </span>
                      <span>{selectedOrder.user?.phone || selectedOrder.shippingAddress.phone}</span>
                    </div>
                  </div>
                </div>

                {/* 배송 주소 */}
                <div>
                  <h3 className="font-semibold mb-2">배송 주소</h3>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <p>{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.phone}</p>
                    <p>{selectedOrder.shippingAddress.address1}</p>
                    {selectedOrder.shippingAddress.address2 && (
                      <p>{selectedOrder.shippingAddress.address2}</p>
                    )}
                    <p>
                      {selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

                {/* 금액 정보 */}
                <div>
                  <h3 className="font-semibold mb-2">금액 정보</h3>
                  <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">소계:</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>할인:</span>
                        <span>-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">배송비:</span>
                      <span>{formatPrice(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">세금:</span>
                      <span>{formatPrice(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>총액:</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 주문 상품 */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">주문 상품</h3>
                <div className="bg-gray-50 rounded p-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">상품</th>
                        <th className="text-center py-2">수량</th>
                        <th className="text-right py-2">단가</th>
                        <th className="text-right py-2">금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              {item.product?.images?.[0] && (
                                <div className="relative w-10 h-10 bg-gray-200 rounded overflow-hidden">
                                  <Image
                                    src={item.product.images[0]}
                                    alt={item.product?.name || ''}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div>{item.product?.name || 'Unknown Product'}</div>
                                <div className="text-xs text-gray-500">{item.product?.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-2">{item.quantity}</td>
                          <td className="text-right py-2">{formatPrice(item.price)}</td>
                          <td className="text-right py-2">{formatPrice(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 메모 */}
              {selectedOrder.notes && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">메모</h3>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedOrder(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    startUpdate(selectedOrder)
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  주문 수정
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 주문 수정 모달 */}
        {showUpdateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">
                주문 수정 - {selectedOrder.orderNumber}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">주문 상태</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">주문 대기</option>
                    <option value="PAYMENT_PENDING">결제 대기</option>
                    <option value="PAYMENT_FAILED">결제 실패</option>
                    <option value="PROCESSING">처리 중</option>
                    <option value="SHIPPED">배송 중</option>
                    <option value="DELIVERED">배송 완료</option>
                    <option value="CANCELLED">취소됨</option>
                    <option value="REFUNDED">환불 완료</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">운송장 번호</label>
                  <input
                    type="text"
                    value={updateForm.trackingNumber}
                    onChange={(e) => setUpdateForm({ ...updateForm, trackingNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="운송장 번호 입력"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">관리자 메모</label>
                  <textarea
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="메모 입력"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUpdateModal(false)
                    setSelectedOrder(null)
                    resetUpdateForm()
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateOrder}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default withAdminAuth(AdminOrdersPage)