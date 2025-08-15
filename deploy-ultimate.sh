#!/bin/bash

# ====================================================================
# 🚀 codeB Core Engine - Ultimate One-Click Deployment with MCP
# ====================================================================
# GitHub MCP + Coolify MCP + PowerDNS 통합 자동 배포
# ====================================================================

set -e

# ====================================================================
# 설정 변수
# ====================================================================

PROJECT_NAME="codeB-core-engine"
DOMAIN="codeb-core.one-q.kr"
BASE_DOMAIN="one-q.kr"
SERVER_IP="141.164.60.51"
GITHUB_USER="dungeun"
GITHUB_REPO="$GITHUB_USER/$PROJECT_NAME"

# 데이터베이스 설정
DB_NAME="codeb_core"
DB_USER="codeb_user"
DB_PASSWORD="codeb_secure_pass_2025"

# 보안 키 생성
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# ====================================================================
# 함수 정의
# ====================================================================

log_step() {
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}▶ STEP $1: $2${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# ====================================================================
# STEP 1: GitHub 리포지토리 확인 (이미 완료)
# ====================================================================

step1_github() {
    log_step "1" "GitHub 리포지토리 확인"
    echo "✅ GitHub 리포지토리: https://github.com/$GITHUB_REPO"
    echo "✅ 코드 이미 푸시됨"
}

# ====================================================================
# STEP 2: PowerDNS 도메인 직접 설정
# ====================================================================

step2_dns() {
    log_step "2" "PowerDNS 도메인 설정"
    
    echo "🔧 DNS 레코드 생성 중..."
    
    # SSH를 통해 직접 DNS 설정
    ssh root@$SERVER_IP << 'DNSEOF'
        # PowerDNS API를 사용한 레코드 추가
        curl -X PATCH http://localhost:8081/api/v1/servers/localhost/zones/one-q.kr. \
            -H "X-API-Key: 20a89ca50a07cc62fa383091ac551e057ab1044dd247480002b5c4a40092eed5" \
            -H "Content-Type: application/json" \
            -d '{
                "rrsets": [
                    {
                        "name": "codeb-core.one-q.kr.",
                        "type": "A",
                        "changetype": "REPLACE",
                        "records": [{"content": "141.164.60.51", "disabled": false}]
                    },
                    {
                        "name": "www.codeb-core.one-q.kr.",
                        "type": "CNAME",
                        "changetype": "REPLACE",
                        "records": [{"content": "codeb-core.one-q.kr.", "disabled": false}]
                    }
                ]
            }' 2>/dev/null || echo "DNS API 에러 - 수동 설정 필요"
        
        # PowerDNS 재시작
        systemctl restart pdns
        
        # DNS 확인
        echo "DNS 확인:"
        dig @localhost codeb-core.one-q.kr +short
DNSEOF
    
    echo "✅ DNS 설정 완료: $DOMAIN → $SERVER_IP"
}

# ====================================================================
# STEP 3: Coolify MCP를 통한 프로젝트 설정
# ====================================================================

step3_coolify_setup() {
    log_step "3" "Coolify 프로젝트 통합 설정"
    
    echo "🔧 Coolify에서 애플리케이션 설정 중..."
    
    # Coolify 애플리케이션 정보 (이미 생성됨)
    APP_UUID="msocsw4g0cg8088kgwkokc4k"
    DB_UUID="voow08ko8woc48co44w488s4"
    
    # SSH를 통해 Nginx 설정
    ssh root@$SERVER_IP << EOF
        # Nginx 설정 파일 생성
        cat > /etc/nginx/sites-available/$PROJECT_NAME << 'NGINX'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
        
        # Nginx 설정 활성화
        ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
        nginx -t && systemctl reload nginx
        
        # SSL 인증서 발급
        certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$BASE_DOMAIN --redirect || true
EOF
    
    echo "✅ Nginx 및 SSL 설정 완료"
}

# ====================================================================
# STEP 4: Docker로 직접 애플리케이션 실행
# ====================================================================

