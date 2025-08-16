// 제품 목록 페이지
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/hooks/useLanguage'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  featured: boolean
  rating?: number
  reviewCount?: number
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ProductsPage() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  })
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'featured'
  })

  useEffect(() => {
    fetchProducts()
  }, [searchParams])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      // 필터 파라미터 추가
      if (filters.category) params.append('category', filters.category)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.search) params.append('search', filters.search)
      if (filters.sort) params.append('sort', filters.sort)
      params.append('page', searchParams.get('page') || '1')
      params.append('limit', '12')

      const response = await fetch(`/api/commerce/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products || [])
        setPagination(data.pagination || {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    
    // URL 파라미터 업데이트
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // 필터 변경시 첫 페이지로
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    window.history.pushState(null, '', `?${params.toString()}`)
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
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{t('commerce.product.title')}</h1>
        
        {/* 필터 및 정렬 */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* 검색 */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder={t('commerce.search.placeholder')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 카테고리 필터 */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('commerce.filter.category')}</option>
            <option value="electronics">전자제품</option>
            <option value="fashion">패션</option>
            <option value="home">홈/리빙</option>
            <option value="beauty">뷰티</option>
            <option value="food">식품</option>
            <option value="sports">스포츠</option>
          </select>

          {/* 정렬 */}
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="featured">{t('commerce.sort.relevance')}</option>
            <option value="price_asc">{t('commerce.sort.priceLowToHigh')}</option>
            <option value="price_desc">{t('commerce.sort.priceHighToLow')}</option>
            <option value="newest">{t('commerce.sort.newest')}</option>
            <option value="rating">{t('commerce.sort.rating')}</option>
          </select>
        </div>

        {/* 결과 수 */}
        <div className="text-sm text-gray-600">
          {pagination.total > 0 ? (
            <span>{pagination.total}개의 상품</span>
          ) : (
            <span>{t('commerce.search.noResults')}</span>
          )}
        </div>
      </div>

      {/* 제품 그리드 */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/commerce/products/${product.id}`}
                className="group cursor-pointer"
              >
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* 제품 이미지 */}
                  <div className="relative aspect-square bg-gray-100">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                    
                    {/* 배지 */}
                    {product.featured && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                        {t('commerce.product.featured')}
                      </span>
                    )}
                    
                    {product.stock === 0 && (
                      <span className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 text-xs rounded">
                        {t('commerce.product.outOfStock')}
                      </span>
                    )}
                  </div>

                  {/* 제품 정보 */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-blue-600">
                      {product.name}
                    </h3>
                    
                    {/* 평점 */}
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating!) ? 'fill-current' : 'fill-gray-300'
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                    )}

                    {/* 가격 */}
                    <div className="font-bold text-lg">
                      {formatPrice(product.price)}
                    </div>

                    {/* 재고 상태 */}
                    {product.stock > 0 && product.stock <= 5 && (
                      <p className="text-xs text-orange-600 mt-1">
                        {t('commerce.product.lowStock')} ({product.stock}개)
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>

              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-lg ${
                      page === pagination.page
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">{t('commerce.search.noResults')}</p>
          <button
            onClick={() => {
              setFilters({
                category: '',
                minPrice: '',
                maxPrice: '',
                search: '',
                sort: 'featured'
              })
              window.history.pushState(null, '', '/commerce/products')
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {t('commerce.filter.reset')}
          </button>
        </div>
      )}
    </div>
  )
}