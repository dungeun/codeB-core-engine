# 👨‍💼 어드민 시스템 가이드

REVU Platform Core Engine의 완전한 어드민 시스템 사용법을 설명합니다.

## 🎯 어드민 시스템 개요

### 주요 기능
- **대시보드**: 실시간 통계 및 시스템 상태
- **사용자 관리**: 인플루언서/비즈니스 사용자 관리
- **캠페인 관리**: 캠페인 승인/거부, 모니터링
- **콘텐츠 관리**: 게시물, 파일, 미디어 관리
- **결제 관리**: 정산, 수수료, 결제 내역
- **시스템 설정**: UI 구성, 언어팩, 번역 관리
- **분석 도구**: 리포트, 통계, 성과 분석

### 접속 정보
- **URL**: `http://localhost:3000/admin`
- **기본 계정**: `admin@example.com` / `admin123`

## 🚀 초기 설정

### 1. 관리자 계정 생성
```bash
# 새 관리자 계정 생성
node scripts/create-admin-user.js

# 또는 직접 데이터베이스에 추가
npm run seed:admin
```

### 2. 기본 데이터 설정
```bash
# 카테고리 설정
node scripts/setup-main-categories.js

# 언어팩 설정
node scripts/seed-ui-config-language-packs.js

# UI 섹션 설정
node scripts/seed-ui-sections.js
```

## 📊 대시보드

### 주요 위젯
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   총 사용자     │   활성 캠페인   │   월간 매출     │   대기 승인     │
│     1,234       │       45        │   ₩12,345,678   │       12        │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          최근 활동                                      │
│  • 새 캠페인 신청: "뷰티 브랜드 협업" - 2분 전                          │
│  • 사용자 가입: 인플루언서 jane@example.com - 5분 전                   │  
│  • 결제 완료: 캠페인 #123 정산 - 10분 전                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                       시스템 알림                                       │
│  ⚠️  대기 중인 캠페인 승인 12건                                        │
│  ℹ️  정산 처리 예정 금액: ₩2,345,678                                   │
│  🔧 시스템 점검 예정: 2025-08-20 02:00                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 대시보드 커스터마이징
- `src/app/admin/page.tsx` 수정
- `src/components/admin/dashboard/` 컴포넌트 활용

## 👥 사용자 관리

### 사용자 목록
```
경로: /admin/users
```

#### 주요 기능
- **사용자 검색**: 이름, 이메일, 타입별 검색
- **필터링**: 가입일, 상태, 사용자 타입
- **사용자 상세**: 프로필, 활동 내역, 통계
- **계정 관리**: 활성화/비활성화, 권한 변경

#### 사용자 타입
- **INFLUENCER**: 인플루언서 사용자
- **BUSINESS**: 비즈니스 사용자  
- **ADMIN**: 관리자

### 사용자 상세 관리
```typescript
// 사용자 상태 변경
async function updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
  await prisma.user.update({
    where: { id: userId },
    data: { status }
  })
}
```

## 📢 캠페인 관리

### 캠페인 목록
```
경로: /admin/campaigns
```

#### 주요 기능
- **승인/거부 처리**: 캠페인 심사 및 피드백
- **상태 모니터링**: 진행 상황 추적
- **성과 분석**: 참여율, 성과 지표
- **수수료 설정**: 플랫폼 수수료 관리

#### 캠페인 상태
- **DRAFT**: 초안
- **PENDING**: 승인 대기
- **APPROVED**: 승인됨
- **ACTIVE**: 진행 중
- **COMPLETED**: 완료
- **REJECTED**: 거부됨

### 승인 프로세스
```typescript
// 캠페인 승인
async function approveCampaign(campaignId: string, adminId: string) {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'APPROVED',
      approvedBy: adminId,
      approvedAt: new Date()
    }
  })
  
  // 알림 발송
  await sendNotification(campaign.businessId, 'CAMPAIGN_APPROVED')
}
```

## 💰 결제 및 정산 관리

### 결제 내역
```
경로: /admin/payments
```

#### 주요 기능
- **결제 내역 조회**: 모든 결제 거래 내역
- **정산 관리**: 인플루언서 정산 처리
- **수수료 관리**: 플랫폼 수수료 설정
- **환불 처리**: 결제 취소 및 환불

### 정산 시스템
```
경로: /admin/settlements
```

#### 정산 프로세스
1. **자동 정산**: 매월 15일 자동 실행
2. **수수료 차감**: 플랫폼 수수료 (기본 10%)
3. **세금 처리**: 원천징수 계산
4. **지급 처리**: 계좌 이체 또는 가상계좌

```typescript
// 정산 처리 예시
async function processSettlement(influencerId: string, amount: number) {
  const fee = amount * 0.1 // 10% 수수료
  const tax = amount * 0.033 // 3.3% 세금
  const finalAmount = amount - fee - tax
  
  await prisma.settlement.create({
    data: {
      influencerId,
      originalAmount: amount,
      platformFee: fee,
      tax,
      finalAmount,
      status: 'PENDING'
    }
  })
}
```

## 🎨 UI 설정 관리

### UI 구성 요소
```
경로: /admin/ui-config
```