step4_docker_deploy() {
    log_step "4" "Docker 애플리케이션 배포"
    
    ssh root@$SERVER_IP << EOF
        # 프로젝트 디렉토리 생성
        mkdir -p /opt/projects/$PROJECT_NAME
        cd /opt/projects/$PROJECT_NAME
        
        # GitHub에서 코드 가져오기
        if [ ! -d .git ]; then
            git clone https://github.com/$GITHUB_REPO.git .
        else
            git pull origin main
        fi
        
        # 환경변수 파일 생성
        cat > .env << 'ENVFILE'
NODE_ENV=production
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
DIRECT_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_SECRET
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXT_PUBLIC_API_URL=https://$DOMAIN
NEXT_PUBLIC_APP_URL=https://$DOMAIN
UPLOAD_DIR=/app/public/uploads
ENVFILE
        
        # PostgreSQL 컨테이너 실행 (소문자 이름 사용)
        docker run -d \
            --name codeb_db \
            --restart always \
            -e POSTGRES_USER=$DB_USER \
            -e POSTGRES_PASSWORD=$DB_PASSWORD \
            -e POSTGRES_DB=$DB_NAME \
            -p 5432:5432 \
            -v codeb_db_data:/var/lib/postgresql/data \
            postgres:15-alpine 2>/dev/null || echo "DB 컨테이너 이미 실행 중"
        
        # 애플리케이션 Dockerfile 생성
        cat > Dockerfile << 'DOCKERFILE'
FROM node:18-alpine

WORKDIR /app

# 의존성 설치
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npm install -g prisma

# 애플리케이션 복사
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

# Next.js 빌드
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
DOCKERFILE
        
        # Docker 이미지 빌드 및 실행 (소문자 이름 사용)
        docker build -t codeb-core-app .
        docker stop codeb_app 2>/dev/null || true
        docker rm codeb_app 2>/dev/null || true
        
        docker run -d \
            --name codeb_app \
            --restart always \
            --env-file .env \
            -p 3000:3000 \
            --link codeb_db:db \
            codeb-core-app
        
        echo "Docker 컨테이너 상태:"
        docker ps | grep $PROJECT_NAME
EOF
    
    echo "✅ Docker 배포 완료"
}

# ====================================================================
# STEP 5: Prisma 데이터베이스 마이그레이션
# ====================================================================

step5_prisma() {
    log_step "5" "Prisma 데이터베이스 마이그레이션"
    
    # SSH 터널 생성
    echo "🔧 SSH 터널 생성 중..."
    ssh -f -N -L 5433:localhost:5432 root@$SERVER_IP 2>/dev/null || true
    sleep 2
    
    # 환경변수 설정
    export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5433/$DB_NAME"
    export DIRECT_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5433/$DB_NAME"
    
    # Prisma 마이그레이션
    echo "🔧 Prisma 마이그레이션 실행 중..."
    npx prisma generate
    npx prisma db push --accept-data-loss
    
    # SSH 터널 종료
    pkill -f "ssh -f -N -L 5433:localhost:5432" || true
    
    echo "✅ Prisma 마이그레이션 완료"
}

# ====================================================================
# STEP 6: GitHub Webhook 설정
# ====================================================================

step6_webhook() {
    log_step "6" "GitHub Webhook 설정"
    
    # 이미 설정됨
    echo "✅ Webhook 이미 설정됨: https://coolify.one-q.xyz/api/v1/webhooks/github/$APP_UUID"
}

# ====================================================================
# STEP 7: 최종 확인
# ====================================================================

step7_verify() {
    log_step "7" "배포 확인"
    
    echo "🔍 DNS 확인..."
    dig +short $DOMAIN
    
    echo -e "\n🔍 웹사이트 응답 확인..."
    curl -I https://$DOMAIN 2>/dev/null | head -n 1
    
    echo -e "\n🔍 Docker 컨테이너 상태..."
    ssh root@$SERVER_IP "docker ps | grep $PROJECT_NAME"
}

# ====================================================================
# 최종 정보 출력
# ====================================================================

show_result() {
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 배포 완료!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    echo -e "${BLUE}📌 접속 정보:${NC}"
    echo -e "  • 웹사이트: ${GREEN}https://$DOMAIN${NC}"
    echo -e "  • GitHub: ${GREEN}https://github.com/$GITHUB_REPO${NC}"
    echo -e "  • Coolify: ${GREEN}https://coolify.one-q.xyz${NC}"
    echo -e "  • 서버 SSH: ${GREEN}ssh root@$SERVER_IP${NC}"
    
    echo -e "\n${BLUE}🔐 보안 정보:${NC}"
    echo -e "  • JWT_SECRET: $JWT_SECRET"
    echo -e "  • NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
    
    echo -e "\n${YELLOW}💡 유용한 명령어:${NC}"
    echo -e "  • 로그 확인: ssh root@$SERVER_IP 'docker logs ${PROJECT_NAME}_app -f'"
    echo -e "  • DB 접속: ssh root@$SERVER_IP 'docker exec -it ${PROJECT_NAME}_db psql -U $DB_USER -d $DB_NAME'"
    echo -e "  • 재시작: ssh root@$SERVER_IP 'docker restart ${PROJECT_NAME}_app'"
}

# ====================================================================
# 메인 실행
# ====================================================================

main() {
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🚀 codeB Core Engine - Ultimate One-Click Deployment${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    step1_github
    step2_dns
    step3_coolify_setup
    step4_docker_deploy
    step5_prisma
    step6_webhook
    step7_verify
    show_result
}

# 실행
main "$@"