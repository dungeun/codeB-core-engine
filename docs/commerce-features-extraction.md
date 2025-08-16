# 커머스 프로젝트 핵심 기능 추출 결과

## 📊 개요
커머스 프로젝트에서 코어 엔진으로 통합할 핵심 기능들을 체계적으로 분석하고 추출했습니다.

## 🗃️ 1. 데이터베이스 모델 (Prisma Schema)

### 핵심 커머스 모델
```prisma
// 제품 관리
model Product {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  description String?
  price       Int
  compareAt   Int?
  cost        Int?
  sku         String?       @unique
  stock       Int           @default(0)
  categoryId  String?
  status      ProductStatus @default(DRAFT)
  // ... 이미지, 리뷰, 변형 등 관계
}

// 장바구니 시스템
model Cart {
  id        String     @id @default(cuid())
  userId    String?    @unique
  sessionId String?    @unique
  items     CartItem[]
}

model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  productId String
  quantity  Int
  variant   Json?
}

// 주문 관리
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  userId          String?
  status          OrderStatus @default(PENDING)
  subtotal        Int
  tax             Int         @default(0)
  shipping        Int         @default(0)
  total           Int
  shippingAddress Json
  billingAddress  Json?
  items           OrderItem[]
}

// 결제 시스템
model Payment {
  id            String        @id @default(cuid())
  orderId       String        @unique
  provider      String
  method        PaymentMethod
  status        PaymentStatus @default(PENDING)
  amount        Int
  currency      String        @default("KRW")
}
```

### 비즈니스 확장 모델
```prisma
// B2B 기능
model BusinessAccount {
  id              String         @id @default(cuid())
  userId          String         @unique
  businessNumber  String         @unique
  companyName     String
  creditLimit     Decimal        @default(0)
  tier            BusinessTier   @default(BRONZE)
}

// 재고 관리
model Inventory {
  id         String @id @default(cuid())
  productId  String
  locationId String
  quantity   Int
  reserved   Int    @default(0)
  available  Int
}

// 리뷰 시스템
model Review {
  id        String   @id @default(cuid())
  productId String
  userId    String
  rating    Int
  title     String?
  content   String?
  verified  Boolean  @default(false)
}
```

## 🌐 2. API 엔드포인트

### 제품 API (`/api/products`)
```typescript
// GET - 제품 목록 조회 (페이징, 검색, 필터링)
// POST - 새 제품 생성
interface ProductAPI {
  // 쿼리 파라미터
  page?: number
  limit?: number
  category?: string
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  
  // 응답 구조
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

### 장바구니 API (`/api/cart`)
```typescript
// GET - 장바구니 조회 (로그인/비로그인 사용자)
// POST - 상품 추가
// DELETE - 상품 제거
interface CartAPI {
  // 세션 기반 장바구니 (비로그인)
  sessionId: string
  
  // 사용자 기반 장바구니 (로그인)
  userId: string
  
