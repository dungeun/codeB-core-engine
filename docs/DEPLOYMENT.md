# 🚀 배포 가이드

REVU Platform Core Engine을 프로덕션 환경에 배포하는 방법을 설명합니다.

## 🎯 배포 옵션

### 지원하는 배포 플랫폼
1. **Vercel** (권장) - Next.js 최적화
2. **Netlify** - JAMstack 지원
3. **Docker** - 컨테이너 배포
4. **AWS/GCP/Azure** - 클라우드 배포
5. **일반 서버** - Node.js 서버

## 🌟 Vercel 배포 (권장)

### 1. Vercel 계정 설정
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login
```

### 2. 프로젝트 연결
```bash
# 프로젝트 루트에서 실행
vercel

# 설정 과정
? Set up and deploy "~/my-platform"? [Y/n] y
? Which scope? your-team
? Link to existing project? [y/N] n
? What's your project's name? my-platform
? In which directory is your code located? ./
```

### 3. 환경 변수 설정
```bash
# Vercel Dashboard에서 설정하거나 CLI 사용
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET

# 또는 .env.production 파일 업로드
vercel env pull .env.production
```

### 4. 데이터베이스 설정

#### Supabase 연동
```bash
# Supabase 프로젝트 생성
npx supabase init

# 환경 변수 설정
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

#### Vercel Postgres 사용
```bash
# Vercel Dashboard에서 Postgres 스토리지 추가
# 자동으로 환경 변수 설정됨
```

### 5. Redis 설정

#### Vercel KV 사용
```bash
# Vercel Dashboard에서 KV 스토리지 추가
# 자동으로 환경 변수 설정됨
KV_URL
KV_REST_API_URL  
KV_REST_API_TOKEN
```

#### Upstash Redis 사용
```bash
# Upstash 계정 생성 및 데이터베이스 생성
REDIS_URL="redis://default:[PASSWORD]@[ENDPOINT]:6379"
```

### 6. 배포 실행
```bash
# 프로덕션 배포
vercel --prod

# 자동 배포 설정 (GitHub 연동)
# GitHub 저장소와 연결하면 푸시시 자동 배포
```

### 7. 도메인 설정
```bash
# 커스텀 도메인 추가
vercel domains add yourdomain.com

# DNS 설정
# A 레코드: 76.76.19.61
# CNAME: cname.vercel-dns.com
```

## 🐳 Docker 배포

### 1. Dockerfile 작성
```dockerfile
# 이미 포함된 Dockerfile 사용
FROM node:18-alpine AS base

# 의존성 설치
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 프로덕션
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### 2. Docker Compose 설정
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: platform_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3. 배포 실행
```bash
# 프로덕션 빌드
docker-compose -f docker-compose.prod.yml up --build -d

# 데이터베이스 마이그레이션
docker-compose exec app npx prisma db push

# 로그 확인
docker-compose logs -f app
```

## ☁️ AWS 배포

### 1. EC2 인스턴스 설정
```bash
# EC2 접속
ssh -i "keypair.pem" ubuntu@your-ec2-ip

# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2
```

### 2. 애플리케이션 배포
```bash
# 코드 클론
git clone https://github.com/your-repo/my-platform.git
cd my-platform

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.production
nano .env.production

# 빌드
npm run build

# PM2로 실행
pm2 start npm --name "my-platform" -- start
pm2 startup
pm2 save
```

### 3. RDS/ElastiCache 연동
```bash
# RDS PostgreSQL 엔드포인트
DATABASE_URL="postgresql://username:password@rds-endpoint:5432/database"

# ElastiCache Redis 엔드포인트  
REDIS_URL="redis://elasticache-endpoint:6379"
```

### 4. Load Balancer 설정
```yaml
# ALB 설정 (Terraform 예시)
resource "aws_lb" "app" {
  name               = "my-platform-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  subnets           = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "app" {
  name     = "my-platform-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path = "/api/health"
  }
}
```

## 🌐 일반 서버 배포

### 1. Nginx 설정
```nginx
# /etc/nginx/sites-available/my-platform
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. SSL 인증서 설정
```bash
# Let's Encrypt 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com

# 자동 갱신 설정
sudo crontab -e
# 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. 방화벽 설정
```bash
# UFW 방화벽 설정
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw deny 3000  # 직접 접근 차단
```

## 📊 모니터링 설정

### 1. 애플리케이션 모니터링
```bash
# PM2 모니터링
pm2 monit