#### 메인페이지 섹션 관리
- **히어로 슬라이드**: 메인 배너 관리
- **카테고리 섹션**: 카테고리 아이콘 및 링크
- **퀵링크**: 빠른 액세스 링크
- **프로모션**: 광고 배너 관리

#### 헤더/푸터 설정
- **메뉴 구성**: 네비게이션 메뉴 관리
- **언어 설정**: 다국어 메뉴 구성
- **푸터 링크**: 하단 링크 및 정보

### 섹션 순서 변경
```typescript
// 섹션 순서 업데이트
async function updateSectionOrder(sections: Array<{id: string, order: number}>) {
  for (const section of sections) {
    await prisma.uISection.update({
      where: { id: section.id },
      data: { order: section.order }
    })
  }
}
```

## 🌍 언어 및 번역 관리

### 언어팩 관리
```
경로: /admin/language-packs
```

#### 지원 언어
- **한국어 (ko)**: 기본 언어
- **영어 (en)**: 영어
- **일본어 (jp)**: 일본어

#### 번역 키 추가
```typescript
// 새 번역 키 추가
async function addTranslationKey(key: string, translations: {
  ko: string
  en: string
  jp: string
}) {
  await prisma.languagePack.create({
    data: {
      key,
      ko: translations.ko,
      en: translations.en,
      jp: translations.jp
    }
  })
}
```

### 자동 번역
```
경로: /admin/translations/auto
```

#### Google Translate API 연동
```typescript
// 자동 번역 실행
async function autoTranslate(text: string, targetLang: string) {
  const [translation] = await translate.translate(text, targetLang)
  return translation
}
```

## 📈 분석 및 리포트

### 분석 대시보드
```
경로: /admin/analytics
```

#### 주요 지표
- **사용자 증가율**: 일/주/월별 신규 가입자
- **캠페인 성과**: 참여율, 완주율, 만족도
- **매출 분석**: 월별 매출, 수수료 수익
- **플랫폼 활성도**: DAU, MAU, 체류시간

### 리포트 생성
```
경로: /admin/reports
```

#### 리포트 타입
- **사용자 리포트**: 가입자 현황, 활동 분석
- **캠페인 리포트**: 성과 분석, ROI 계산
- **매출 리포트**: 수익 분석, 정산 내역
- **시스템 리포트**: 성능, 오류, 사용량

## 🛠️ 시스템 설정

### 설정 관리
```
경로: /admin/settings
```

#### 주요 설정
- **플랫폼 설정**: 수수료율, 정산 주기
- **알림 설정**: 이메일, SMS, 푸시 알림
- **보안 설정**: 로그인 정책, 세션 관리
- **API 설정**: 외부 연동, 웹훅 URL

### 환경 설정
```typescript
// 시스템 설정 업데이트
async function updateSystemSettings(settings: {
  platformFeeRate: number
  settlementPeriod: number
  maxFileSize: number
}) {
  await prisma.systemSettings.upsert({
    where: { key: 'platform' },
    update: { value: JSON.stringify(settings) },
    create: { key: 'platform', value: JSON.stringify(settings) }
  })
}
```

## 🔧 개발자 도구

### API 관리
```
경로: /admin/api-config
```

#### API 모니터링
- **응답 시간**: API 엔드포인트별 성능
- **오류율**: 4xx, 5xx 오류 통계
- **사용량**: API 호출 빈도 및 패턴
- **레이트 리미팅**: API 제한 설정

### 로그 관리
```bash
# 로그 확인
tail -f logs/admin.log

# 오류 로그 필터링
grep "ERROR" logs/app.log

# API 로그 분석
node scripts/analyze-logs.js
```

## 🚨 문제 해결

### 일반적인 문제

#### 1. 어드민 접속 불가
```bash
# 관리자 계정 확인
npm run check:admin

# 비밀번호 재설정
node scripts/reset-admin-password.js
```

#### 2. UI 설정 오류
```bash
# UI 캐시 클리어
npm run clear:ui-cache

# 기본 설정 복원
node scripts/restore-default-ui.js
```

#### 3. 번역 오류
```bash
# 언어팩 검증
npm run validate:translations

# 누락된 번역 키 추가
node scripts/add-missing-translations.js
```

## 📚 커스터마이징

### 어드민 테마 변경
```typescript
// tailwind.config.js에서 어드민 테마 설정
module.exports = {
  theme: {
    extend: {
      colors: {
        admin: {
          primary: '#3B82F6',
          secondary: '#64748B',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        }
      }
    }
  }
}
```

### 새 관리 페이지 추가
```typescript
// src/app/admin/my-feature/page.tsx
export default function MyFeaturePage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">새 기능</h1>
        {/* 커스텀 컨텐츠 */}
      </div>
    </AdminLayout>
  )
}
```

### 권한 시스템 확장
```typescript
// 새 권한 추가
enum AdminPermission {
  USER_MANAGE = 'user_manage',
  CAMPAIGN_APPROVE = 'campaign_approve',
  PAYMENT_PROCESS = 'payment_process',
  SYSTEM_CONFIG = 'system_config',
  // 새 권한 추가
  ANALYTICS_VIEW = 'analytics_view'
}
```

어드민 시스템 사용 중 문제가 발생하면 [API 문서](./API.md)나 [문제 해결 가이드](./TROUBLESHOOTING.md)를 참조하세요.