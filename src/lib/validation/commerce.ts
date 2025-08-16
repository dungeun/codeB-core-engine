// Commerce 관련 Zod 검증 스키마
import { z } from 'zod'

// 제품 관련 스키마
export const ProductSchema = z.object({
  name: z.string()
    .min(1, '제품명은 필수입니다.')
    .min(2, '제품명은 최소 2자 이상이어야 합니다.')
    .max(100, '제품명은 100자를 초과할 수 없습니다.'),
  
  description: z.string()
    .min(1, '제품 설명은 필수입니다.')
    .min(10, '제품 설명은 최소 10자 이상이어야 합니다.')
    .max(2000, '제품 설명은 2000자를 초과할 수 없습니다.'),
  
  price: z.number()
    .min(0, '가격은 0 이상이어야 합니다.')
    .max(10000000, '가격은 1천만원을 초과할 수 없습니다.'),
  
  comparePrice: z.number()
    .min(0, '비교 가격은 0 이상이어야 합니다.')
    .optional(),
  
  category: z.string()
    .min(1, '카테고리는 필수입니다.'),
  
  subcategory: z.string().optional(),
  
  brand: z.string()
    .max(50, '브랜드명은 50자를 초과할 수 없습니다.')
    .optional(),
  
  sku: z.string()
    .min(1, 'SKU는 필수입니다.')
    .max(50, 'SKU는 50자를 초과할 수 없습니다.')
    .regex(/^[A-Z0-9-_]+$/, 'SKU는 영문 대문자, 숫자, 하이픈, 언더스코어만 사용 가능합니다.'),
  
  stock: z.number()
    .int('재고는 정수여야 합니다.')
    .min(0, '재고는 0 이상이어야 합니다.')
    .max(999999, '재고는 999,999개를 초과할 수 없습니다.'),
  
  featured: z.boolean().default(false),
  
  images: z.array(z.string().url('올바른 이미지 URL이 아닙니다.'))
    .min(1, '최소 1개의 이미지가 필요합니다.')
    .max(10, '최대 10개의 이미지만 업로드 가능합니다.'),
  
  tags: z.array(z.string().max(30, '태그는 30자를 초과할 수 없습니다.'))
    .max(20, '최대 20개의 태그만 추가 가능합니다.')
    .optional(),
  
  specifications: z.record(z.any()).optional()
}).refine((data) => {
  // 비교 가격이 있을 경우 실제 가격보다 높아야 함
  if (data.comparePrice && data.comparePrice <= data.price) {
    return false
  }
  return true
}, {
  message: '비교 가격은 실제 가격보다 높아야 합니다.',
  path: ['comparePrice']
})

// 장바구니 관련 스키마
export const AddToCartSchema = z.object({
  productId: z.string()
    .min(1, '제품 ID는 필수입니다.'),
  
  quantity: z.number()
    .int('수량은 정수여야 합니다.')
    .min(1, '최소 1개 이상 선택해야 합니다.')
    .max(99, '최대 99개까지만 주문 가능합니다.'),
  
  variants: z.record(z.any()).optional()
})

export const UpdateCartItemSchema = z.object({
  quantity: z.number()
    .int('수량은 정수여야 합니다.')
    .min(1, '최소 1개 이상이어야 합니다.')
    .max(99, '최대 99개까지만 주문 가능합니다.')
})

// 쿠폰 관련 스키마
export const CouponSchema = z.object({
  code: z.string()
    .min(1, '쿠폰 코드를 입력해주세요.')
    .min(3, '쿠폰 코드는 최소 3자 이상이어야 합니다.')
    .max(20, '쿠폰 코드는 20자를 초과할 수 없습니다.')
    .regex(/^[A-Z0-9-_]+$/, '쿠폰 코드는 영문 대문자, 숫자, 하이픈, 언더스코어만 사용 가능합니다.')
})

// 배송 주소 스키마
export const ShippingAddressSchema = z.object({
  fullName: z.string()
    .min(1, '받는 분 성함은 필수입니다.')
    .min(2, '성함은 최소 2자 이상이어야 합니다.')
    .max(50, '성함은 50자를 초과할 수 없습니다.'),
  
  phone: z.string()
    .min(1, '전화번호는 필수입니다.')
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)'),
  
  email: z.string()
    .min(1, '이메일은 필수입니다.')
    .email('올바른 이메일 형식이 아닙니다.'),
  
  address1: z.string()
    .min(1, '주소는 필수입니다.')
    .max(100, '주소는 100자를 초과할 수 없습니다.'),
  
  address2: z.string()
    .max(100, '상세주소는 100자를 초과할 수 없습니다.')
    .optional(),
  
  city: z.string()
    .min(1, '도시는 필수입니다.')
    .max(50, '도시명은 50자를 초과할 수 없습니다.'),
  
  state: z.string()
    .max(50, '주/도는 50자를 초과할 수 없습니다.')
    .optional(),
  
  postalCode: z.string()
    .min(1, '우편번호는 필수입니다.')
    .regex(/^\d{5}$/, '우편번호는 5자리 숫자여야 합니다.'),
  
  country: z.string()
    .min(1, '국가는 필수입니다.')
    .default('KR')
})

