# Coolify 배포 설정 완료

## 🚀 배포 정보

### 프로젝트 정보
- **프로젝트 이름**: codeB-core-engine
- **프로젝트 UUID**: go4ogsg0sccsgkg0c4cg00ks
- **GitHub 리포지토리**: https://github.com/dungeun/codeB-core-engine

### 애플리케이션 정보
- **애플리케이션 이름**: codeB-core-engine-app
- **애플리케이션 UUID**: msocsw4g0cg8088kgwkokc4k
- **빌드 팩**: nixpacks
- **포트**: 3000

### 데이터베이스 정보
- **데이터베이스 이름**: codeb-core-db
- **데이터베이스 UUID**: voow08ko8woc48co44w488s4
- **데이터베이스 URL**: postgres://codeb_user:codeb_secure_pass_2025@voow08ko8woc48co44w488s4:5432/codeb_core

### 환경변수 (설정 완료)
- DATABASE_URL ✅
- DIRECT_URL ✅
- JWT_SECRET ✅
- NEXTAUTH_URL ✅
- NEXTAUTH_SECRET ✅
- NODE_ENV ✅
- UPLOAD_DIR ✅

### Post Deployment Command
```bash
npx prisma db push && npx prisma generate
```

## ⚠️ 다음 단계 (Coolify 웹 인터페이스에서 설정)

### 1. 도메인 설정
1. https://coolify.one-q.xyz 접속
2. Projects → codeB-core-engine → codeB-core-engine-app
3. Settings → Domains
4. `https://codeb-core.one-q.kr` 추가
5. Save 클릭

### 2. GitHub Webhook 설정 (자동 배포)
1. Applications → codeB-core-engine-app → Settings
2. Source → GitHub Webhook URL 복사
3. GitHub 리포지토리 → Settings → Webhooks → Add webhook
4. Payload URL에 Coolify Webhook URL 붙여넣기
5. Content type: application/json
6. Events: Push events 선택
7. Active 체크 → Add webhook

### 3. 배포 확인
1. Deployments 탭에서 배포 상태 확인
2. 배포 완료 후 https://codeb-core.one-q.kr 접속
3. 관리자 계정 생성 및 로그인

## 📝 배포 로그 확인
- 현재 배포 UUID: s0s0soc488w8ks88ww88wg0s
- 배포 상태: 진행 중
- 로그 확인: Coolify → Deployments → Show Debug Logs

## 🔧 문제 해결
- 배포 실패 시: Deployments → Redeploy
- 환경변수 수정: Environment → 수정 후 Redeploy
- 데이터베이스 연결 실패: PostgreSQL 컨테이너 상태 확인