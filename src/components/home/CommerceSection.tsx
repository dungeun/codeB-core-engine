// 홈페이지 커머스 섹션 컴포넌트
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/hooks/useLanguage'

interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  category: string
  images: string[]
  featured: boolean
  stock: number
  status: string
}

export default function CommerceSection() {
  const { t } = useLanguage()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories] = useState([
    { id: 'electronics', name: '전자제품', icon: '📱' },
    { id: 'fashion', name: '패션', icon: '👔' },
    { id: 'home', name: '홈/리빙', icon: '🏠' },
    { id: 'beauty', name: '뷰티', icon: '💄' },
    { id: 'food', name: '식품', icon: '🍱' },
    { id: 'sports', name: '스포츠', icon: '⚽' }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/commerce/products?featured=true&limit=8')
      const data = await response.json()
      
      if (response.ok) {
        setFeaturedProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch featured products:', error)
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

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0
    return Math.round(((comparePrice - price) / comparePrice) * 100)
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* 섹션 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {t('commerce.home.title', '인기 상품')}
            </h2>
            <p className="text-gray-600">
              {t('commerce.home.subtitle', '엄선된 베스트 상품을 만나보세요')}
            </p>
          </div>
          <Link
            href="/commerce/products"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            {t('commerce.home.viewAll', '전체보기')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* 카테고리 퀵링크 */}
        <div className="flex overflow-x-auto gap-4 mb-8 pb-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/commerce/products?category=${category.id}`}
              className="flex flex-col items-center min-w-[80px] group"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-md group-hover:shadow-lg transition-shadow">
                {category.icon}
              </div>
              <span className="text-sm mt-2 text-gray-700 group-hover:text-blue-600">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        {/* 추천 상품 그리드 */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/commerce/products/${product.id}`}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow group"
              >
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* 할인율 배지 */}
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      -{calculateDiscount(product.price, product.comparePrice)}%
                    </div>
                  )}
                  
                  {/* 품절 오버레이 */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {t('commerce.product.soldOut', '품절')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>
                  
                  {/* 재고 경고 */}
                  {product.stock > 0 && product.stock <= 5 && (
                    <p className="text-xs text-red-600 mt-1">
                      {t('commerce.product.lowStock', '재고 부족')} ({product.stock}개)
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">
              {t('commerce.home.noProducts', '추천 상품이 없습니다.')}
            </p>
            <Link
              href="/commerce/products"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {t('commerce.home.browseProducts', '상품 둘러보기')}
            </Link>
          </div>
        )}

        {/* 프로모션 배너 */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-2">
              {t('commerce.home.promo.title', '첫 구매 특별 혜택')}
            </h3>
            <p className="mb-4">
              {t('commerce.home.promo.description', '지금 회원가입하고 첫 구매시 20% 할인 쿠폰을 받으세요!')}
            </p>
            <div className="flex gap-3">
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
              >
                {t('commerce.home.promo.signUp', '회원가입')}
              </Link>
              <Link
                href="/commerce/products"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 border border-white"
              >
                {t('commerce.home.promo.shop', '쇼핑하기')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}