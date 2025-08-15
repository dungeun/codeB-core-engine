# 📦 설치 가이드

이 가이드는 REVU Platform Core Engine을 처음부터 설치하는 방법을 단계별로 설명합니다.

## 🔧 시스템 요구사항

### 필수 요구사항
- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상 또는 **yarn**: 1.22.0 이상
- **PostgreSQL**: 13.0 이상
- **Redis**: 6.0 이상 (선택사항)

### 권장 환경
- **OS**: macOS, Linux, Windows (WSL2)
- **RAM**: 4GB 이상
- **Storage**: 1GB 이상 여유 공간

## 📁 1. 프로젝트 설정

### 새 프로젝트 생성
```bash
# 프로젝트 폴더 생성
mkdir my-platform
cd my-platform

# 코어 엔진 파일 복사
cp -r ~/Documents/revu-platform-core-engine/* .

# Git 초기화 (선택사항)
git init
git add .
git commit -m "Initial commit with REVU Core Engine"
```

### 프로젝트 구조 확인
```bash
# 주요 폴더 확인
ls -la
# 예상 출력:
# src/         <- 소스 코드
# prisma/      <- 데이터베이스 스키마
# public/      <- 정적 파일
# package.json <- 패키지 설정
```

## 📦 2. 의존성 설치

### NPM을 사용하는 경우
```bash
npm install
```

### Yarn을 사용하는 경우
```bash
yarn install
```

### 설치 확인
```bash
# 설치된 패키지 확인
npm list --depth=0

# 주요 패키지 확인
npm list next react prisma
```

## 🗄️ 3. 데이터베이스 설정

### PostgreSQL 설치 및 설정

#### macOS (Homebrew)
```bash
# PostgreSQL 설치
brew install postgresql@15

# 서비스 시작
brew services start postgresql@15

# 데이터베이스 생성
createdb my_platform_db
```

#### Ubuntu/Debian
```bash
# PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 데이터베이스 생성
sudo -u postgres createdb my_platform_db
sudo -u postgres createuser --interactive
```

#### Windows
1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 설치
2. pgAdmin을 사용하여 데이터베이스 생성

### 데이터베이스 연결 확인
```bash
# PostgreSQL 연결 테스트
psql -h localhost -d my_platform_db -U your_username
```

## 🔧 4. 환경 변수 설정

### 환경 파일 생성
```bash
# 템플릿에서 환경 파일 생성
cp .env.example .env.local
```

### 필수 환경 변수 설정
`.env.local` 파일을 편집하여 다음 값들을 설정:

```env
# 데이터베이스 연결
DATABASE_URL="postgresql://username:password@localhost:5432/my_platform_db"

# NextAuth.js 설정
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# JWT 설정
JWT_SECRET="your-jwt-secret-here"

# Redis (선택사항)
REDIS_URL="redis://localhost:6379"

# 파일 업로드
UPLOAD_PATH="/uploads"
MAX_FILE_SIZE="10485760"

# 외부 API (필요시)
# OPENAI_API_KEY="your-openai-key"
# GOOGLE_TRANSLATE_API_KEY="your-google-key"
```

### 환경 변수 생성 도구
```bash
# 무작위 시크릿 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🛠️ 5. Prisma 설정

### Prisma 클라이언트 생성
```bash
# Prisma 클라이언트 생성
npx prisma generate
```

### 데이터베이스 스키마 적용
```bash
# 데이터베이스에 스키마 적용
npx prisma db push
```

### 데이터베이스 확인
```bash
# Prisma Studio로 데이터베이스 확인
npx prisma studio
# 브라우저에서 http://localhost:5555 열림
```

## 🌱 6. 초기 데이터 설정

### 기본 시드 실행
```bash
# 초기 데이터 생성
npm run seed

# 또는 개별 시드 실행
node prisma/seed-local.js
```

### 관리자 계정 생성
```bash
# 관리자 계정 생성 스크립트
node scripts/create-admin-user.js
```

### 데모 데이터 생성 (선택사항)
```bash
# 데모 계정 및 캠페인 생성
node scripts/create-demo-accounts.js
```

## 🚀 7. 개발 서버 실행

### 개발 서버 시작
```bash
npm run dev
```

### 접속 확인
브라우저에서 다음 URL들을 확인:

- **메인페이지**: http://localhost:3000
- **어드민**: http://localhost:3000/admin
- **API 상태**: http://localhost:3000/api/health

## ✅ 8. 설치 검증

### 기능 테스트
```bash
# API 엔드포인트 테스트
npm run test:api

# 데이터베이스 연결 테스트
npm run test:db

# 인증 시스템 테스트
npm run test:auth
```

### 로그인 테스트
1. **어드민 로그인**: 
   - URL: http://localhost:3000/admin
   - 계정: `admin@example.com` / `admin123`

2. **일반 사용자 로그인**:
   - URL: http://localhost:3000/login
   - 계정: `user@example.com` / `user123`

## 🚨 문제 해결

### 일반적인 문제들

#### 1. 데이터베이스 연결 오류
```bash
# 연결 문자열 확인
echo $DATABASE_URL

# PostgreSQL 서비스 상태 확인
# macOS
brew services list | grep postgresql

# Linux
systemctl status postgresql
```

#### 2. 포트 충돌
```bash
# 포트 사용 확인
lsof -i :3000

# 다른 포트로 실행
npm run dev -- -p 3001
```

#### 3. Prisma 관련 오류
```bash
# Prisma 클라이언트 재생성
npx prisma generate --force

# 스키마 재적용
npx prisma db push --force-reset
```

#### 4. 의존성 오류
```bash
# 노드 모듈 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 정리
npm cache clean --force
```

## 📚 다음 단계

설치가 완료되면 다음 가이드들을 확인하세요:

1. [환경 설정](./ENVIRONMENT.md) - 상세 환경 설정
2. [어드민 시스템](./ADMIN.md) - 어드민 기능 사용법
3. [메인페이지 커스터마이징](./HOMEPAGE.md) - 홈페이지 설정
4. [배포 가이드](./DEPLOYMENT.md) - 프로덕션 배포

## 💡 팁

- **개발 중**: `npm run dev`로 개발 서버 실행
- **프로덕션 빌드**: `npm run build && npm start`
- **로그 확인**: `tail -f logs/app.log`
- **데이터베이스 백업**: `pg_dump my_platform_db > backup.sql`

설치 과정에서 문제가 발생하면 [문제 해결 가이드](./TROUBLESHOOTING.md)를 참조하거나 이슈를 등록해 주세요.