# 🚀 REVU Platform Core Engine

**재사용 가능한 웹 플랫폼 코어 엔진** - 어드민 시스템과 메인페이지를 포함한 완전한 웹 플랫폼 기반

## 📋 개요

이 코어 엔진은 다음과 같은 완전한 기능을 제공합니다:

### 🎯 핵심 기능
- **어드민 시스템**: 완전한 관리자 대시보드
- **메인 페이지**: 반응형 홈페이지 시스템
- **사용자 관리**: 인플루언서/비즈니스 사용자 시스템
- **캠페인 관리**: 완전한 캠페인 라이프사이클
- **다국어 지원**: 한국어/영어/일본어
- **결제 시스템**: 정산 및 결제 처리
- **콘텐츠 관리**: 파일 업로드 및 관리

### 🏗️ 기술 스택
- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL, Prisma ORM
- **Cache**: Redis
- **Auth**: JWT
- **Storage**: Local/Cloud Storage

## 📁 프로젝트 구조

```
revu-platform-core-engine/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # 어드민 시스템
│   │   ├── api/               # API Routes
│   │   ├── business/          # 비즈니스 대시보드
│   │   ├── campaigns/         # 캠페인 페이지
│   │   └── dashboard/         # 사용자 대시보드
│   ├── components/            # React 컴포넌트
│   │   ├── admin/            # 어드민 컴포넌트
│   │   ├── ui/               # 공통 UI 컴포넌트
│   │   └── ...
│   ├── lib/                   # 유틸리티 라이브러리
│   │   ├── auth/             # 인증 시스템
│   │   ├── db/               # 데이터베이스
│   │   └── services/         # 비즈니스 로직
│   └── types/                 # TypeScript 타입
├── prisma/                    # 데이터베이스 스키마
├── public/                    # 정적 파일
├── scripts/                   # 유틸리티 스크립트
└── docs/                      # 문서
```

## 🚀 빠른 시작

### 1. 프로젝트 설정
```bash
# 새 프로젝트 폴더 생성
mkdir my-new-project
cd my-new-project

# 코어 엔진 파일 복사
cp -r ~/Documents/revu-platform-core-engine/* .

# 의존성 설치
npm install
```

### 2. 환경 변수 설정
```bash
# 환경 변수 파일 생성
cp .env.example .env.local

# 필수 환경 변수 설정 (아래 참조)
```

### 3. 데이터베이스 설정
```bash
# Prisma 설정
npx prisma generate
npx prisma db push

# 초기 데이터 시드
npm run seed
```

### 4. 개발 서버 실행
```bash
npm run dev
```

## ⚙️ 상세 설치 가이드

자세한 설치 및 설정 방법은 다음 문서를 참조하세요:

- 📖 [설치 가이드](./docs/INSTALLATION.md)
- 🔧 [환경 설정](./docs/ENVIRONMENT.md)
- 🗄️ [데이터베이스 설정](./docs/DATABASE.md)
- 👨‍💼 [어드민 시스템](./docs/ADMIN.md)
- 🌐 [메인페이지 커스터마이징](./docs/HOMEPAGE.md)
- 🌍 [다국어 설정](./docs/LANGUAGE.md)
- 🚀 [배포 가이드](./docs/DEPLOYMENT.md)

## 📚 기능별 가이드

### 어드민 시스템
- 사용자 관리
- 캠페인 관리
- 콘텐츠 관리
- 분석 대시보드
- UI 설정

### 메인페이지
- 히어로 슬라이드
- 카테고리 섹션
- 캠페인 추천
- 반응형 디자인

### 사용자 시스템
- 회원가입/로그인
- 프로필 관리
- 대시보드
- 알림 시스템

## 🔧 커스터마이징

이 코어 엔진은 쉽게 커스터마이징할 수 있도록 설계되었습니다:

1. **브랜딩**: 로고, 색상, 폰트 변경
2. **레이아웃**: 메인페이지 섹션 재배치
3. **기능**: 새로운 기능 모듈 추가
4. **언어**: 새로운 언어 추가

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. [문제 해결 가이드](./docs/TROUBLESHOOTING.md) 확인
2. [API 문서](./docs/API.md) 참조
3. [예제 프로젝트](./docs/EXAMPLES.md) 확인

## 📄 라이선스

이 프로젝트는 상업적 용도로 자유롭게 사용 가능합니다.

---

**Created by REVU Platform Team** - 2025