  // 장바구니 아이템
  items: CartItem[]
}
```

### 결제 API (`/api/payment`)
```typescript
// 토스페이먼츠 연동
// POST /api/payment/create - 결제 생성
// POST /api/payment/confirm - 결제 승인
// POST /api/payment/refund - 환불 처리
interface PaymentAPI {
  provider: 'toss' | 'kakaopay' | 'naverpay'
  method: PaymentMethod
  amount: number
  orderId: string
}
```

## 🎨 3. UI 컴포넌트

### 제품 컴포넌트
- `ProductCard.tsx` - 제품 카드 레이아웃
- `AddToCartButton.tsx` - 장바구니 추가 버튼
- `ProductReviews.tsx` - 제품 리뷰 컴포넌트
- `RelatedProducts.tsx` - 관련 상품 추천

### 섹션 컴포넌트
```typescript
// 홈페이지 섹션들
- HeroSection.tsx      // 메인 배너
- CategorySection.tsx  // 카테고리 메뉴
- BestSellers.tsx      // 베스트셀러
- NewArrivals.tsx      // 신상품
- FlashSale.tsx        // 플래시 세일
- RecommendedProducts.tsx // 추천 상품
- SpecialOffers.tsx    // 특가 혜택
```

### 관리자 컴포넌트
- `dashboard-stats.tsx` - 대시보드 통계
- `recent-orders.tsx` - 최근 주문
- `sales-chart.tsx` - 매출 차트
- `top-products.tsx` - 인기 상품

## 🔧 4. 핵심 기능별 분석

### A. 제품 관리 시스템
**통합 우선순위**: ⭐⭐⭐⭐⭐
- **모델**: Product, ProductImage, ProductVariant, Category
- **API**: `/api/products` (CRUD 완성)
- **UI**: ProductCard, 제품 상세 페이지
- **특징**: 
  - SKU 관리, 재고 추적
  - 변형 상품 지원 (옵션, 가격)
  - 이미지 다중 업로드
  - SEO 메타데이터

### B. 장바구니 시스템
**통합 우선순위**: ⭐⭐⭐⭐⭐
- **모델**: Cart, CartItem
- **API**: `/api/cart` (세션/사용자 기반)
- **특징**:
  - 로그인/비로그인 사용자 지원
  - 세션 쿠키 기반 임시 장바구니
  - 재고 확인 및 수량 제한
  - 변형 상품 지원

### C. 주문 및 결제 시스템
**통합 우선순위**: ⭐⭐⭐⭐⭐
- **모델**: Order, OrderItem, Payment, Refund
- **API**: `/api/payment/*` (토스페이먼츠 연동)
- **특징**:
  - 다양한 결제 수단 지원
  - 주문 상태 관리 (대기→결제→배송→완료)
  - 환불 처리 시스템
  - 주문 번호 자동 생성

### D. 비즈니스 확장 기능
**통합 우선순위**: ⭐⭐⭐
- **B2B 기능**: BusinessAccount, 신용 한도, 등급 관리
- **재고 관리**: Inventory, 위치별 재고, 예약 시스템
- **세금계산서**: TaxInvoice, 전자세금계산서 발행
- **할인 시스템**: Coupon, UserCoupon, 포인트 적립

## 🚀 5. 통합 권장사항

### 즉시 통합 대상 (Phase 1)
1. **Product 모델** - 기본 제품 관리
2. **Cart 시스템** - 장바구니 기능
3. **기본 UI 컴포넌트** - ProductCard, AddToCartButton
4. **제품 API** - `/api/products` CRUD

### 2차 통합 대상 (Phase 2)
1. **Order 시스템** - 주문 관리
2. **Payment 연동** - 토스페이먼츠
3. **Category 관리** - 카테고리 분류
4. **관리자 대시보드** - 통계 및 관리 도구

### 3차 확장 대상 (Phase 3)
1. **B2B 기능** - 기업 계정, 신용 거래
2. **고급 재고 관리** - 다중 창고, 예약 시스템
3. **마케팅 도구** - 쿠폰, 포인트, A/B 테스트
4. **분석 도구** - 매출 분석, 고객 세그먼트

## 📋 6. 코드 재사용성 평가

### 높은 재사용성 (95%+)
- Prisma 모델 정의
- API 라우트 로직
- TypeScript 인터페이스
- 유틸리티 함수

### 중간 재사용성 (70-90%)
- UI 컴포넌트 (스타일 조정 필요)
- 관리자 페이지 (권한 시스템 통합)
- 언어팩 구조

### 낮은 재사용성 (30-50%)
- 라우팅 구조 (Next.js App Router)
- 전역 상태 관리
- 테마 및 디자인 시스템

## 🎯 7. 다음 단계

1. **데이터베이스 스키마 통합** - 코어 엔진 스키마에 커머스 모델 추가
2. **API 라우트 이전** - `/api/commerce/` 네임스페이스로 구성
3. **UI 컴포넌트 적응** - 코어 엔진 디자인 시스템에 맞게 조정
4. **관리자 메뉴 확장** - 상품관리, 주문관리 메뉴 추가
5. **언어팩 확장** - 커머스 관련 번역키 추가

---

이 문서는 커머스 프로젝트의 핵심 기능을 체계적으로 분석한 결과입니다. 코어 엔진과의 통합 시 이 가이드를 참조하여 단계적으로 진행하시기 바랍니다.