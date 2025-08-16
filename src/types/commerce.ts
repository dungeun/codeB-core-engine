// Commerce 관련 타입 정의
import type { BaseEntity, Money, Address, BaseFilters } from './global'

// 제품 관련 타입
export interface Product extends BaseEntity {
  name: string
  description: string
  price: number
  comparePrice?: number
  cost?: number
  profit?: number
  margin?: number
  currency: string
  images: ProductImage[]
  category: ProductCategory
  subcategory?: ProductCategory
  brand?: Brand
  sku: string
  barcode?: string
  stock: number
  lowStockThreshold?: number
  trackInventory: boolean
  sellWhenOutOfStock: boolean
  featured: boolean
  published: boolean
  visibility: ProductVisibility
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  specifications?: ProductSpecification[]
  shippingInfo?: ShippingInfo
  returnPolicy?: string
  warranty?: string
  rating?: number
  reviewCount: number
  salesCount: number
  viewCount: number
  tags: string[]
  variants?: ProductVariant[]
  relatedProducts?: string[] // Product IDs
  collections?: string[] // Collection IDs
  weight?: number
  dimensions?: ProductDimensions
  status: ProductStatus
  metadata?: Record<string, any>
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export enum ProductVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  PASSWORD_PROTECTED = 'PASSWORD_PROTECTED'
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  sortOrder: number
  width?: number
  height?: number
  size?: number
}

export interface ProductDimensions {
  length: number
  width: number
  height: number
  unit: 'cm' | 'inch'
}

export interface ProductSpecification {
  name: string
  value: string
  group?: string
  sortOrder?: number
}

export interface ShippingInfo {
  weight?: number
  dimensions?: ProductDimensions
  shippingClass?: string
  freeShipping: boolean
  separateShipping: boolean
}

export interface ProductVariant {
  id: string
  name: string
  required: boolean
  type: VariantType
  options: VariantOption[]
}

export enum VariantType {
  SINGLE_SELECT = 'SINGLE_SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  TEXT = 'TEXT',
  COLOR = 'COLOR',
  SIZE = 'SIZE'
}

export interface VariantOption {
  id: string
  value: string
  priceModifier?: number
  costModifier?: number
  stock?: number
  sku?: string
  image?: string
  color?: string
  disabled: boolean
}

export interface ProductCategory extends BaseEntity {
  name: string
  description?: string
  slug: string
  image?: string
  parentId?: string
  children?: ProductCategory[]
  level: number
  sortOrder: number
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
  productCount: number
}

export interface Brand extends BaseEntity {
  name: string
  description?: string
  logo?: string
  website?: string
  isActive: boolean
  productCount: number
}

export interface ProductCollection extends BaseEntity {
  name: string
  description?: string
  slug: string
  image?: string
  type: CollectionType
  rules?: CollectionRule[]
  products?: string[] // Product IDs for manual collections
  isActive: boolean
  featured: boolean
  sortOrder: number
}

export enum CollectionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC'
}

export interface CollectionRule {
  field: string
  operator: string
  value: string
}

// 장바구니 관련 타입
export interface Cart {
  id: string
  userId?: string
  sessionId?: string
  items: CartItem[]
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  currency: string
  appliedCoupons: AppliedCoupon[]
  shippingAddress?: Address
  billingAddress?: Address
  notes?: string
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  variantSelections?: Record<string, string>
  quantity: number
  unitPrice: number
  totalPrice: number
  comparePrice?: number
  discount?: number
  addedAt: string
}

export interface AppliedCoupon {
  code: string
  discount: number
  type: CouponType
}

// 쿠폰 관련 타입
export interface Coupon extends BaseEntity {
  code: string
  name: string
  description?: string
  type: CouponType
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  usageLimit?: number
  usageCount: number
  userUsageLimit?: number
  isActive: boolean
  startsAt?: string
  endsAt?: string
  applicableProducts?: string[]
  applicableCategories?: string[]
  excludedProducts?: string[]
  excludedCategories?: string[]
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUY_X_GET_Y = 'BUY_X_GET_Y'
}

// 주문 관련 타입
export interface Order extends BaseEntity {
  orderNumber: string
  userId?: string
  customer: OrderCustomer
  items: OrderItem[]
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  currency: string
  appliedCoupons: AppliedCoupon[]
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: PaymentMethod
  shippingMethod?: ShippingMethod
  notes?: string
  internalNotes?: string
  tags?: string[]
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: string
  actualDelivery?: string
  refunds?: OrderRefund[]
  timeline: OrderEvent[]
}

