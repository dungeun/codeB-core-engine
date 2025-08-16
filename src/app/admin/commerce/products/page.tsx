// 관리자 - 제품 관리 페이지
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Image from 'next/image'
import { withAdminAuth } from '@/components/auth/withAdminAuth'
import { useToast } from '@/contexts/ToastContext'

interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  category: string
  subcategory?: string
  brand?: string
  sku: string
  stock: number
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  featured: boolean
  images: string[]
  createdAt: string
  updatedAt: string
}

function AdminProductsPage() {
  const router = useRouter()
  const { showSuccess, showError, showWarning } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // 새 제품 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    comparePrice: 0,
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    stock: 0,
    status: 'DRAFT' as const,
    featured: false,
    images: [] as string[]
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/commerce/products?limit=100')
      const data = await response.json()
      
      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      const response = await fetch('/api/commerce/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        showSuccess('제품이 생성되었습니다.')
        setShowCreateModal(false)
        fetchProducts()
        resetForm()
      } else {
        const error = await response.json()
        showError('제품 생성 실패', error.message)
      }
    } catch (error) {
      console.error('Failed to create product:', error)
      showError('제품 생성 중 오류가 발생했습니다.')
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/commerce/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        showSuccess('제품이 수정되었습니다.')
        setEditingProduct(null)
        fetchProducts()
        resetForm()
      } else {
        const error = await response.json()
        showError('제품 수정 실패', error.message)
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      showError('제품 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('정말로 이 제품을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/commerce/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showSuccess('제품이 삭제되었습니다.')
        fetchProducts()
      } else {
        const error = await response.json()
        showError('제품 삭제 실패', error.message)
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      showError('제품 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      showWarning('삭제할 제품을 선택해주세요.')
      return
    }

    if (!confirm(`선택한 ${selectedProducts.length}개의 제품을 삭제하시겠습니까?`)) return

    try {
      for (const productId of selectedProducts) {
        await fetch(`/api/commerce/products/${productId}`, {
          method: 'DELETE'
        })
      }
      
      showSuccess(`${selectedProducts.length}개의 제품이 삭제되었습니다.`)
      setSelectedProducts([])
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete products:', error)
      showError('제품 삭제 중 오류가 발생했습니다.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      comparePrice: 0,
      category: '',
      subcategory: '',
      brand: '',
      sku: '',
      stock: 0,
      status: 'DRAFT',
      featured: false,
      images: []
    })
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice || 0,
      category: product.category,
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      sku: product.sku,
      stock: product.stock,
      status: product.status,
      featured: product.featured,
      images: product.images
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { label: '판매중', color: 'bg-green-100 text-green-700' },
      'INACTIVE': { label: '판매중지', color: 'bg-gray-100 text-gray-700' },
      'DRAFT': { label: '임시저장', color: 'bg-yellow-100 text-yellow-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  // 필터링된 제품 목록
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.category === filterCategory
    const matchesStatus = !filterStatus || product.status === filterStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">상품 관리</h1>
          
          {/* 필터 및 액션 */}
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="상품명 또는 SKU 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 카테고리</option>
              <option value="electronics">전자제품</option>
              <option value="fashion">패션</option>
              <option value="home">홈/리빙</option>
              <option value="beauty">뷰티</option>
              <option value="food">식품</option>
              <option value="sports">스포츠</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 상태</option>
              <option value="ACTIVE">판매중</option>
              <option value="INACTIVE">판매중지</option>
              <option value="DRAFT">임시저장</option>
            </select>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              새 상품 등록
            </button>
            
            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                선택 삭제 ({selectedProducts.length})
              </button>
            )}
          </div>
        </div>

        {/* 제품 테이블 */}
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
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(filteredProducts.map(p => p.id))
                        } else {
                          setSelectedProducts([])
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    재고
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden mr-3">
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.featured && (
                            <span className="text-xs text-orange-600">★ 추천</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        {formatPrice(product.price)}
                      </div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatPrice(product.comparePrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={product.stock <= 5 ? 'text-red-600 font-semibold' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                상품이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 생성/수정 모달 */}
        {(showCreateModal || editingProduct) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingProduct ? '상품 수정' : '새 상품 등록'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">상품명 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">판매가 *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">정가</label>
                    <input
                      type="number"
                      value={formData.comparePrice}
                      onChange={(e) => setFormData({ ...formData, comparePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">카테고리 *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="electronics">전자제품</option>
                      <option value="fashion">패션</option>
                      <option value="home">홈/리빙</option>
                      <option value="beauty">뷰티</option>
                      <option value="food">식품</option>
                      <option value="sports">스포츠</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">브랜드</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">SKU *</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">재고 *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">상태</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">임시저장</option>
                    <option value="ACTIVE">판매중</option>
                    <option value="INACTIVE">판매중지</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    추천 상품으로 설정
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingProduct(null)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingProduct ? '수정' : '등록'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default withAdminAuth(AdminProductsPage)