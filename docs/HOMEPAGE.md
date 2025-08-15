# 🏠 메인페이지 커스터마이징 가이드

REVU Platform Core Engine의 메인페이지를 커스터마이징하는 방법을 설명합니다.

## 🎯 메인페이지 구조

### 페이지 구성 요소
```
┌─────────────────────────────────────────────────────────────┐
│                       헤더 (Header)                        │
├─────────────────────────────────────────────────────────────┤
│                   히어로 섹션 (Hero)                       │
│                  - 슬라이드 배너                           │
│                  - 메인 메시지                             │
├─────────────────────────────────────────────────────────────┤
│                 카테고리 섹션 (Category)                   │  
│                  - 카테고리 아이콘                         │
│                  - 카테고리 링크                           │
├─────────────────────────────────────────────────────────────┤
│                퀵링크 섹션 (Quicklinks)                    │
│                  - 빠른 액세스 버튼                        │
├─────────────────────────────────────────────────────────────┤
│                프로모션 섹션 (Promo)                       │
│                  - 광고 배너                               │
├─────────────────────────────────────────────────────────────┤
│                랭킹 섹션 (Ranking)                         │
│                  - 인기 인플루언서                         │
├─────────────────────────────────────────────────────────────┤
│                추천 섹션 (Recommended)                     │
│                  - 추천 캠페인                             │
├─────────────────────────────────────────────────────────────┤
│                 캠페인 목록 (Campaigns)                    │
│                  - 진행중인 캠페인                         │
├─────────────────────────────────────────────────────────────┤
│                       푸터 (Footer)                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 파일 구조

### 핵심 파일들
```
src/
├── app/
│   └── page.tsx                    # 메인페이지 서버 컴포넌트
├── components/
│   ├── HomePage.tsx                # 메인페이지 클라이언트 컴포넌트
│   ├── Header.tsx                  # 헤더 컴포넌트
│   ├── Footer.tsx                  # 푸터 컴포넌트
│   └── home/
│       ├── AutoSlideBanner.tsx     # 히어로 슬라이드
│       ├── HomeSections.tsx        # 섹션 관리
│       ├── RankingSection.tsx      # 랭킹 섹션
│       └── RecommendedSection.tsx  # 추천 섹션
└── lib/
    └── stores/ui-config.store.ts   # UI 설정 스토어
```

## 🎨 히어로 섹션 커스터마이징

### 슬라이드 배너 설정

#### 어드민에서 설정
```
1. /admin/ui-config 접속
2. "히어로 슬라이드" 탭 선택
3. 새 슬라이드 추가/편집
```

#### 직접 코드 수정
```typescript
// src/components/home/AutoSlideBanner.tsx
const heroSlides = [
  {
    id: '1',
    title: '인플루언서와 함께하는\n브랜드 협업',
    subtitle: '당신의 브랜드를 세상에 알려보세요',
    bgColor: 'bg-gradient-to-r from-blue-600 to-purple-600',
    backgroundImage: '/images/hero-bg-1.jpg',
    link: '/campaigns',
    tag: 'NEW'
  },
  {
    id: '2', 
    title: '쉽고 빠른\n캠페인 관리',
    subtitle: '효과적인 마케팅을 경험해보세요',
    bgColor: 'bg-gradient-to-r from-green-600 to-blue-600',
    backgroundImage: '/images/hero-bg-2.jpg',
    link: '/business/dashboard'
  }
]
```

#### 슬라이드 스타일 커스터마이징
```css
/* globals.css에 추가 */
.hero-slide {
  @apply transition-transform duration-500 ease-out;
}

.hero-slide-active {
  @apply transform scale-105;
}

.hero-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 📂 카테고리 섹션 커스터마이징

### 카테고리 아이콘 변경

#### 기본 카테고리 설정
```typescript
// src/components/HomePage.tsx의 defaultCategoryIcons
const defaultCategoryIcons = {
  beauty: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor">
      {/* 뷰티 아이콘 SVG */}
    </svg>
  ),
  fashion: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor">
      {/* 패션 아이콘 SVG */}
    </svg>
  ),
  // 새 카테고리 추가
  gaming: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  )
}
```

#### 카테고리 반응형 설정
```typescript
// 모바일: 4열 그리드
<div className="grid grid-cols-4 gap-3 sm:hidden">
  {/* 모바일 카테고리 */}
</div>

// 데스크톱: 가로 스크롤
<div className="hidden sm:block overflow-x-auto">
  <div className="flex gap-2 lg:gap-2 pb-4 justify-center">
    {/* 데스크톱 카테고리 */}
  </div>
</div>
```

### 카테고리 데이터 관리

#### 어드민에서 관리
```
1. /admin/ui-config 접속
2. "카테고리" 탭 선택  
3. 카테고리 추가/편집/순서 변경
```

#### 데이터베이스 직접 추가
```sql
-- 새 카테고리 추가
INSERT INTO "UISection" (
  "type", "sectionId", "content", "visible", "order"
) VALUES (
  'category', 
  'main_categories',
  '{"categories": [{"id": "gaming", "categoryId": "gaming", "name": "게임", "icon": "🎮"}]}',
  true,
  2
);
```

## 🔗 퀵링크 섹션 커스터마이징

### 퀵링크 추가/편집
```typescript
const quicklinks = [
  {
    id: '1',
    title: '캠페인 등록',
    icon: '📢',
    link: '/campaigns/new'
  },
  {
    id: '2', 
    title: '인플루언서 찾기',
    icon: '👥',
    link: '/influencers'
  },
  {
    id: '3',
    title: '분석 보기',
    icon: '📊', 
    link: '/dashboard/analytics'
  }
]
```