# 로그 확인
pm2 logs my-platform

# 메모리/CPU 사용량
pm2 show my-platform
```

### 2. 외부 모니터링 서비스

#### Sentry 오류 추적
```typescript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  {
    // Next.js config
  },
  {
    org: 'your-org',
    project: 'my-platform',
    authToken: process.env.SENTRY_AUTH_TOKEN
  }
)
```

#### Uptime 모니터링
```bash
# 환경 변수 추가
SENTRY_DSN="your-sentry-dsn"
UPTIME_ROBOT_API_KEY="your-uptime-robot-key"
```

### 3. 로그 관리
```bash
# 로그 로테이션 설정
# /etc/logrotate.d/my-platform
/home/ubuntu/my-platform/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0644 ubuntu ubuntu
    postrotate
        pm2 reload my-platform
    endscript
}
```

## 🔒 보안 설정

### 1. 환경 변수 보안
```bash
# 강력한 비밀번호 생성
openssl rand -base64 32

# 환경 변수 파일 권한 설정
chmod 600 .env.production
```

### 2. 네트워크 보안
```bash
# 데이터베이스 접근 제한
# PostgreSQL: pg_hba.conf 설정
# Redis: bind 127.0.0.1 설정

# 불필요한 포트 차단
sudo ufw deny 5432  # PostgreSQL
sudo ufw deny 6379  # Redis
```

### 3. 애플리케이션 보안
```typescript
// 보안 헤더 설정
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

## 🚀 성능 최적화

### 1. CDN 설정
```bash
# Vercel의 경우 자동 CDN
# CloudFlare 설정
# - DNS 레코드를 CloudFlare로 변경
# - 캐시 규칙 설정
# - 이미지 최적화 활성화
```

### 2. 데이터베이스 최적화
```sql
-- 인덱스 생성
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_applications_campaign_id ON applications(campaign_id);

-- 쿼리 최적화
EXPLAIN ANALYZE SELECT * FROM campaigns WHERE status = 'ACTIVE';
```

### 3. 캐시 전략
```typescript
// Redis 캐시 설정
const cacheConfig = {
  campaigns: { ttl: 600 },      // 10분
  users: { ttl: 1800 },         // 30분
  ui_config: { ttl: 3600 }      // 1시간
}
```

## 📋 배포 체크리스트

### 배포 전 확인사항
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 적용
- [ ] Redis 연결 확인
- [ ] 파일 업로드 경로 설정
- [ ] 외부 API 키 설정
- [ ] 도메인 및 SSL 인증서 설정

### 배포 후 확인사항
- [ ] 애플리케이션 정상 실행 확인
- [ ] 로그인/회원가입 테스트
- [ ] 어드민 시스템 접근 확인
- [ ] API 엔드포인트 테스트
- [ ] 이메일 발송 테스트
- [ ] 모니터링 알림 설정

### 성능 확인
- [ ] 페이지 로딩 속도 확인
- [ ] 데이터베이스 응답 시간 확인
- [ ] 메모리 사용량 모니터링
- [ ] CDN 캐시 적용 확인

## 🔧 배포 스크립트

### 자동 배포 스크립트
```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 Starting deployment..."

# 코드 업데이트
git pull origin main

# 의존성 설치
npm ci

# 데이터베이스 마이그레이션
npx prisma db push

# 빌드
npm run build

# PM2 재시작
pm2 reload my-platform

echo "✅ Deployment completed!"
```

### GitHub Actions 배포
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🆘 트러블슈팅

### 일반적인 배포 문제

#### 1. 빌드 실패
```bash
# 메모리 부족 오류
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 타입 오류 확인
npm run type-check
```

#### 2. 데이터베이스 연결 오류
```bash
# 연결 테스트
npx prisma db push --preview-feature

# SSL 연결 확인
DATABASE_URL="postgresql://...?sslmode=require"
```

#### 3. 환경 변수 누락
```bash
# 환경 변수 검증
node scripts/validate-env.js

# 필수 변수 확인
echo $DATABASE_URL
echo $JWT_SECRET
```

배포 관련 추가 문제는 [문제 해결 가이드](./TROUBLESHOOTING.md)를 참조하세요.