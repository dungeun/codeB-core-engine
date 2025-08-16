// 제품 상세 페이지
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'
import { useSession } from 'next-auth/react'
import { useSecureSession } from '@/hooks/useSecureSession'
import { useToast } from '@/contexts/ToastContext'
import { useFormValidation } from '@/hooks/useFormValidation'
import { AddToCartSchema } from '@/lib/validation/commerce'

interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  category: string
  subcategory?: string
  brand?: string
  sku: string
  stock: number
  featured: boolean
  specifications?: Record<string, any>
  shippingInfo?: string
  returnPolicy?: string
  rating?: number
  reviewCount?: number
  tags?: string[]
  variants?: ProductVariant[]
  relatedProducts?: Product[]
}

interface ProductVariant {
  id: string
  name: string
  options: VariantOption[]
}

interface VariantOption {
  id: string
  value: string
  priceModifier?: number
  stock?: number
}

interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
  images?: string[]
}

export default function ProductDetailPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const { getSessionHeaders, isLoading: sessionLoading } = useSecureSession()
  const { showSuccess, showError } = useToast()
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [reviews, setReviews] = useState<Review[]>([])
  const [addingToCart, setAddingToCart] = useState(false)
  const { validate } = useFormValidation(AddToCartSchema)

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [productId, fetchProduct, fetchReviews])

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/commerce/products/${productId}`)
      const data = await response.json()

      if (response.ok && data.product) {
        setProduct(data.product)
        
        // 관련 상품도 가져오기
        if (!data.product.relatedProducts) {
          fetchRelatedProducts(data.product.category)
        }
      } else {
        console.error('Product not found')
        router.push('/commerce/products')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
    } finally {
      setLoading(false)
    }
  }, [productId, router, fetchRelatedProducts])

  const fetchRelatedProducts = useCallback(async (category: string) => {
    try {
      const response = await fetch(`/api/commerce/products?category=${category}&limit=4`)
      const data = await response.json()
      
      if (response.ok && data.products) {
        setProduct(prev => prev ? {
          ...prev,
          relatedProducts: data.products.filter((p: Product) => p.id !== productId)
        } : null)
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error)
    }
  }, [productId])

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/commerce/products/${productId}/reviews`)
      const data = await response.json()
      
      if (response.ok && data.reviews) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }, [productId])

  const handleAddToCart = useCallback(async () => {
    if (!product) return

    // 폼 검증
    const cartData = {
      productId: product.id,
      quantity,
      variants: selectedVariants
    }

    const validationResult = validate(cartData)
    if (!validationResult.success) {
      return // 오류는 useFormValidation에서 토스트로 표시됨
    }

    try {
      setAddingToCart(true)

      const response = await fetch('/api/commerce/cart/items', {
        method: 'POST',
        headers: getSessionHeaders(),
        body: JSON.stringify(validationResult.data),
        credentials: 'include'
      })

      if (response.ok) {
        // 성공 메시지 표시
        showSuccess(t('commerce.message.addedToCart'))
        
        // 장바구니 카운트 업데이트 (필요한 경우)
        // updateCartCount()
      } else {
        const error = await response.json()
        showError('장바구니 추가 실패', error.message)
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      showError('장바구니 추가 중 오류가 발생했습니다.')
    } finally {
      setAddingToCart(false)
    }
  }, [product, quantity, selectedVariants, validate, getSessionHeaders, showSuccess, showError, t])

  const handleBuyNow = useCallback(async () => {
    // 장바구니에 추가 후 결제 페이지로 이동
    await handleAddToCart()
    router.push('/commerce/checkout')
  }, [handleAddToCart, router])

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }, [])

  const calculateFinalPrice = useMemo(() => {
    if (!product) return 0
    
    let finalPrice = product.price
    
    // 선택한 옵션의 가격 변경사항 적용
    Object.entries(selectedVariants).forEach(([variantId, optionId]) => {
      const variant = product.variants?.find(v => v.id === variantId)
      const option = variant?.options.find(o => o.id === optionId)
      if (option?.priceModifier) {
        finalPrice += option.priceModifier
      }
    })
    
    return finalPrice * quantity
  }, [product, selectedVariants, quantity])

  const isInStock = useMemo(() => {
    if (!product) return false
    
    // 선택한 옵션의 재고 확인
    const hasVariantStock = Object.entries(selectedVariants).every(([variantId, optionId]) => {
      const variant = product.variants?.find(v => v.id === variantId)
      const option = variant?.options.find(o => o.id === optionId)
      return !option?.stock || option.stock > 0
    })
    
    return product.stock > 0 && hasVariantStock
  }, [product, selectedVariants])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">제품을 찾을 수 없습니다.</p>
          <Link href="/commerce/products" className="text-blue-500 hover:underline">
            제품 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 제품 상세 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 이미지 갤러리 */}
        <div>
          {/* 메인 이미지 */}
          <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* 썸네일 이미지 */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 제품 정보 */}
        <div>
          {/* 카테고리 경로 */}
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/commerce/products" className="hover:text-blue-500">
              {t('commerce.product.title')}
            </Link>
            {product.category && (
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/commerce/products?category=${product.category}`}
                  className="hover:text-blue-500"
                >
                  {product.category}
                </Link>
              </>
            )}
          </nav>

          {/* 제품명 */}
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* 평점 */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating!) ? 'fill-current' : 'fill-gray-300'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviewCount || 0} {t('commerce.product.reviews')})
              </span>
            </div>
          )}

          {/* 가격 */}
          <div className="mb-6">
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="text-gray-500 line-through text-lg">
                {formatPrice(product.comparePrice)}
              </div>
            )}
            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </div>
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="text-red-500 text-sm mt-1">
                {Math.round((1 - product.price / product.comparePrice) * 100)}% {t('commerce.product.discount')}
              </div>
            )}
          </div>

          {/* 설명 */}
          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* 옵션 선택 */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              {product.variants.map((variant) => (
                <div key={variant.id} className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    {variant.name}
                  </label>
                  <select
                    value={selectedVariants[variant.id] || ''}
                    onChange={(e) => setSelectedVariants(prev => ({
                      ...prev,
                      [variant.id]: e.target.value
                    }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('commerce.product.selectOption')}</option>
                    {variant.options.map((option) => (
                      <option
                        key={option.id}
                        value={option.id}
                        disabled={option.stock === 0}
                      >
                        {option.value}
                        {option.priceModifier && option.priceModifier !== 0 && (
                          ` (+${formatPrice(option.priceModifier)})`
                        )}
                        {option.stock === 0 && ' (품절)'}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* 수량 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {t('commerce.product.quantity')}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-1 border rounded-lg text-center"
                min="1"
                max={product.stock}
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* 재고 상태 */}
          <div className="mb-6">
            {product.stock === 0 ? (
              <p className="text-red-600 font-semibold">{t('commerce.product.outOfStock')}</p>
            ) : product.stock <= 5 ? (
              <p className="text-orange-600">{t('commerce.product.lowStock')} ({product.stock}개)</p>
            ) : (
              <p className="text-green-600">{t('commerce.product.inStock')}</p>
            )}
          </div>

          {/* 총 가격 */}
          {quantity > 1 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('commerce.cart.total')}</span>
                <span className="text-2xl font-bold">{formatPrice(calculateFinalPrice)}</span>
              </div>
            </div>
          )}

          {/* 구매 버튼 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!isInStock || addingToCart}
              className="flex-1 px-6 py-3 bg-white border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? '추가 중...' : t('commerce.product.addToCart')}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!isInStock}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('commerce.product.buyNow')}
            </button>
          </div>

          {/* 추가 정보 */}
          <div className="border-t pt-6 space-y-4">
            {product.sku && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('commerce.product.sku')}</span>
                <span>{product.sku}</span>
              </div>
            )}
            {product.brand && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('commerce.product.brand')}</span>
                <span>{product.brand}</span>
              </div>
            )}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 탭 섹션 */}
      <div className="border-t pt-8">
        <div className="flex gap-8 mb-6 border-b">
          <button className="pb-2 border-b-2 border-blue-500 font-semibold">
            {t('commerce.product.specifications')}
          </button>
          <button className="pb-2 text-gray-600 hover:text-gray-900">
            {t('commerce.product.shipping')}
          </button>
          <button className="pb-2 text-gray-600 hover:text-gray-900">
            {t('commerce.product.returns')}
          </button>
          <button className="pb-2 text-gray-600 hover:text-gray-900">
            {t('commerce.product.reviews')} ({reviews.length})
          </button>
        </div>

        {/* 상품 정보 탭 내용 */}
        <div className="mb-12">
          {product.specifications && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-semibold mr-2">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 관련 상품 */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">{t('commerce.product.relatedProducts')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.relatedProducts.slice(0, 4).map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/commerce/products/${relatedProduct.id}`}
                className="group"
              >
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square bg-gray-100">
                    {relatedProduct.images && relatedProduct.images[0] ? (
                      <Image
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-blue-600">
                      {relatedProduct.name}
                    </h3>
                    <div className="font-bold">
                      {formatPrice(relatedProduct.price)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}