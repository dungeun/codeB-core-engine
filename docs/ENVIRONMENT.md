# 🔧 환경 설정 가이드

이 가이드는 REVU Platform Core Engine의 환경 변수와 설정을 상세히 설명합니다.

## 📝 환경 파일 구조

### 환경 파일 종류
```bash
.env.example          # 템플릿 파일 (버전 관리 포함)
.env.local           # 로컬 개발용 (버전 관리 제외)
.env.development     # 개발 환경용
.env.staging         # 스테이징 환경용
.env.production      # 프로덕션 환경용
```

### 우선순위
1. `.env.local` (최고 우선순위)
2. `.env.development` / `.env.production`
3. `.env`
4. 시스템 환경 변수

## 🗄️ 데이터베이스 설정

### PostgreSQL 연결
```env
# 기본 설정
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# 연결 풀 설정
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?connection_limit=20&pool_timeout=20"

# SSL 연결 (프로덕션)
DATABASE_URL="postgresql://username:password@host:5432/database_name?sslmode=require"

# Supabase 연결 예시
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### Redis 캐시 설정
```env
# 로컬 Redis
REDIS_URL="redis://localhost:6379"

# Redis with 비밀번호
REDIS_URL="redis://:password@localhost:6379"

# Redis Cloud
REDIS_URL="redis://username:password@redis-server:port"

# Redis 캐시 비활성화 (개발용)
# REDIS_URL=""
```

## 🔐 인증 시스템 설정

### JWT 설정
```env
# JWT 시크릿 키 (32자 이상 권장)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# JWT 만료 시간
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# JWT 알고리즘
JWT_ALGORITHM="HS256"
```

### NextAuth.js 설정
```env
# NextAuth 기본 설정
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# 세션 설정
NEXTAUTH_SESSION_MAX_AGE="2592000"  # 30일
```

### 소셜 로그인 (선택사항)
```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Naver OAuth
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"

# Kakao OAuth
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
```

## 📁 파일 스토리지 설정

### 로컬 스토리지
```env
# 업로드 경로
UPLOAD_PATH="/uploads"
PUBLIC_UPLOAD_PATH="/public/uploads"

# 파일 크기 제한 (바이트)
MAX_FILE_SIZE="10485760"  # 10MB
MAX_IMAGE_SIZE="5242880"  # 5MB

# 허용 파일 형식
ALLOWED_IMAGE_TYPES="jpg,jpeg,png,gif,webp"
ALLOWED_FILE_TYPES="pdf,doc,docx,txt"
```

### 클라우드 스토리지 (AWS S3)
```env
# AWS S3 설정
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="ap-northeast-2"
AWS_S3_BUCKET="your-bucket-name"

# S3 CDN 설정
AWS_CLOUDFRONT_DOMAIN="https://your-domain.cloudfront.net"
```

## 🌐 외부 API 설정

### 번역 서비스
```env
# Google Translate API
GOOGLE_TRANSLATE_API_KEY="your-google-translate-key"

# Papago API
NAVER_PAPAGO_CLIENT_ID="your-papago-client-id"
NAVER_PAPAGO_CLIENT_SECRET="your-papago-client-secret"
```

### AI 서비스
```env
# OpenAI API
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-3.5-turbo"

# 클로드 API
CLAUDE_API_KEY="your-claude-api-key"
```

### 소셜 스크래핑
```env
# 인스타그램 스크래핑
INSTAGRAM_SESSION_ID="your-instagram-session"

# 유튜브 API
YOUTUBE_API_KEY="your-youtube-api-key"

# 네이버 블로그 스크래핑
NAVER_BLOG_API_KEY="your-naver-blog-key"
```

## 💳 결제 시스템 설정

### 국내 결제 (이니시스, KG이니시스 등)
```env
# 이니시스 설정
INICIS_MID="your-merchant-id"
INICIS_SIGN_KEY="your-sign-key"

# 결제 환경
PAYMENT_MODE="development"  # development | production
```

### 해외 결제 (Stripe)
```env
# Stripe 설정
STRIPE_PUBLISHABLE_KEY="pk_test_your-publishable-key"
STRIPE_SECRET_KEY="sk_test_your-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

## 📧 이메일 설정

### SMTP 설정
```env
# Gmail SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# SendGrid
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"
```

## 📊 모니터링 및 로깅

