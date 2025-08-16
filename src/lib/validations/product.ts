// Product 관련 Zod 검증 스키마

import { z } from 'zod'

// Product 상태 ENUM 검증
export const ProductStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED'])

// Product 생성 검증 스키마
export const CreateProductSchema = z.object({
  name: z.string().min(1, '상품명은 필수입니다').max(255, '상품명은 255자 이하여야 합니다'),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.number().int().min(0, '가격은 0원 이상이어야 합니다'),
  compareAt: z.number().int().min(0).optional(),
  cost: z.number().int().min(0).optional(),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  stock: z.number().int().min(0).default(0),
  trackStock: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  weight: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  depth: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: ProductStatusSchema.default('DRAFT'),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  metaKeywords: z.array(z.string()).default([]),
  images: z.array(z.object({
    url: z.string().url('올바른 이미지 URL을 입력하세요'),
    alt: z.string().optional(),
    position: z.number().int().min(0).default(0)
  })).default([])
})

// Product 수정 검증 스키마
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().min(1, '제품 ID는 필수입니다')
})

// Product 필터 검증 스키마
export const ProductFilterSchema = z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
  status: ProductStatusSchema.optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  inStock: z.boolean().optional(),
  tags: z.array(z.string()).optional()
})

// Product 정렬 검증 스키마
export const ProductSortSchema = z.object({
  field: z.enum(['name', 'price', 'createdAt', 'updatedAt', 'stock', 'rating']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc')
})

// 페이지네이션 검증 스키마
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(12)
})

// Product Variant 생성 검증 스키마
export const CreateProductVariantSchema = z.object({
  productId: z.string().min(1, '제품 ID는 필수입니다'),
  name: z.string().min(1, '변형명은 필수입니다').max(255),
  sku: z.string().min(1, 'SKU는 필수입니다').max(100),
  price: z.number().int().min(0, '가격은 0원 이상이어야 합니다'),
  stock: z.number().int().min(0).default(0),
  options: z.record(z.string(), z.string()),
  image: z.string().url().optional()
})

// Product Image 생성 검증 스키마
export const CreateProductImageSchema = z.object({
  productId: z.string().min(1, '제품 ID는 필수입니다'),
  url: z.string().url('올바른 이미지 URL을 입력하세요'),
  alt: z.string().optional(),
  position: z.number().int().min(0).default(0)
})

// Category 생성 검증 스키마
export const CreateCategorySchema = z.object({
  name: z.string().min(1, '카테고리명은 필수입니다').max(255),
  slug: z.string().min(1, '슬러그는 필수입니다').max(255),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
})

// API 쿼리 파라미터 검증 스키마
export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['name', 'price', 'createdAt', 'updatedAt', 'stock']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: ProductStatusSchema.optional()
})

// Cart 관련 검증 스키마
export const AddToCartSchema = z.object({
  productId: z.string().min(1, '제품 ID는 필수입니다'),
  quantity: z.number().int().min(1, '수량은 1개 이상이어야 합니다').max(99, '최대 99개까지 주문 가능합니다'),
  variant: z.record(z.string(), z.string()).optional()
})

export const UpdateCartItemSchema = z.object({
  cartItemId: z.string().min(1, '장바구니 아이템 ID는 필수입니다'),
  quantity: z.number().int().min(1, '수량은 1개 이상이어야 합니다').max(99, '최대 99개까지 주문 가능합니다'),
  variant: z.record(z.string(), z.string()).optional()
})

export const RemoveFromCartSchema = z.object({
  productId: z.string().min(1, '제품 ID는 필수입니다')
})

export const CartSessionSchema = z.object({
  sessionId: z.string().min(1, '세션 ID는 필수입니다'),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
    variant: z.record(z.string(), z.string()).optional()
  }))
})

// 타입 추론을 위한 export
export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
export type ProductFilterInput = z.infer<typeof ProductFilterSchema>
export type ProductSortInput = z.infer<typeof ProductSortSchema>
export type PaginationInput = z.infer<typeof PaginationSchema>
export type CreateProductVariantInput = z.infer<typeof CreateProductVariantSchema>
export type CreateProductImageInput = z.infer<typeof CreateProductImageSchema>
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>
// Order 관련 검증 스키마
export const OrderStatusSchema = z.enum([
  'PENDING',
  'PAYMENT_PENDING',
  'PAYMENT_COMPLETED', 
  'PAYMENT_FAILED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'PARTIAL_REFUND'
])

export const PaymentMethodSchema = z.enum([
  'CARD',
  'VIRTUAL_ACCOUNT',
  'TRANSFER',
  'MOBILE',
  'CULTURE_GIFT',
  'BOOK_GIFT',
  'GAME_GIFT',
  'TOSS_PAY',
  'SAMSUNG_PAY',
  'EASY_PAY'
])

export const AddressSchema = z.object({
  name: z.string().min(1, '받는 사람 이름은 필수입니다').max(50),
  phone: z.string().min(10, '올바른 전화번호를 입력하세요').max(15),
  postalCode: z.string().min(5, '우편번호는 5자리 이상이어야 합니다').max(10),
  address: z.string().min(1, '주소는 필수입니다').max(200),
  detail: z.string().max(100).optional()
})

export const CreateOrderSchema = z.object({
  userId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    name: z.string().min(1),
    sku: z.string().optional(),
    price: z.number().int().min(0),
    quantity: z.number().int().min(1).max(99),
    variant: z.record(z.string(), z.string()).optional()
  })).min(1, '주문할 상품을 선택하세요'),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  notes: z.string().max(500).optional(),
  subtotal: z.number().int().min(0),
  tax: z.number().int().min(0).default(0),
  shipping: z.number().int().min(0).default(0),
  discount: z.number().int().min(0).default(0),
  total: z.number().int().min(0)
})

export const UpdateOrderSchema = z.object({
  id: z.string().min(1),
  status: OrderStatusSchema.optional(),
  trackingNumber: z.string().max(100).optional(),
  carrier: z.string().max(50).optional(),
  notes: z.string().max(500).optional()
})

export const OrderFilterSchema = z.object({
  userId: z.string().optional(),
  status: OrderStatusSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.number().int().min(0).optional(),
  maxAmount: z.number().int().min(0).optional()
})

export const OrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: OrderStatusSchema.optional(),
  sort: z.enum(['createdAt', 'total', 'status']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc')
})

export type AddToCartInput = z.infer<typeof AddToCartSchema>
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>
export type RemoveFromCartInput = z.infer<typeof RemoveFromCartSchema>
export type CartSessionInput = z.infer<typeof CartSessionSchema>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>
export type OrderFilterInput = z.infer<typeof OrderFilterSchema>
export type OrderQueryInput = z.infer<typeof OrderQuerySchema>
export type AddressInput = z.infer<typeof AddressSchema>