// 결제 정보 스키마
export const PaymentMethodSchema = z.object({
  method: z.enum(['credit_card', 'bank_transfer', 'toss_pay', 'kakao_pay', 'naver_pay'], {
    errorMap: () => ({ message: '올바른 결제 방법을 선택해주세요.' })
  })
})

export const CreditCardSchema = z.object({
  number: z.string()
    .min(1, '카드번호는 필수입니다.')
    .regex(/^\d{4}-?\d{4}-?\d{4}-?\d{4}$/, '올바른 카드번호 형식이 아닙니다. (예: 1234-5678-9012-3456)'),
  
  expiryMonth: z.string()
    .min(1, '만료월은 필수입니다.')
    .regex(/^(0[1-9]|1[0-2])$/, '만료월은 01~12 사이여야 합니다.'),
  
  expiryYear: z.string()
    .min(1, '만료년은 필수입니다.')
    .regex(/^\d{2}$/, '만료년은 2자리 숫자여야 합니다.'),
  
  cvv: z.string()
    .min(1, 'CVV는 필수입니다.')
    .regex(/^\d{3,4}$/, 'CVV는 3~4자리 숫자여야 합니다.'),
  
  holderName: z.string()
    .min(1, '카드 소유자명은 필수입니다.')
    .min(2, '카드 소유자명은 최소 2자 이상이어야 합니다.')
    .max(50, '카드 소유자명은 50자를 초과할 수 없습니다.')
}).refine((data) => {
  // 만료년 검증 (현재년도 이후여야 함)
  const currentYear = new Date().getFullYear() % 100
  const expiryYear = parseInt(data.expiryYear)
  return expiryYear >= currentYear
}, {
  message: '카드 만료년이 유효하지 않습니다.',
  path: ['expiryYear']
})

// 주문 생성 스키마
export const CreateOrderSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  
  billingAddress: z.object({
    sameAsShipping: z.boolean(),
    address: ShippingAddressSchema.optional()
  }).refine((data) => {
    // 청구지 주소가 배송지와 다를 경우 주소 정보 필수
    if (!data.sameAsShipping && !data.address) {
      return false
    }
    return true
  }, {
    message: '청구지 주소 정보를 입력해주세요.',
    path: ['address']
  }),
  
  paymentMethod: PaymentMethodSchema,
  
  cardDetails: CreditCardSchema.optional(),
  
  agreeToTerms: z.boolean()
    .refine(val => val === true, {
      message: '이용약관에 동의해주세요.'
    }),
  
  agreeToPrivacy: z.boolean()
    .refine(val => val === true, {
      message: '개인정보 처리방침에 동의해주세요.'
    }),
  
  notes: z.string()
    .max(500, '주문 메모는 500자를 초과할 수 없습니다.')
    .optional()
}).refine((data) => {
  // 신용카드 결제시 카드 정보 필수
  if (data.paymentMethod.method === 'credit_card' && !data.cardDetails) {
    return false
  }
  return true
}, {
  message: '카드 정보를 입력해주세요.',
  path: ['cardDetails']
})

// 주문 상태 업데이트 스키마
export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAYMENT_PENDING', 'PAYMENT_FAILED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'], {
    errorMap: () => ({ message: '올바른 주문 상태를 선택해주세요.' })
  }),
  
  trackingNumber: z.string()
    .max(100, '운송장 번호는 100자를 초과할 수 없습니다.')
    .optional(),
  
  notes: z.string()
    .max(500, '메모는 500자를 초과할 수 없습니다.')
    .optional(),
  
  reason: z.string()
    .max(200, '사유는 200자를 초과할 수 없습니다.')
    .optional()
}).refine((data) => {
  // 배송중 상태일 때 운송장 번호 필수
  if (data.status === 'SHIPPED' && !data.trackingNumber) {
    return false
  }
  return true
}, {
  message: '배송중 상태로 변경시 운송장 번호가 필요합니다.',
  path: ['trackingNumber']
}).refine((data) => {
  // 취소/환불 상태일 때 사유 필수
  if (['CANCELLED', 'REFUNDED'].includes(data.status) && !data.reason) {
    return false
  }
  return true
}, {
  message: '취소/환불시 사유를 입력해주세요.',
  path: ['reason']
})

// 타입 추출
export type ProductInput = z.infer<typeof ProductSchema>
export type AddToCartInput = z.infer<typeof AddToCartSchema>
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>
export type CouponInput = z.infer<typeof CouponSchema>
export type ShippingAddressInput = z.infer<typeof ShippingAddressSchema>
export type PaymentMethodInput = z.infer<typeof PaymentMethodSchema>
export type CreditCardInput = z.infer<typeof CreditCardSchema>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>