export interface OrderCustomer {
  id?: string
  email: string
  name: string
  phone?: string
  isGuest: boolean
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productSku: string
  productImage?: string
  variantSelections?: Record<string, string>
  quantity: number
  unitPrice: number
  totalPrice: number
  discount?: number
  tax?: number
  fulfillmentStatus: ItemFulfillmentStatus
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  RETURNED = 'RETURNED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum FulfillmentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum ItemFulfillmentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export interface PaymentMethod {
  type: PaymentType
  provider: string
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  holderName?: string
}

export enum PaymentType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY'
}

export interface ShippingMethod {
  id: string
  name: string
  description?: string
  price: number
  estimatedDays: number
  trackingEnabled: boolean
}

export interface OrderRefund {
  id: string
  amount: number
  reason: string
  status: RefundStatus
  processedAt?: string
  items?: RefundItem[]
}

export enum RefundStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface RefundItem {
  orderItemId: string
  quantity: number
  amount: number
}

export interface OrderEvent {
  id: string
  type: OrderEventType
  title: string
  description?: string
  timestamp: string
  userId?: string
  metadata?: Record<string, any>
}

export enum OrderEventType {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  NOTE_ADDED = 'NOTE_ADDED'
}

// 리뷰 관련 타입
export interface ProductReview extends BaseEntity {
  productId: string
  userId?: string
  orderItemId?: string
  authorName: string
  authorEmail?: string
  rating: number
  title?: string
  comment: string
  images?: string[]
  verified: boolean
  helpful: number
  notHelpful: number
  status: ReviewStatus
  moderationNotes?: string
  response?: ReviewResponse
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SPAM = 'SPAM'
}

export interface ReviewResponse {
  id: string
  authorName: string
  comment: string
  createdAt: string
}

// 위시리스트 관련 타입
export interface Wishlist extends BaseEntity {
  userId: string
  name: string
  isDefault: boolean
  isPublic: boolean
  items: WishlistItem[]
}

export interface WishlistItem {
  id: string
  productId: string
  product: Product
  variantSelections?: Record<string, string>
  addedAt: string
  notes?: string
}

// 필터 및 검색 타입
export interface ProductFilters extends BaseFilters {
  categoryId?: string
  brandId?: string
  collectionId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  featured?: boolean
  onSale?: boolean
  rating?: number
  tags?: string[]
  attributes?: Record<string, string[]>
}

export interface ProductSearchResult {
  products: Product[]
  total: number
  page: number
  limit: number
  filters: {
    categories: { id: string; name: string; count: number }[]
    brands: { id: string; name: string; count: number }[]
    priceRange: { min: number; max: number }
    attributes: Record<string, { value: string; count: number }[]>
  }
}

// 통계 및 분석 타입
export interface ProductAnalytics {
  productId: string
  views: number
  cartAdds: number
  purchases: number
  revenue: number
  conversionRate: number
  averageRating: number
  reviewCount: number
  returnRate: number
  period: AnalyticsPeriod
}

export interface SalesAnalytics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  conversionRate: number
  topProducts: ProductSalesData[]
  topCategories: CategorySalesData[]
  salesByPeriod: SalesPeriodData[]
  period: AnalyticsPeriod
}

export interface ProductSalesData {
  productId: string
  productName: string
  quantity: number
  revenue: number
}

export interface CategorySalesData {
  categoryId: string
  categoryName: string
  orderCount: number
  revenue: number
}

export interface SalesPeriodData {
  period: string
  orders: number
  revenue: number
}

export enum AnalyticsPeriod {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_YEAR = 'THIS_YEAR',
  LAST_YEAR = 'LAST_YEAR',
  CUSTOM = 'CUSTOM'
}

// 이벤트 타입
export interface CommerceEvent {
  type: CommerceEventType
  userId?: string
  sessionId?: string
  productId?: string
  orderId?: string
  cartId?: string
  data?: Record<string, any>
  timestamp: string
}

export enum CommerceEventType {
  PRODUCT_VIEWED = 'PRODUCT_VIEWED',
  PRODUCT_ADDED_TO_CART = 'PRODUCT_ADDED_TO_CART',
  PRODUCT_REMOVED_FROM_CART = 'PRODUCT_REMOVED_FROM_CART',
  CART_VIEWED = 'CART_VIEWED',
  CHECKOUT_STARTED = 'CHECKOUT_STARTED',
  CHECKOUT_COMPLETED = 'CHECKOUT_COMPLETED',
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PRODUCT_REVIEWED = 'PRODUCT_REVIEWED',
  WISHLIST_ADDED = 'WISHLIST_ADDED',
  SEARCH_PERFORMED = 'SEARCH_PERFORMED'
}