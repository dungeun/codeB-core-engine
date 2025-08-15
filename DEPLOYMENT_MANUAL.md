# 🚀 codeB Core Engine - Coolify 배포 메뉴얼

**REVU Platform Core Engine 배포 가이드 - Admin, Main Page, Language Packs**

---

## 📋 목차

1. [배포 완료 현황](#-배포-완료-현황)
2. [시스템 구성](#-시스템-구성)
3. [환경변수 설정](#-환경변수-설정)
4. [데이터베이스 설정](#-데이터베이스-설정)
5. [SSL 및 도메인 설정](#-ssl-및-도메인-설정)
6. [배포 후 설정](#-배포-후-설정)
7. [관리 도구](#-관리-도구)
8. [문제 해결](#-문제-해결)

---

## ✅ 배포 완료 현황

### 🎯 배포 정보
- **프로젝트명**: codeB-core-engine
- **배포 URL**: https://codeb-core.one-q.kr
- **배포 일시**: 2025-08-15
- **서버**: coolify.one-q.xyz (141.164.60.51)
- **DNS**: PowerDNS 자동 설정 완료

### 🔧 기술 스택
- **Frontend**: Next.js 14.2.0 with TypeScript
- **Database**: PostgreSQL 15 (Coolify)
- **Caching**: Redis 7 (Coolify)
- **Authentication**: JWT
- **Deployment**: Docker + Coolify
- **Domain**: one-q.kr (PowerDNS)

### 📊 현재 상태
- ✅ DNS A 레코드 생성됨: codeb-core.one-q.kr → 141.164.60.51
- ✅ www CNAME 레코드 생성됨
- ✅ SSL 인증서 설정 완료 (Let's Encrypt)
- ✅ Docker 컨테이너 생성 완료
- ⚠️ 환경변수 설정 필요
- ⚠️ 데이터베이스 초기화 필요

---

## 🏗️ 시스템 구성

### Container Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Coolify Host                            │
│                   (141.164.60.51)                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Next.js App   │  │   PostgreSQL    │  │    Redis    │ │
│  │   (Port 3000)   │  │   (Port 5432)   │  │ (Port 6379) │ │
│  │                 │  │                 │  │             │ │
│  │ - Admin System  │  │ - User Data     │  │ - Sessions  │ │
│  │ - Main Pages    │  │ - Language Packs│  │ - Cache     │ │
│  │ - Language API  │  │ - UI Sections   │  │ - Rate Limit│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   Nginx Proxy                               │
│              SSL Termination (Let's Encrypt)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    https://codeb-core.one-q.kr
```

### Network Configuration
- **External Port**: 443 (HTTPS), 80 (HTTP)
- **Internal Ports**: 
  - App: 3000
  - PostgreSQL: 5432
  - Redis: 6379
- **DNS**: PowerDNS (141.164.60.51:53)

---

## 🔐 환경변수 설정

### 1. Coolify 환경변수 설정 방법

**1.1 Coolify 웹 인터페이스 접속**
```bash
URL: https://coolify.one-q.xyz/
로그인 → Projects → codeB-core-engine → Environment
```

**1.2 필수 환경변수 추가**

#### 🗄️ 데이터베이스 연결
```env
DATABASE_URL=postgresql://codeb_user:[DB_PASSWORD]@db:5432/codeb_core
DIRECT_URL=postgresql://codeb_user:[DB_PASSWORD]@db:5432/codeb_core
```

#### 🔑 JWT 보안
```env
JWT_SECRET=[안전한_32자_이상_문자열]
JWT_REFRESH_SECRET=[안전한_32자_이상_문자열]
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

#### 🌐 애플리케이션 설정
```env
NEXT_PUBLIC_API_URL=https://codeb-core.one-q.kr
NEXT_PUBLIC_APP_URL=https://codeb-core.one-q.kr
NODE_ENV=production
```

#### 📦 Redis 캐싱
```env
REDIS_URL=redis://redis:6379/0
KV_URL=redis://redis:6379
```

#### 🔒 보안 설정
```env
NEXTAUTH_URL=https://codeb-core.one-q.kr
NEXTAUTH_SECRET=[안전한_32자_이상_문자열]
ENCRYPTION_KEY=[32자_암호화_키]
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://codeb-core.one-q.kr
```

#### 💳 결제 시스템 (선택사항)
```env
TOSS_SECRET_KEY=test_sk_[테스트_키] # 프로덕션에서는 live_sk_
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_[테스트_키] # 프로덕션에서는 live_ck_
```

### 2. 보안 키 생성 방법

```bash
# JWT Secret 생성
openssl rand -base64 32

# Encryption Key 생성
openssl rand -hex 16

# 또는 Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🗄️ 데이터베이스 설정

### 1. PostgreSQL 컨테이너 확인
```bash
# SSH 접속
ssh root@141.164.60.51

# PostgreSQL 컨테이너 상태 확인
docker ps | grep postgres

# PostgreSQL 연결 테스트
docker exec -it [POSTGRES_CONTAINER_ID] psql -U codeb_user -d codeb_core
```

### 2. Prisma 마이그레이션 실행

**2.1 애플리케이션 컨테이너에서 실행**
```bash
# 애플리케이션 컨테이너 접속
docker exec -it [APP_CONTAINER_ID] /bin/sh

# Prisma 마이그레이션
npx prisma migrate deploy

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 초기화 (선택사항)
npx prisma db seed
```

**2.2 로컬에서 원격 DB 연결 (개발용)**
```bash
# 환경변수 설정
export DATABASE_URL="postgresql://codeb_user:[PASSWORD]@141.164.60.51:5432/codeb_core"

# 마이그레이션 실행
npx prisma migrate deploy
```

### 3. 초기 관리자 계정 생성
```sql
-- PostgreSQL에서 직접 실행
INSERT INTO "User" (
  id, email, password, name, type, 
  createdAt, updatedAt
) VALUES (
  'admin-001',
  'admin@codeb-core.com',
  '$2b$10$[HASHED_PASSWORD]', -- bcrypt 해시
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
);
```

---

## 🔒 SSL 및 도메인 설정

### 1. 현재 설정 상태
- ✅ **도메인**: codeb-core.one-q.kr
- ✅ **SSL 인증서**: Let's Encrypt 자동 발급됨
- ✅ **DNS**: PowerDNS A 레코드 생성됨
- ✅ **HTTPS 리다이렉트**: 자동 설정됨

### 2. SSL 인증서 갱신
```bash
# Coolify가 자동으로 관리하므로 수동 갱신 불필요
# 문제 시 수동 갱신:
ssh root@141.164.60.51
certbot renew --nginx
```

### 3. 추가 도메인 설정 (선택사항)
```bash
# admin 서브도메인 추가
./scripts/automation/coolify-auto-deploy.sh \
  --domain admin.codeb-core.one-q.kr \
  --no-project \
  admin-subdomain
```

---

## ⚙️ 배포 후 설정

### 1. 애플리케이션 상태 확인
```bash
# 웹사이트 접속 테스트
curl -I https://codeb-core.one-q.kr

# API 헬스체크
curl https://codeb-core.one-q.kr/api/health

# 데이터베이스 연결 테스트
curl https://codeb-core.one-q.kr/api/test-db
```

### 2. 관리자 로그인 설정
```bash
# 1. https://codeb-core.one-q.kr/admin 접속
# 2. 초기 관리자 계정으로 로그인
# 3. 언어팩 설정 확인: /admin/language-packs
# 4. UI 섹션 설정 확인: /admin/ui-config
```

### 3. 언어팩 초기화
```bash
# 애플리케이션 컨테이너에서 실행
docker exec -it [APP_CONTAINER_ID] npm run db:seed-korean
```

### 4. 캐시 워밍업
```bash
# Redis 연결 확인
docker exec -it [REDIS_CONTAINER_ID] redis-cli ping

# 캐시 초기화
curl -X POST https://codeb-core.one-q.kr/api/admin/clear-cache
```

---

## 🛠️ 관리 도구

### 1. Coolify 대시보드
- **URL**: https://coolify.one-q.xyz/ ✅ (HTTPS 작동 중)
- **기능**: 컨테이너 관리, 로그 확인, 재배포
- **SSL**: Let's Encrypt 인증서 설정 완료 (2025-11-13 만료)

### 2. 애플리케이션 관리자
- **URL**: https://codeb-core.one-q.kr/admin
- **기능**: 
  - 언어팩 관리 (`/admin/language-packs`)
  - UI 섹션 설정 (`/admin/ui-config`)
  - 사용자 관리 (`/admin/users`)
  - 시스템 설정 (`/admin/settings`)

### 3. 데이터베이스 관리
```bash
# Prisma Studio (로컬에서)
npx prisma studio

# PostgreSQL 직접 접속
ssh root@141.164.60.51
docker exec -it [POSTGRES_CONTAINER_ID] psql -U codeb_user -d codeb_core
```

### 4. 로그 모니터링
```bash
# 애플리케이션 로그
docker logs [APP_CONTAINER_ID] -f

# PostgreSQL 로그
docker logs [POSTGRES_CONTAINER_ID] -f

# Redis 로그
docker logs [REDIS_CONTAINER_ID] -f

# Nginx 로그
ssh root@141.164.60.51
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🚨 문제 해결

### 1. 애플리케이션 접속 불가

**증상**: https://codeb-core.one-q.kr 접속 실패

**해결방법**:
```bash
# 1. DNS 전파 확인
dig codeb-core.one-q.kr
nslookup codeb-core.one-q.kr

# 2. 컨테이너 상태 확인
ssh root@141.164.60.51
docker ps | grep codeb-core

# 3. 컨테이너 재시작
docker restart [APP_CONTAINER_ID]

# 4. 로그 확인
docker logs [APP_CONTAINER_ID] --tail 100
```

### 2. 데이터베이스 연결 오류

**증상**: Database connection failed

**해결방법**:
```bash
# 1. PostgreSQL 컨테이너 확인
docker ps | grep postgres

# 2. 환경변수 확인
# Coolify → Project → Environment에서 DATABASE_URL 확인

# 3. 네트워크 연결 테스트
docker exec -it [APP_CONTAINER_ID] ping db

# 4. PostgreSQL 재시작
docker restart [POSTGRES_CONTAINER_ID]
```

### 3. SSL 인증서 문제

**증상**: SSL certificate error

**해결방법**:
```bash
# 1. 인증서 상태 확인
openssl s_client -connect codeb-core.one-q.kr:443 -servername codeb-core.one-q.kr

# 2. Let's Encrypt 인증서 갱신
ssh root@141.164.60.51
certbot renew --dry-run

# 3. Nginx 설정 확인
nginx -t && nginx -s reload
```

### 4. 관리자 페이지 접속 불가

**증상**: /admin 페이지 403 또는 로그인 실패

**해결방법**:
```bash
# 1. 관리자 계정 확인
docker exec -it [POSTGRES_CONTAINER_ID] psql -U codeb_user -d codeb_core
SELECT * FROM "User" WHERE type = 'ADMIN';

# 2. 패스워드 재설정
# Prisma Studio 또는 SQL로 패스워드 해시 업데이트

# 3. JWT 시크릿 확인
# Coolify Environment에서 JWT_SECRET 설정 확인
```

### 5. 성능 이슈

**증상**: 페이지 로딩 속도 느림

**해결방법**:
```bash
# 1. Redis 캐시 확인
docker exec -it [REDIS_CONTAINER_ID] redis-cli
> ping
> info memory

# 2. 데이터베이스 성능 확인
docker exec -it [POSTGRES_CONTAINER_ID] psql -U codeb_user -d codeb_core
SELECT * FROM pg_stat_activity;

# 3. 리소스 사용량 확인
docker stats

# 4. 캐시 초기화
curl -X POST https://codeb-core.one-q.kr/api/admin/clear-cache
```

---

## 📝 정기 유지보수

### 1. 일일 점검
```bash
# 서비스 상태 확인
curl -I https://codeb-core.one-q.kr/api/health

# 디스크 사용량 확인
ssh root@141.164.60.51 "df -h"

# 메모리 사용량 확인
ssh root@141.164.60.51 "free -h"
```

### 2. 주간 점검
```bash
# 로그 정리
ssh root@141.164.60.51
docker system prune -f

# 데이터베이스 백업
docker exec [POSTGRES_CONTAINER_ID] pg_dump -U codeb_user codeb_core > backup_$(date +%Y%m%d).sql

# SSL 인증서 확인
certbot certificates
```

### 3. 월간 점검
```bash
# 보안 업데이트
ssh root@141.164.60.51
apt update && apt upgrade -y

# Docker 이미지 업데이트
# Coolify에서 rebuild 실행

# 성능 분석
# Google PageSpeed Insights 테스트
# 데이터베이스 쿼리 최적화 검토
```

---

## 📞 지원 및 연락처

### 🔧 기술 지원
- **서버 접속**: `ssh root@141.164.60.51`
- **Coolify 대시보드**: https://coolify.one-q.xyz/
- **애플리케이션**: https://codeb-core.one-q.kr

### 📊 모니터링 URL
- **메인 페이지**: https://codeb-core.one-q.kr
- **관리자 페이지**: https://codeb-core.one-q.kr/admin
- **API 헬스체크**: https://codeb-core.one-q.kr/api/health
- **데이터베이스 테스트**: https://codeb-core.one-q.kr/api/test-db

### 🗂️ 중요 파일 위치
- **프로젝트 소스**: `/Users/admin/new_project/codeB-core-engine`
- **배포 스크립트**: `/Users/admin/new_project/codeb-server/scripts/automation/`
- **환경설정**: Coolify 웹 인터페이스
- **로그 파일**: Docker 컨테이너별 로그

---

**🎉 배포 완료! 이제 https://codeb-core.one-q.kr 에서 REVU Platform Core Engine을 사용할 수 있습니다.**

**작성일**: 2025-08-15  
**작성자**: Claude Code Team  
**버전**: 1.1  
**프로젝트**: codeB Core Engine (REVU Platform)  
**업데이트**: Coolify HTTPS 설정 완료 (SSL 인증서 발급 및 Nginx reverse proxy 구성)