### 퀵링크 스타일링
```css
.quicklink-card {
  @apply bg-gray-100 rounded-xl p-5 flex items-center justify-center gap-3;
  @apply hover:bg-blue-50 transition-colors group cursor-pointer;
}

.quicklink-icon {
  @apply text-2xl group-hover:scale-110 transition-transform;
}

.quicklink-text {
  @apply font-medium text-gray-800 group-hover:text-blue-600;
}
```

## 🎯 프로모션 섹션 커스터마이징

### 프로모션 배너 설정
```typescript
const promoBanner = {
  title: '신규 가입 이벤트',
  subtitle: '지금 가입하고 첫 캠페인 수수료 50% 할인!',
  backgroundColor: '#FEF3C7',
  textColor: '#92400E',
  backgroundImage: '/images/promo-bg.jpg',
  icon: '🎉',
  link: '/register'
}
```

### 동적 프로모션 관리
```typescript
// 시간별 프로모션 변경
function getDynamicPromo() {
  const hour = new Date().getHours()
  
  if (hour >= 9 && hour <= 17) {
    return {
      title: '비즈니스 시간 특가',
      subtitle: '오늘만! 프리미엄 캠페인 30% 할인',
      backgroundColor: '#DBEAFE',
      textColor: '#1E40AF'
    }
  } else {
    return {
      title: '나이트 프로모션', 
      subtitle: '밤늦게까지 수고하는 당신을 위한 특별가',
      backgroundColor: '#F3E8FF',
      textColor: '#7C3AED'
    }
  }
}
```

## 📈 랭킹/추천 섹션 커스터마이징

### 랭킹 로직 커스터마이징
```typescript
// src/components/home/RankingSection.tsx
async function getTopInfluencers() {
  return await prisma.user.findMany({
    where: { type: 'INFLUENCER' },
    orderBy: [
      { followersCount: 'desc' },
      { engagementRate: 'desc' },
      { successfulCampaigns: 'desc' }
    ],
    take: 10,
    include: {
      profile: true,
      _count: {
        select: { campaigns: true }
      }
    }
  })
}
```

### 추천 알고리즘 커스터마이징
```typescript
// src/components/home/RecommendedSection.tsx
async function getRecommendedCampaigns(userId?: string) {
  if (userId) {
    // 개인화된 추천
    const userInterests = await getUserInterests(userId)
    return await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE',
        category: { in: userInterests }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    })
  } else {
    // 일반 추천
    return await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { applicationCount: 'desc' },
      take: 8
    })
  }
}
```

## 🎨 전체 테마 커스터마이징

### 색상 테마 변경
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        secondary: {
          50: '#f8fafc', 
          500: '#64748b',
          600: '#475569'
        }
      }
    }
  }
}
```

### 폰트 커스터마이징
```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

body {
  font-family: 'Noto Sans KR', sans-serif;
}

.hero-title {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
}
```

## 📱 반응형 최적화

### 브레이크포인트 설정
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px', 
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px'
    }
  }
}
```

### 모바일 최적화
```typescript
// 모바일 전용 컴포넌트
function MobileHeroSection() {
  return (
    <div className="block sm:hidden">
      {/* 모바일 최적화된 히어로 */}
      <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">
            모바일 특화 메시지
          </h1>
          <p className="text-sm opacity-90">
            간단하고 명확한 설명
          </p>
        </div>
      </div>
    </div>
  )
}
```

## 🚀 성능 최적화

### 이미지 최적화
```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image'

function OptimizedHeroImage() {
  return (
    <Image
      src="/images/hero-bg.jpg"
      alt="Hero Background"
      width={1920}
      height={1080}
      priority
      className="object-cover"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}
```

### 지연 로딩
```typescript
import dynamic from 'next/dynamic'

// 비중요 섹션 지연 로딩
const RankingSection = dynamic(() => import('@/components/home/RankingSection'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
})

const RecommendedSection = dynamic(() => import('@/components/home/RecommendedSection'), {
  ssr: false
})
```

## 🌍 다국어 지원

### 섹션별 번역 설정
```typescript
// 언어별 섹션 컨텐츠
const heroContent = {
  ko: {
    title: '인플루언서와 함께하는\n브랜드 협업',
    subtitle: '당신의 브랜드를 세상에 알려보세요'
  },
  en: {
    title: 'Brand Collaboration\nwith Influencers', 
    subtitle: 'Let the world know about your brand'
  },
  jp: {
    title: 'インフルエンサーとの\nブランドコラボ',
    subtitle: 'あなたのブランドを世界に知らせましょう'
  }
}
```

## 🔧 섹션 순서 관리

### 동적 섹션 순서
```typescript
// 어드민에서 설정 가능한 섹션 순서
const sectionOrder = [
  { type: 'hero', order: 1, visible: true },
  { type: 'category', order: 2, visible: true },
  { type: 'quicklinks', order: 3, visible: true },
  { type: 'promo', order: 4, visible: false },
  { type: 'ranking', order: 5, visible: true },
  { type: 'recommended', order: 6, visible: true }
]

// 조건부 섹션 표시
const visibleSections = sectionOrder
  .filter(section => section.visible)
  .sort((a, b) => a.order - b.order)
```

## 📊 A/B 테스트

### 섹션별 A/B 테스트
```typescript
// 히어로 섹션 A/B 테스트
function HeroSectionAB() {
  const variant = Math.random() > 0.5 ? 'A' : 'B'
  
  if (variant === 'A') {
    return <HeroSectionOriginal />
  } else {
    return <HeroSectionNew />
  }
}

// 분석 데이터 수집
function trackHeroInteraction(variant: string, action: string) {
  analytics.track('hero_interaction', {
    variant,
    action,
    timestamp: new Date()
  })
}
```

메인페이지 커스터마이징에 대한 추가 정보는 [UI 설정 가이드](./UI-CONFIG.md)를 참조하세요.