### 로깅 설정
```env
# 로그 레벨
LOG_LEVEL="info"  # error | warn | info | debug

# 로그 파일 경로
LOG_FILE_PATH="./logs/app.log"

# 로그 로테이션
LOG_MAX_SIZE="10MB"
LOG_MAX_FILES="5"
```

### 성능 모니터링
```env
# Sentry 오류 추적
SENTRY_DSN="your-sentry-dsn"

# Google Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# 성능 모니터링
ENABLE_PERFORMANCE_MONITORING="true"
```

## 🔧 개발 환경 설정

### 개발 도구
```env
# 개발 모드 설정
NODE_ENV="development"

# 디버그 모드
DEBUG="app:*"

# API 디버깅
API_DEBUG="true"

# 소스맵 생성
GENERATE_SOURCEMAP="true"
```

### 테스트 설정
```env
# 테스트 데이터베이스
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/test_database"

# 테스트 모드
JEST_WORKERS="1"
```

## 🚀 프로덕션 환경 설정

### 성능 최적화
```env
# Node.js 환경
NODE_ENV="production"

# 메모리 설정
NODE_OPTIONS="--max-old-space-size=4096"

# 캐시 설정
ENABLE_REDIS_CACHE="true"
CACHE_TTL="3600"  # 1시간

# 압축 활성화
ENABLE_COMPRESSION="true"
```

### 보안 설정
```env
# CORS 설정
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# 보안 헤더
ENABLE_SECURITY_HEADERS="true"

# 레이트 리미팅
RATE_LIMIT_REQUESTS="100"
RATE_LIMIT_WINDOW="900000"  # 15분

# HTTPS 강제
FORCE_HTTPS="true"
```

## 📱 모바일 앱 설정 (선택사항)

### 푸시 알림
```env
# FCM 설정
FCM_SERVER_KEY="your-fcm-server-key"
FCM_SENDER_ID="your-sender-id"

# APNS 설정 (iOS)
APNS_KEY_ID="your-apns-key-id"
APNS_TEAM_ID="your-team-id"
```

## 🌍 다국어 설정

### 언어 설정
```env
# 기본 언어
DEFAULT_LANGUAGE="ko"

# 지원 언어
SUPPORTED_LANGUAGES="ko,en,jp"

# 자동 번역 활성화
ENABLE_AUTO_TRANSLATION="true"
```

## 📋 환경별 설정 예시

### 로컬 개발 (.env.local)
```env
NODE_ENV="development"
DATABASE_URL="postgresql://postgres:password@localhost:5432/revu_dev"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="development-jwt-secret-key-32-chars"
REDIS_URL="redis://localhost:6379"
LOG_LEVEL="debug"
```

### 스테이징 (.env.staging)
```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@staging-db:5432/revu_staging"
NEXTAUTH_URL="https://staging.yourdomain.com"
JWT_SECRET="staging-jwt-secret-key-32-characters"
REDIS_URL="redis://staging-redis:6379"
LOG_LEVEL="info"
```

### 프로덕션 (.env.production)
```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@prod-db:5432/revu_prod"
NEXTAUTH_URL="https://yourdomain.com"
JWT_SECRET="production-super-secret-jwt-key-64-chars"
REDIS_URL="redis://prod-redis:6379"
LOG_LEVEL="warn"
ENABLE_SECURITY_HEADERS="true"
```

## 🔍 환경 변수 검증

### 검증 스크립트
```bash
# 환경 변수 확인
npm run env:check

# 또는 수동 확인
node -e "
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_URL'];
requiredVars.forEach(v => {
  if (!process.env[v]) console.error(\`Missing: \${v}\`);
});
"
```

### 검증 도구
```javascript
// scripts/check-env.js
const required = [
  'DATABASE_URL',
  'JWT_SECRET', 
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error('Missing environment variables:', missing);
  process.exit(1);
}
```

## 💡 보안 팁

1. **시크릿 키**: 최소 32자 이상의 랜덤 문자열 사용
2. **데이터베이스**: 강력한 비밀번호와 방화벽 설정
3. **API 키**: 필요한 권한만 부여
4. **환경 분리**: 개발/스테이징/프로덕션 환경 완전 분리
5. **정기 로테이션**: 시크릿 키 정기적 변경

환경 설정에 문제가 있으면 [문제 해결 가이드](./TROUBLESHOOTING.md)를 확인하세요.